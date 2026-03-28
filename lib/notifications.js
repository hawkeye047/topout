export function requestNotificationPermission() {
  if (!('Notification' in window)) return Promise.resolve('unsupported');
  if (Notification.permission === 'granted') return Promise.resolve('granted');
  if (Notification.permission === 'denied') return Promise.resolve('denied');
  return Notification.requestPermission();
}

export function sendBrowserNotification(title, body, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: tag || 'topout',
    });
  } catch {}
}

// Check schedule for items that should trigger notifications
export function checkScheduleAlerts(data) {
  if (!data?.phases) return [];
  const alerts = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  data.phases.forEach((phase) => {
    phase.activities.forEach((act) => {
      const start = new Date(act.start);
      const end = new Date(act.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      // Activity starting tomorrow
      if (start.getTime() === tomorrow.getTime() && act.status === 'not-started') {
        alerts.push({
          id: `start-${act.name}-${act.start}`,
          type: 'upcoming',
          title: 'Starting Tomorrow',
          body: `${act.name} — ${act.owner}`,
          phase: phase.name,
          activity: act.name,
          date: act.start,
          priority: 'medium',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }

      // Activity ending today (milestone alert)
      if (end.getTime() === today.getTime() && act.status !== 'complete') {
        alerts.push({
          id: `due-${act.name}-${act.end}`,
          type: 'due-today',
          title: 'Due Today',
          body: `${act.name} — ${act.owner}`,
          phase: phase.name,
          activity: act.name,
          date: act.end,
          priority: 'high',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }

      // Delayed — end date is past but not complete
      if (end < today && act.status !== 'complete') {
        const daysLate = Math.ceil((today - end) / 86400000);
        alerts.push({
          id: `delayed-${act.name}-${act.end}`,
          type: 'delayed',
          title: `${daysLate} Day${daysLate > 1 ? 's' : ''} Behind`,
          body: `${act.name} — ${act.owner}`,
          phase: phase.name,
          activity: act.name,
          date: act.end,
          priority: 'critical',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }

      // Milestone coming up this week
      const milestoneKeywords = ['completion', 'inspection', 'approval', 'move-in', 'substantial', 'tco'];
      const isMilestone = milestoneKeywords.some((kw) => act.name.toLowerCase().includes(kw));
      if (isMilestone && start > today && start <= nextWeek) {
        alerts.push({
          id: `milestone-${act.name}-${act.start}`,
          type: 'milestone',
          title: 'Milestone This Week',
          body: `${act.name} — ${formatDateShort(act.start)}`,
          phase: phase.name,
          activity: act.name,
          date: act.start,
          priority: 'high',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    });
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  alerts.sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3));

  return alerts;
}

function formatDateShort(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
