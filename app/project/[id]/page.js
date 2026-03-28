'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ProjectGate from '@/components/ProjectGate';
import TopBar from '@/components/TopBar';
import StatsBar from '@/components/StatsBar';
import SubFilterBar from '@/components/SubFilterBar';
import TimelineView from '@/components/TimelineView';
import ListView from '@/components/ListView';
import NotificationPanel from '@/components/NotificationPanel';
import DailyLogPanel from '@/components/DailyLogPanel';
import ShareModal from '@/components/ShareModal';
import InstallPrompt from '@/components/InstallPrompt';
import { getProject, saveProject } from '@/lib/dataModel';
import { calcStats } from '@/lib/utils';
import { checkScheduleAlerts, requestNotificationPermission, sendBrowserNotification } from '@/lib/notifications';

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

  // Load project
  useEffect(() => {
    const p = getProject(params.id);
    if (p) setProject(p);
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
      return next;
    });
  }, [filteredData, role, subFilter]);

  const handleDailyLogSave = useCallback((updatedProject) => {
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

  return (
    <ProjectGate project={project}>
      {(gateRole) => {
        const activeRole = gateRole || role;
        const isReadOnly = gateRole === 'owner';

        return (
          <div className="min-h-screen bg-surface">
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

            {/* View toggle */}
            <div className="px-6 pb-4 flex items-center justify-between">
              <div className="flex bg-surface-container-highest p-1 rounded-sm">
                {[
                  { key: 'timeline', label: 'Timeline' },
                  { key: 'list', label: 'List' },
                ].map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setView(v.key)}
                    className={`
                      flex items-center gap-2 px-6 py-2 text-xs font-bold font-headline
                      uppercase tracking-widest transition-colors duration-100
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

            {filteredData && view === 'timeline' && (
              <TimelineView data={filteredData} onStatusChange={isReadOnly ? () => {} : handleStatusChange} />
            )}
            {filteredData && view === 'list' && (
              <ListView data={filteredData} onStatusChange={isReadOnly ? () => {} : handleStatusChange} />
            )}

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
