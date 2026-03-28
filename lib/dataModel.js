// lib/dataModel.js
// Project data model — single source of truth
// Designed for localStorage now, easy migration to Supabase later

const PROJECTS_INDEX_KEY = 'topout_projects_index';
const PROJECT_PREFIX = 'topout_project_';

// --- ID generation ---

function generateId() {
  return Math.random().toString(36).substring(2, 8);
}

function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateActivityId(phaseIndex, actIndex) {
  return `A${(phaseIndex + 1) * 1000 + actIndex * 10}`;
}

// --- Project CRUD ---

export function createProject(name, scheduleData) {
  const id = generateId();
  const now = new Date().toISOString();

  // Enrich activities with V2 fields
  const phases = (scheduleData.phases || []).map((phase, pi) => ({
    ...phase,
    activities: phase.activities.map((act, ai) => ({
      id: generateActivityId(pi, ai),
      name: act.name,
      start: act.start,
      end: act.end,
      actualStart: act.status === 'in-progress' || act.status === 'complete' ? act.start : null,
      actualEnd: act.status === 'complete' ? act.end : null,
      projectedEnd: act.end,
      duration: act.duration,
      status: act.status || 'not-started',
      percentComplete: act.status === 'complete' ? 100 : act.status === 'in-progress' ? 50 : 0,
      owner: act.owner || '',
      notes: act.notes || '',
      budgetedCost: 0,
      actualCost: 0,
      delayDays: 0,
      delayCause: null,
      isCriticalPath: false,
      predecessors: [],
    })),
  }));

  const project = {
    id,
    name: name || scheduleData.projectName || 'Untitled Project',
    password: generatePin(),
    ownerPassword: generatePin(),
    createdAt: now,
    updatedAt: now,

    schedule: {
      projectStart: scheduleData.projectStart,
      projectEnd: scheduleData.projectEnd,
      projectedEnd: scheduleData.projectEnd,
      totalBudget: scheduleData.totalBudget || 0,
      projectedBudget: scheduleData.totalBudget || 0,
      phases,
    },

    dailyLogs: [],
    changeOrders: [],
    delays: [],
    notifications: [],
  };

  saveProject(project);
  _addToIndex(id, project.name, now);

  return project;
}

export function getProject(id) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROJECT_PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProject(project) {
  if (typeof window === 'undefined') return;
  project.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(PROJECT_PREFIX + project.id, JSON.stringify(project));
    _updateIndex(project.id, project.name, project.updatedAt);
  } catch (e) {
    console.error('Failed to save project:', e);
  }
}

export function deleteProject(id) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROJECT_PREFIX + id);
  _removeFromIndex(id);
}

export function listProjects() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROJECTS_INDEX_KEY);
    const index = raw ? JSON.parse(raw) : [];
    // Enrich with activity count from actual data
    return index.map((entry) => {
      const project = getProject(entry.id);
      const activityCount = project
        ? project.schedule.phases.reduce((sum, p) => sum + p.activities.length, 0)
        : 0;
      return { ...entry, activityCount };
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch {
    return [];
  }
}

// --- Index helpers (private) ---

function _getIndex() {
  try {
    const raw = localStorage.getItem(PROJECTS_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function _saveIndex(index) {
  localStorage.setItem(PROJECTS_INDEX_KEY, JSON.stringify(index));
}

function _addToIndex(id, name, updatedAt) {
  const index = _getIndex();
  if (!index.find((e) => e.id === id)) {
    index.push({ id, name, updatedAt });
    _saveIndex(index);
  }
}

function _updateIndex(id, name, updatedAt) {
  const index = _getIndex();
  const entry = index.find((e) => e.id === id);
  if (entry) {
    entry.name = name;
    entry.updatedAt = updatedAt;
    _saveIndex(index);
  } else {
    _addToIndex(id, name, updatedAt);
  }
}

function _removeFromIndex(id) {
  const index = _getIndex().filter((e) => e.id !== id);
  _saveIndex(index);
}

// --- Session auth helpers ---

const SESSION_KEY = 'topout_session';

export function getSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(projectId, role) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ projectId, role, ts: Date.now() }));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}

export function verifyPassword(project, code) {
  if (!project || !code) return null;
  if (code === project.password) return 'gc';
  if (code === project.ownerPassword) return 'owner';
  return null;
}

// --- Daily log helpers ---

export function addDailyLog(project, log) {
  const entry = {
    id: generateId(),
    date: log.date || new Date().toISOString().split('T')[0],
    author: log.author || 'GC',
    rawInput: log.rawInput,
    parsedUpdates: log.parsedUpdates || [],
    weather: log.weather || '',
    crewCount: log.crewCount || 0,
    createdAt: new Date().toISOString(),
    confirmed: false,
  };
  project.dailyLogs.unshift(entry);
  return entry;
}

export function applyDailyLogUpdates(project, logId) {
  const log = project.dailyLogs.find((l) => l.id === logId);
  if (!log || log.confirmed) return;

  for (const update of log.parsedUpdates) {
    for (const phase of project.schedule.phases) {
      const act = phase.activities.find((a) => a.id === update.activityId || a.name === update.activityName);
      if (act) {
        if (update.newStatus) act.status = update.newStatus;
        if (update.percentComplete != null) act.percentComplete = update.percentComplete;
        if (update.note) act.notes = update.note;
        if (update.delayFlag) {
          act.delayDays = update.delayDays || 0;
          act.delayCause = update.delayCause || null;
        }
        break;
      }
    }
  }

  log.confirmed = true;
}

// --- Change order helpers ---

export function addChangeOrder(project, co) {
  const count = project.changeOrders.length + 1;
  const entry = {
    id: generateId(),
    number: `CO-${String(count).padStart(3, '0')}`,
    date: co.date || new Date().toISOString().split('T')[0],
    description: co.description,
    reason: co.reason || 'owner-change',
    costImpact: co.costImpact || 0,
    scheduleImpact: co.scheduleImpact || 0,
    affectedActivities: co.affectedActivities || [],
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  project.changeOrders.unshift(entry);
  return entry;
}

// --- Delay helpers ---

export function addDelay(project, delay) {
  const entry = {
    id: generateId(),
    activityId: delay.activityId,
    activityName: delay.activityName,
    detectedDate: delay.detectedDate || new Date().toISOString().split('T')[0],
    delayDays: delay.delayDays || 0,
    cause: delay.cause || 'other',
    causeDetail: delay.causeDetail || '',
    responsibleParty: delay.responsibleParty || '',
    costImpact: delay.costImpact || 0,
    downstreamActivities: delay.downstreamActivities || [],
    resolved: false,
    resolvedDate: null,
  };
  project.delays.unshift(entry);
  return entry;
}

// --- Migration helper (convert V1 data to V2 project) ---

export function migrateV1Data(v1Data) {
  if (!v1Data || !v1Data.phases) return null;
  return createProject(v1Data.projectName, v1Data);
}
