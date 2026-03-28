'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ProjectGate from '@/components/ProjectGate';
import TopBar from '@/components/TopBar';
import StatsBar from '@/components/StatsBar';
import SubFilterBar from '@/components/SubFilterBar';
import TimelineView from '@/components/TimelineView';
import ListView from '@/components/ListView';
import DelayTracker from '@/components/DelayTracker';
import CostDashboard from '@/components/CostDashboard';
import NotificationPanel from '@/components/NotificationPanel';
import DailyLogPanel from '@/components/DailyLogPanel';
import ShareModal from '@/components/ShareModal';
import FloatingActionButton from '@/components/FloatingActionButton';
import InstallPrompt from '@/components/InstallPrompt';
import { getProject, saveProject, addDelay } from '@/lib/dataModel';
import { detectDelays, propagateDelays } from '@/lib/delays';
import { calcStats } from '@/lib/utils';
import { checkScheduleAlerts, sendBrowserNotification } from '@/lib/notifications';

export default function ProjectPage() {
  const params = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('gc');
  const [view, setView] = useState('timeline');
  const [subFilter, setSubFilter] = useState('all');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showDailyLog, setShowDailyLog] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Load project + run delay detection
  useEffect(() => {
    const p = getProject(params.id);
    if (p) {
      // Run delay detection on load
      const newDelays = detectDelays(p);
      for (const d of newDelays) {
        addDelay(p, d);
      }
      propagateDelays(p);
      if (newDelays.length > 0) saveProject(p);
      setProject(p);
    }
    setLoading(false);
  }, [params.id]);

  // Auto-save on changes
  useEffect(() => {
    if (project) saveProject(project);
  }, [project]);

  // Check for schedule alerts
  useEffect(() => {
    if (!project) return;
    const scheduleData = {
      projectStart: project.schedule.projectStart,
      projectEnd: project.schedule.projectEnd,
      phases: project.schedule.phases,
    };
    const alerts = checkScheduleAlerts(scheduleData);
    if (alerts.length > 0) {
      setProject((prev) => {
        const existingIds = new Set((prev.notifications || []).map((n) => n.id));
        const newAlerts = alerts.filter((a) => !existingIds.has(a.id));
        if (newAlerts.length > 0) {
          const critical = newAlerts.filter((a) => a.priority === 'critical');
          critical.forEach((a) => sendBrowserNotification(a.title, a.body, a.id));
          return { ...prev, notifications: [...newAlerts, ...(prev.notifications || [])] };
        }
        return prev;
      });
    }
  }, [project?.schedule]);

  // Build a V1-compatible data object for existing components
  const scheduleView = useMemo(() => {
    if (!project) return null;
    return {
      projectName: project.name,
      projectStart: project.schedule.projectStart,
      projectEnd: project.schedule.projectEnd,
      totalBudget: project.schedule.totalBudget,
      phases: project.schedule.phases,
    };
  }, [project]);

  const stats = useMemo(() => calcStats(scheduleView), [scheduleView]);

  const filteredData = useMemo(() => {
    if (!scheduleView) return null;
    if (role === 'sub' && subFilter !== 'all') {
      return {
        ...scheduleView,
        phases: scheduleView.phases
          .map((p) => ({ ...p, activities: p.activities.filter((a) => a.owner === subFilter) }))
          .filter((p) => p.activities.length > 0),
      };
    }
    return scheduleView;
  }, [scheduleView, role, subFilter]);

  const handleStatusChange = useCallback((phaseIdx, actIdx, newStatus) => {
    setProject((prev) => {
      const next = JSON.parse(JSON.stringify(prev));

      if (filteredData && role === 'sub' && subFilter !== 'all') {
        const filteredPhase = filteredData.phases[phaseIdx];
        const filteredAct = filteredPhase.activities[actIdx];
        for (const phase of next.schedule.phases) {
          const act = phase.activities.find((a) => a.name === filteredAct.name && a.start === filteredAct.start);
          if (act) {
            act.status = newStatus;
            if (newStatus === 'complete') { act.percentComplete = 100; act.actualEnd = new Date().toISOString().split('T')[0]; }
            if (newStatus === 'in-progress' && !act.actualStart) { act.actualStart = new Date().toISOString().split('T')[0]; }
            break;
          }
        }
      } else {
        const act = next.schedule.phases[phaseIdx].activities[actIdx];
        act.status = newStatus;
        if (newStatus === 'complete') { act.percentComplete = 100; act.actualEnd = new Date().toISOString().split('T')[0]; }
        if (newStatus === 'in-progress' && !act.actualStart) { act.actualStart = new Date().toISOString().split('T')[0]; }
      }

      // Re-run delay detection after status change
      const newDelays = detectDelays(next);
      for (const d of newDelays) addDelay(next, d);
      propagateDelays(next);

      return next;
    });
  }, [filteredData, role, subFilter]);

  const handleDailyLogSave = useCallback((updatedProject) => {
    // Run delay detection after daily log
    const newDelays = detectDelays(updatedProject);
    for (const d of newDelays) addDelay(updatedProject, d);
    propagateDelays(updatedProject);
    saveProject(updatedProject);
    setProject(updatedProject);
  }, []);

  const handleResolveDelay = useCallback((delay) => {
    setProject((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const d = next.delays.find((x) => x.activityId === delay.activityId && !x.resolved);
      if (d) {
        d.resolved = true;
        d.resolvedDate = new Date().toISOString().split('T')[0];
      }
      // Clear delay status on the activity if it's back on track
      for (const phase of next.schedule.phases) {
        const act = phase.activities.find((a) => a.id === delay.activityId);
        if (act && act.status === 'delayed') {
          act.status = 'in-progress';
          act.delayDays = 0;
          act.delayCause = null;
        }
      }
      propagateDelays(next);
      return next;
    });
  }, []);

  const handleProjectUpdate = useCallback((updatedProject) => {
    setProject(updatedProject);
  }, []);

  const handleReset = () => {
    window.location.href = '/';
  };

  const notifications = project?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id) => {
    setProject((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const clearAllNotifs = () => {
    setProject((prev) => ({ ...prev, notifications: [] }));
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-6 h-6 border-2 border-transparent border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
        <div className="w-16 h-16 bg-surface-container-highest flex items-center justify-center mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b7c8e1" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h2 className="font-headline font-extrabold text-xl text-on-surface uppercase tracking-tight mb-2">
          Project Not Found
        </h2>
        <p className="text-secondary text-sm mb-8">This project may have been deleted or the link is incorrect.</p>
        <a href="/" className="btn-primary">Back to Projects</a>
      </div>
    );
  }

  const VIEW_TABS = [
    { key: 'timeline', label: 'Timeline' },
    { key: 'list', label: 'List' },
    { key: 'delays', label: 'Delays' },
    { key: 'cost', label: 'Cost' },
  ];

  return (
    <ProjectGate project={project}>
      {(gateRole) => {
        const activeRole = gateRole || role;
        const isReadOnly = gateRole === 'owner';

        return (
          <div className="min-h-screen bg-surface pb-20">
            <TopBar
              projectName={project.name}
              role={activeRole}
              onRoleChange={isReadOnly ? () => {} : setRole}
              notifCount={unreadCount}
              onNotifToggle={() => setShowNotifs(!showNotifs)}
              onReset={handleReset}
              onShare={() => setShowShare(true)}
              onDailyLog={isReadOnly ? null : () => setShowDailyLog(true)}
              isReadOnly={isReadOnly}
            />

            {activeRole === 'sub' && stats && (
              <SubFilterBar subs={stats.subs} activeFilter={subFilter} onFilterChange={setSubFilter} />
            )}

            <StatsBar stats={stats} data={scheduleView} />

            {/* 4-View Toggle */}
            <div className="px-6 pb-4 flex items-center justify-between">
              <div className="flex bg-surface-container-highest p-1 rounded-sm overflow-x-auto no-scrollbar">
                {VIEW_TABS.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setView(v.key)}
                    className={`
                      flex items-center gap-2 px-4 md:px-6 py-2 text-xs font-bold font-headline
                      uppercase tracking-widest transition-colors duration-100 whitespace-nowrap
                      ${view === v.key
                        ? 'bg-surface text-primary'
                        : 'text-secondary hover:bg-surface-container-low'}
                    `}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-secondary font-bold uppercase tracking-wider hidden sm:block">
                {activeRole === 'owner' && 'Owner view — milestones & progress'}
                {activeRole === 'gc' && 'GC view — full schedule control'}
                {activeRole === 'sub' && 'Sub view — your trade scope'}
              </div>
            </div>

            {/* Views */}
            {filteredData && view === 'timeline' && (
              <TimelineView data={filteredData} onStatusChange={isReadOnly ? () => {} : handleStatusChange} />
            )}
            {filteredData && view === 'list' && (
              <ListView data={filteredData} onStatusChange={isReadOnly ? () => {} : handleStatusChange} />
            )}
            {view === 'delays' && (
              <DelayTracker project={project} onResolveDelay={handleResolveDelay} isReadOnly={isReadOnly} />
            )}
            {view === 'cost' && (
              <CostDashboard project={project} onProjectUpdate={handleProjectUpdate} isReadOnly={isReadOnly} />
            )}

            {/* FAB — Daily Log trigger (GC only) */}
            {!isReadOnly && !showDailyLog && (
              <FloatingActionButton onClick={() => setShowDailyLog(true)} />
            )}

            {/* Panels */}
            {showNotifs && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setShowNotifs(false)}
                onMarkRead={markRead}
                onClearAll={clearAllNotifs}
              />
            )}

            {showDailyLog && (
              <DailyLogPanel
                project={project}
                onClose={() => setShowDailyLog(false)}
                onSave={handleDailyLogSave}
              />
            )}

            {showShare && (
              <ShareModal project={project} onClose={() => setShowShare(false)} />
            )}

            <InstallPrompt />
          </div>
        );
      }}
    </ProjectGate>
  );
}
