// lib/delays.js
// Auto-detection + cascade logic for schedule delays

/**
 * Detect delays across all activities in a project.
 * Called on dashboard load and after daily log confirmation.
 * Returns array of new delay entries to add.
 */
export function detectDelays(project) {
  if (!project?.schedule?.phases) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newDelays = [];
  const existingDelayIds = new Set((project.delays || []).map((d) => `${d.activityId}-${d.detectedDate}`));

  for (const phase of project.schedule.phases) {
    for (const act of phase.activities) {
      const plannedEnd = new Date(act.end);
      plannedEnd.setHours(0, 0, 0, 0);

      // Auto-flag: past planned end and not complete
      if (today > plannedEnd && act.status !== 'complete') {
        const delayDays = Math.ceil((today - plannedEnd) / 86400000);
        const key = `${act.id}-${today.toISOString().split('T')[0]}`;

        // Only create if we don't already have an active delay for this activity
        const hasExistingDelay = (project.delays || []).some(
          (d) => d.activityId === act.id && !d.resolved
        );

        if (!hasExistingDelay && !existingDelayIds.has(key)) {
          // Update the activity itself
          act.status = 'delayed';
          act.delayDays = delayDays;
          act.projectedEnd = new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0]; // estimate +3 days from now

          newDelays.push({
            activityId: act.id,
            activityName: act.name,
            detectedDate: today.toISOString().split('T')[0],
            delayDays,
            cause: act.delayCause || 'other',
            causeDetail: act.delayCause || 'Auto-detected: past planned end date',
            responsibleParty: act.owner,
            costImpact: 0,
            downstreamActivities: findDownstream(project, act.id),
            resolved: false,
            resolvedDate: null,
          });
        } else if (hasExistingDelay) {
          // Update existing delay days
          const existing = (project.delays || []).find((d) => d.activityId === act.id && !d.resolved);
          if (existing) {
            existing.delayDays = delayDays;
            act.delayDays = delayDays;
          }
        }
      }
    }
  }

  return newDelays;
}

/**
 * Find downstream activities affected by a delay.
 * Checks predecessor relationships and overlapping date ranges.
 */
function findDownstream(project, activityId) {
  const downstream = [];
  const delayedAct = findActivity(project, activityId);
  if (!delayedAct) return downstream;

  for (const phase of project.schedule.phases) {
    for (const act of phase.activities) {
      if (act.id === activityId) continue;

      // Check explicit predecessors
      if (act.predecessors && act.predecessors.includes(activityId)) {
        downstream.push(act.id);
        continue;
      }

      // Check if this activity starts after or overlaps with the delayed one
      const actStart = new Date(act.start);
      const delayedEnd = new Date(delayedAct.end);
      if (actStart >= delayedEnd && act.owner === delayedAct.owner) {
        downstream.push(act.id);
      }
    }
  }

  return downstream;
}

/**
 * Find an activity by ID across all phases.
 */
function findActivity(project, activityId) {
  for (const phase of project.schedule.phases) {
    const act = phase.activities.find((a) => a.id === activityId);
    if (act) return act;
  }
  return null;
}

/**
 * Propagate delays downstream: shift projected end dates for affected activities.
 */
export function propagateDelays(project) {
  const unresolvedDelays = (project.delays || []).filter((d) => !d.resolved);

  for (const delay of unresolvedDelays) {
    for (const downId of delay.downstreamActivities || []) {
      const act = findActivity(project, downId);
      if (act && act.status !== 'complete') {
        const originalEnd = new Date(act.end);
        const projected = new Date(originalEnd.getTime() + delay.delayDays * 86400000);
        act.projectedEnd = projected.toISOString().split('T')[0];
      }
    }
  }

  // Recalculate project projected end
  let maxEnd = new Date(project.schedule.projectEnd);
  for (const phase of project.schedule.phases) {
    for (const act of phase.activities) {
      const end = new Date(act.projectedEnd || act.end);
      if (end > maxEnd) maxEnd = end;
    }
  }
  project.schedule.projectedEnd = maxEnd.toISOString().split('T')[0];
}

/**
 * Get delay summary stats for the dashboard.
 */
export function getDelaySummary(project) {
  const delays = (project.delays || []).filter((d) => !d.resolved);
  const totalDelayDays = delays.reduce((sum, d) => sum + d.delayDays, 0);

  const originalEnd = new Date(project.schedule.projectEnd);
  const projectedEnd = new Date(project.schedule.projectedEnd || project.schedule.projectEnd);
  const projectDelayDays = Math.max(0, Math.ceil((projectedEnd - originalEnd) / 86400000));

  // Cause breakdown
  const causeCounts = {};
  for (const d of delays) {
    causeCounts[d.cause] = (causeCounts[d.cause] || 0) + 1;
  }
  const total = delays.length || 1;
  const causeBreakdown = Object.entries(causeCounts)
    .map(([cause, count]) => ({ cause, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);

  // Estimated cost impact: rough calc based on extended general conditions
  // ~$2,500/day for a $1.5M project
  const dailyGcRate = (project.schedule.totalBudget || 1500000) * 0.0017;
  const estimatedCostImpact = Math.round(projectDelayDays * dailyGcRate);

  return {
    delayedActivities: delays.length,
    totalDelayDays,
    projectDelayDays,
    originalEnd: project.schedule.projectEnd,
    projectedEnd: project.schedule.projectedEnd || project.schedule.projectEnd,
    estimatedCostImpact,
    causeBreakdown,
    delays,
  };
}

export const CAUSE_LABELS = {
  'prior-trade': 'Prior Trade',
  'material-delay': 'Material Delay',
  'labor-shortage': 'Labor Shortage',
  'design-change': 'Design Change',
  'rfi-pending': 'RFI Pending',
  'inspection-failure': 'Inspection Failure',
  'owner-decision': 'Owner Decision',
  'weather': 'Weather',
  'other': 'Other',
};

export const CAUSE_COLORS = {
  'prior-trade': '#ffc174',
  'material-delay': '#ffb4ab',
  'labor-shortage': '#bfcde6',
  'design-change': '#a855f7',
  'rfi-pending': '#38bdf8',
  'inspection-failure': '#ef4444',
  'owner-decision': '#f59e0b',
  'weather': '#2dd4bf',
  'other': '#b7c8e1',
};
