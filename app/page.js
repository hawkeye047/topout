'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import UploadScreen from '@/components/UploadScreen';
import TopBar from '@/components/TopBar';
import StatsBar from '@/components/StatsBar';
import SubFilterBar from '@/components/SubFilterBar';
import TimelineView from '@/components/TimelineView';
import ListView from '@/components/ListView';
import NotificationPanel from '@/components/NotificationPanel';
import InstallPrompt from '@/components/InstallPrompt';
import { DEMO_DATA } from '@/lib/demoData';
import { saveSchedule, loadSchedule, clearSchedule, savePrefs, loadPrefs, saveNotifications, loadNotifications } from '@/lib/storage';
import { calcStats } from '@/lib/utils';
import { checkScheduleAlerts, requestNotificationPermission, sendBrowserNotification } from '@/lib/notifications';

export default function HomePage() {
  const [data, setData] = useState(null);
  const [role, setRole] = useState('gc');
  const [view, setView] = useState('timeline');
  const [subFilter, setSubFilter] = useState('all');
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = loadSchedule();
    if (saved) setData(saved);

    const prefs = loadPrefs();
    if (prefs.role) setRole(prefs.role);
    if (prefs.view) setView(prefs.view);

    const notifs = loadNotifications();
    if (notifs.length) setNotifications(notifs);

    setHydrated(true);
  }, []);

  // Persist schedule changes
  useEffect(() => {
    if (hydrated && data) saveSchedule(data);
  }, [data, hydrated]);

  // Persist prefs
  useEffect(() => {
    if (hydrated) savePrefs({ role, view });
  }, [role, view, hydrated]);

  // Check for schedule alerts
  useEffect(() => {
    if (!data) return;
    const alerts = checkScheduleAlerts(data);
    if (alerts.length > 0) {
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newAlerts = alerts.filter((a) => !existingIds.has(a.id));
        if (newAlerts.length > 0) {
          // Send browser notification for critical items
          const critical = newAlerts.filter((a) => a.priority === 'critical');
          critical.forEach((a) => {
            sendBrowserNotification(a.title, a.body, a.id);
          });
          const merged = [...newAlerts, ...prev];
          saveNotifications(merged);
          return merged;
        }
        return prev;
      });
    }
  }, [data]);

  // Stats
  const stats = useMemo(() => calcStats(data), [data]);

  // Filtered data based on role and sub filter
  const filteredData = useMemo(() => {
    if (!data) return null;
    let filtered = data;

    if (role === 'sub' && subFilter !== 'all') {
      filtered = {
        ...data,
        phases: data.phases
          .map((p) => ({
            ...p,
            activities: p.activities.filter((a) => a.owner === subFilter),
          }))
          .filter((p) => p.activities.length > 0),
      };
    }

    return filtered;
  }, [data, role, subFilter]);

  // Status change handler
  const handleStatusChange = useCallback((phaseIdx, actIdx, newStatus) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));

      // Find the correct phase in the original data
      // Since filteredData may have different indices, we need to map back
      if (filteredData && role === 'sub' && subFilter !== 'all') {
        const filteredPhase = filteredData.phases[phaseIdx];
        const filteredAct = filteredPhase.activities[actIdx];
        // Find in original data
        for (let pi = 0; pi < next.phases.length; pi++) {
          for (let ai = 0; ai < next.phases[pi].activities.length; ai++) {
            const orig = next.phases[pi].activities[ai];
            if (orig.name === filteredAct.name && orig.start === filteredAct.start) {
              next.phases[pi].activities[ai].status = newStatus;
              return next;
            }
          }
        }
      } else {
        next.phases[phaseIdx].activities[actIdx].status = newStatus;
      }
      return next;
    });
  }, [filteredData, role, subFilter]);

  // Load schedule
  const handleLoad = (parsed) => {
    setData(parsed);
    requestNotificationPermission();
  };

  // Load demo
  const handleDemo = () => {
    setData(JSON.parse(JSON.stringify(DEMO_DATA)));
    requestNotificationPermission();
  };

  // Reset
  const handleReset = () => {
    setData(null);
    setSubFilter('all');
    setNotifications([]);
    clearSchedule();
    saveNotifications([]);
  };

  // Mark notification read
  const markRead = (id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(next);
      return next;
    });
  };

  // Clear all notifications
  const clearAllNotifs = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // --- RENDER ---
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-6 h-6 border-2 border-transparent border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <>
        <UploadScreen onLoad={handleLoad} onDemo={handleDemo} />
        <InstallPrompt />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopBar
        projectName={data.projectName}
        role={role}
        onRoleChange={setRole}
        notifCount={unreadCount}
        onNotifToggle={() => setShowNotifs(!showNotifs)}
        onReset={handleReset}
      />

      {/* Sub filter bar */}
      {role === 'sub' && stats && (
        <SubFilterBar subs={stats.subs} activeFilter={subFilter} onFilterChange={setSubFilter} />
      )}

      {/* Stats */}
      <StatsBar stats={stats} data={data} />

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

        {/* Role context hint */}
        <div className="text-[10px] text-secondary font-bold uppercase tracking-wider hidden sm:block">
          {role === 'owner' && 'Owner view — milestones & progress'}
          {role === 'gc' && 'GC view — full schedule control'}
          {role === 'sub' && 'Sub view — your trade scope'}
        </div>
      </div>

      {/* Content */}
      {filteredData && view === 'timeline' && (
        <TimelineView data={filteredData} onStatusChange={handleStatusChange} />
      )}
      {filteredData && view === 'list' && (
        <ListView data={filteredData} onStatusChange={handleStatusChange} />
      )}

      {/* Notification Panel */}
      {showNotifs && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifs(false)}
          onMarkRead={markRead}
          onClearAll={clearAllNotifs}
        />
      )}

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
