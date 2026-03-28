// lib/criticalPath.js
// Critical path analysis, impact prediction, at-risk detection

/**
 * Analyze the critical path by finding the longest chain of activities.
 * Since we don't have full predecessor data for all activities,
 * we use a heuristic: activities are chained by phase order and date overlap.
 */
export function analyzeCriticalPath(project) {
  if (!project?.schedule?.phases) return [];

  const allActivities = [];
  for (const phase of project.schedule.phases) {
    for (const act of phase.activities) {
      allActivities.push(act);
    }
  }

  // Build a simple dependency graph based on date ordering and explicit predecessors
  const byEnd = [...allActivities].sort((a, b) => new Date(a.end) - new Date(b.end));

  // Find the longest path (simplified: chain by latest-finishing activities per window)
  const criticalIds = new Set();

  // Walk backwards from project end to find the chain
  let currentEnd = new Date(project.schedule.projectEnd);
  const used = new Set();

  for (let pass = 0; pass < allActivities.length; pass++) {
    let best = null;
    let bestEnd = null;

    for (const act of allActivities) {
      if (used.has(act.id)) continue;
      const actEnd = new Date(act.projectedEnd || act.end);
      const actStart = new Date(act.start);

      // Activity must end at or before current window end
      if (actEnd <= currentEnd || pass === 0) {
        if (!best || actEnd > bestEnd || (actEnd.getTime() === bestEnd?.getTime() && act.duration > best.duration)) {
          best = act;
          bestEnd = actEnd;
        }
      }
    }

    if (best) {
      criticalIds.add(best.id);
      used.add(best.id);
      currentEnd = new Date(best.start);
      best.isCriticalPath = true;
    } else {
      break;
    }
  }

  // Mark all activities
  for (const act of allActivities) {
    act.isCriticalPath = criticalIds.has(act.id);
  }

  return allActivities.filter((a) => a.isCriticalPath);
}

/**
 * Predict impact of adding X days to an activity.
 */
export function predictImpact(project, activityId, additionalDays) {
  const criticalActivities = analyzeCriticalPath(project);
  const act = criticalActivities.find((a) => a.id === activityId);

  if (!act) {
    return { onCriticalPath: false, projectImpactDays: 0, affectedActivities: [] };
  }

  // If on critical path, every day added shifts the project
  const affected = [];
  const actEnd = new Date(act.projectedEnd || act.end);
  for (const phase of project.schedule.phases) {
    for (const a of phase.activities) {
      if (a.id === activityId) continue;
      const aStart = new Date(a.start);
      if (aStart >= actEnd && a.status !== 'complete') {
        affected.push({ id: a.id, name: a.name, owner: a.owner });
      }
    }
  }

  return {
    onCriticalPath: true,
    projectImpactDays: additionalDays,
    affectedActivities: affected,
  };
}

/**
 * Get activities on the critical path that are trending behind.
 * An activity is "at risk" if its percent complete is less than
 * what we'd expect given the elapsed time.
 */
export function getAtRiskActivities(project) {
  const criticalActivities = analyzeCriticalPath(project);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const atRisk = [];

  for (const act of criticalActivities) {
    if (act.status === 'complete') continue;

    const start = new Date(act.start);
    const end = new Date(act.end);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (today < start) continue; // hasn't started yet (by date)

    const totalDuration = Math.max(1, (end - start) / 86400000);
    const elapsed = Math.min(totalDuration, (today - start) / 86400000);
    const expectedPct = Math.round((elapsed / totalDuration) * 100);
    const actualPct = act.percentComplete || 0;
    const gap = expectedPct - actualPct;

    if (gap > 15) { // more than 15% behind expected
      const daysAtRisk = Math.round((gap / 100) * totalDuration);
      atRisk.push({
        id: act.id,
        name: act.name,
        owner: act.owner,
        expectedPct,
        actualPct,
        gap,
        daysAtRisk,
        projectedEnd: act.projectedEnd || act.end,
      });
    }
  }

  return atRisk;
}

/**
 * Get overall critical path status.
 */
export function getCriticalPathStatus(project) {
  const atRisk = getAtRiskActivities(project);
  const totalRiskDays = atRisk.reduce((sum, a) => sum + a.daysAtRisk, 0);
  const criticalCount = analyzeCriticalPath(project).length;

  return {
    onTrack: atRisk.length === 0,
    atRiskCount: atRisk.length,
    totalRiskDays,
    criticalCount,
    atRiskActivities: atRisk,
  };
}
