import fs from 'fs';
import path from 'path';
import { jobs } from '../stores/jobsStore';
import { tasks } from '../stores/tasksStore';
import { artifacts } from '../stores/artifactsStore';
import { agents } from '../stores/agentsStore';
import { auditEvents } from '../stores/auditStore';
import { runs } from '../stores/runsStore';
import { blueprints } from '../stores/blueprintsStore';

const DEBOUNCE_MS = 600;

/** Resolved absolute path; reads process.env.STATE_DIR on each call for tests. */
export function getStateDir(): string {
  return process.env.STATE_DIR ? path.resolve(process.env.STATE_DIR) : path.join(process.cwd(), '.state');
}

let persistTimer: NodeJS.Timeout | undefined;

function writeJson(file: string, data: unknown) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

export function schedulePersistAll() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistAll();
  }, DEBOUNCE_MS);
}

export function persistAll() {
  const STATE_DIR = getStateDir();
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });

  writeJson(path.join(STATE_DIR, 'jobs.json'), Array.from(jobs.values()));
  writeJson(path.join(STATE_DIR, 'tasks.json'), Array.from(tasks.values()));
  writeJson(path.join(STATE_DIR, 'artifacts.json'), Array.from(artifacts.values()));
  writeJson(path.join(STATE_DIR, 'agents.json'), Array.from(agents.values()));
  writeJson(path.join(STATE_DIR, 'auditEvents.json'), Array.from(auditEvents.values()));
  writeJson(path.join(STATE_DIR, 'runs.json'), Array.from(runs.values()));
  writeJson(path.join(STATE_DIR, 'blueprints.json'), Array.from(blueprints.values()));
}

export function flushPersistTimer() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = undefined;
  persistAll();
}

export function hydrateAll() {
  const STATE_DIR = getStateDir();
  if (!fs.existsSync(STATE_DIR)) return;

  const tryHydrate = <T extends { id: string }>(file: string, map: Map<string, T>, mapKey?: (item: T) => string) => {
    const full = path.join(STATE_DIR, file);
    if (!fs.existsSync(full)) return;
    const raw = fs.readFileSync(full, 'utf-8');
    const items = JSON.parse(raw) as T[];
    map.clear();
    for (const item of items) {
      const key = mapKey ? mapKey(item) : item.id;
      map.set(key, item);
    }
  };

  tryHydrate('jobs.json', jobs);
  tryHydrate('tasks.json', tasks);
  tryHydrate('artifacts.json', artifacts);
  tryHydrate('agents.json', agents);
  tryHydrate('auditEvents.json', auditEvents);
  tryHydrate('runs.json', runs);
  tryHydrate('blueprints.json', blueprints);
}

