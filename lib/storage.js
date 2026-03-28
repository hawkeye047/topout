const STORAGE_KEY = 'topout_schedule';
const NOTIFICATIONS_KEY = 'topout_notifications';
const PREFS_KEY = 'topout_prefs';

export function saveSchedule(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      _updatedAt: new Date().toISOString(),
    }));
    return true;
  } catch {
    return false;
  }
}

export function loadSchedule() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSchedule() {
  localStorage.removeItem(STORAGE_KEY);
}

export function saveNotifications(notifications) {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch {}
}

export function loadNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : { role: 'gc', view: 'timeline' };
  } catch {
    return { role: 'gc', view: 'timeline' };
  }
}
