import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import {
  getAgents,
  getBlueprint,
  getBlueprints,
  getEnvironments,
  getTasks,
  getAuditEvents,
  getJobArtifacts,
  adminCancelBlueprint,
  adminPauseBlueprint,
  adminResumeBlueprint,
  adminSetRunEnvironment,
  API_BASE_URL,
  type AgentInstance,
  type Blueprint,
  type AuditEvent,
  type Task,
  type Job,
  type Artifact
} from '../lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ route, navigation }) => {
  const { projectId, blueprintId } = route.params;

  const [loading, setLoading] = useState(true);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [agents, setAgents] = useState<AgentInstance[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [envs, setEnvs] = useState<{ id: string; name: string }[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<string>('dev');
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const [blueprintsForProject, setBlueprintsForProject] = useState<Blueprint[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  const [finalDeliveryLoading, setFinalDeliveryLoading] = useState(false);
  const [finalDelivery, setFinalDelivery] = useState<{
    artifactSummaries: { type: string; summary: string }[];
    deploymentCounts: { envId: string; envName: string; count: number }[];
    defectSummary: { failed: number; cancelled: number; sampleErrors: string[] };
    releaseNotes: string[];
  } | null>(null);
  const finalDeliveryKeyRef = useRef<string | null>(null);

  const refreshLock = useRef<number | null>(null);
  const jobIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    jobIdsRef.current = new Set(jobs.map((j) => j.id));
  }, [jobs]);

  const derived = useMemo(() => {
    const total = jobs.length || 1;
    const failed = jobs.filter((j) => j.status === 'failed').length;
    const cancelled = jobs.filter((j) => j.status === 'cancelled').length;
    const completed = jobs.filter((j) => j.status === 'completed').length;
    const successRate = Math.max(0, Math.round((completed / total) * 1000) / 10);
    const running = jobs.filter((j) => j.status === 'running' || j.status === 'queued' || j.status === 'planning').length;
    return { failed, cancelled, completed, total, successRate, running };
  }, [jobs]);

  const runId = jobs.find((j) => j.executionRunId)?.executionRunId;

  function formatTime(iso: string | null | undefined) {
    if (!iso) return '—';
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return '—';
    const d = new Date(t);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const refreshSessionsAndTimeline = async () => {
    const [bpRes, auditRes] = await Promise.all([getBlueprints(), getAuditEvents()]);
    setBlueprintsForProject(
      bpRes.blueprints
        .filter((b) => b.projectId === projectId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    );
    setAuditEvents(auditRes.auditEvents);
  };

  const refresh = async () => {
    const now = Date.now();
    if (refreshLock.current && now - refreshLock.current < 500) return;
    refreshLock.current = now;

    const [bpRes, agentRes, tasksRes, envRes] = await Promise.all([
      getBlueprint(blueprintId),
      getAgents(),
      getTasks(),
      getEnvironments()
    ]);

    setBlueprint(bpRes.blueprint);
    setJobs(bpRes.jobs);
    setAgents(agentRes.agents);
    setTasks(tasksRes.tasks);
    setEnvs(envRes.environments);

    const inferredEnv = bpRes.jobs.find((j) => j.environment)?.environment;
    if (inferredEnv) setSelectedEnv(inferredEnv);
  };

  // Load everything and then prefer SSE updates where available.
  useEffect(() => {
    let alive = true;

    async function init() {
      try {
        setLoading(true);
        setRefreshError(null);
        await Promise.all([refresh(), refreshSessionsAndTimeline()]);
      } catch (e: any) {
        if (!alive) return;
        setRefreshError(e?.message ?? String(e));
      } finally {
        if (alive) setLoading(false);
      }
    }

    init();

    let interval: any = null;
    if (typeof (globalThis as any).EventSource !== 'undefined') {
      const es = new (globalThis as any).EventSource(`${API_BASE_URL}/api/stream`);

      const onJob = (ev: any) => {
        try {
          const data = JSON.parse(ev.data);
          if (data?.blueprintId && data.blueprintId !== blueprintId) return;
          setJobs((prev) =>
            prev.map((j) =>
              j.id === data.jobId ? { ...j, status: data.status, workflowPhase: data.workflowPhase } : j
            )
          );
        } catch {
          // ignore
        }
      };

      const onTask = (ev: any) => {
        try {
          const data = JSON.parse(ev.data);
          if (!data?.jobId || !data?.taskId) return;
          if (!jobIdsRef.current.has(String(data.jobId))) return;

          setTasks((prev) =>
            prev.map((t) =>
              t.id === data.taskId
                ? {
                    ...t,
                    status: data.status ?? t.status,
                    attemptCount: typeof data.attemptCount === 'number' ? data.attemptCount : t.attemptCount
                  }
                : t
            )
          );
        } catch {
          // ignore
        }
      };

      const onRun = () => {
        Promise.all([refresh(), refreshSessionsAndTimeline()]).catch(() => null);
      };

      es.addEventListener('job.updated', onJob);
      es.addEventListener('task.updated', onTask);
      es.addEventListener('run.finalized', onRun);
      es.addEventListener('blueprint.updated', onRun);

      return () => {
        alive = false;
        es.close();
      };
    }

    interval = setInterval(() => refresh().catch(() => null), 2000);
    return () => clearInterval(interval);
  }, [blueprintId, projectId]);

  const progressSegments = useMemo(() => {
    const done = derived.completed;
    const total = derived.total;
    const running = derived.running;
    const todo = Math.max(0, total - done - running);
    return { done, running, todo, total };
  }, [derived]);

  const agentTiles = useMemo(() => {
    const byType = new Map<string, AgentInstance>();
    agents.forEach((a) => byType.set(a.agentType, a));

    const activeStatuses = new Set<Task['status']>(['pending', 'planning', 'running', 'blocked', 'retrying']);
    const order = [
      ['architecture', 'Architecture'],
      ['coding', 'Coding'],
      ['testing', 'Testing'],
      ['debugging', 'Debugging'],
      ['devops', 'DevOps'],
      ['security', 'Security'],
      ['documentation', 'Docs'],
      ['release', 'Release']
    ] as const;

    return order.map(([type, label]) => {
      const a = byType.get(type);
      const loadCount = tasks.filter((t) => t.agentType === type && activeStatuses.has(t.status)).length;
      return { type, label, status: a?.status ?? 'idle', loadCount };
    });
  }, [agents, tasks]);

  const jobLanes = useMemo(() => {
    const laneDefs: Array<{ status: Job['status']; label: string }> = [
      { status: 'pending', label: 'Pending' },
      { status: 'planning', label: 'Planning' },
      { status: 'queued', label: 'Queued' },
      { status: 'running', label: 'Running' },
      { status: 'blocked', label: 'Blocked' },
      { status: 'retrying', label: 'Retrying' },
      { status: 'failed', label: 'Failed' },
      { status: 'cancelled', label: 'Cancelled' },
      { status: 'completed', label: 'Completed' }
    ];

    return laneDefs.map((l) => {
      const laneJobs = jobs.filter((j) => j.status === l.status).sort((a, b) => a.lineNumber - b.lineNumber);
      return { ...l, count: laneJobs.length, jobs: laneJobs.slice(0, 3) };
    });
  }, [jobs]);

  const lineByJobId = useMemo(() => {
    const m = new Map<string, number>();
    jobs.forEach((j) => m.set(j.id, j.lineNumber));
    return m;
  }, [jobs]);

  const filteredTimeline = useMemo(() => {
    const jobIds = new Set(jobs.map((j) => j.id));
    const taskIds = new Set(tasks.map((t) => t.id));
    const runIds = runId ? new Set([runId]) : new Set<string>();

    const filtered = auditEvents.filter((e) => {
      const rel = e.relatedEntity;
      if (!rel) return false;
      if (rel.type === 'blueprint' && rel.id === blueprintId) return true;
      if (rel.type === 'job' && jobIds.has(rel.id)) return true;
      if (rel.type === 'task' && taskIds.has(rel.id)) return true;
      if (rel.type === 'run' && runIds.has(rel.id)) return true;
      return false;
    });

    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 14);
  }, [auditEvents, blueprintId, jobs, runId, tasks]);

  // Best-effort final delivery aggregation (artifact summaries, deployment status, defect + release notes).
  useEffect(() => {
    const status = blueprint?.status;
    const isTerminal = status === 'completed' || status === 'failed' || status === 'cancelled';
    if (!isTerminal) return;

    const key = `${blueprintId}:${status}`;
    if (finalDeliveryKeyRef.current === key) return;
    finalDeliveryKeyRef.current = key;

    let alive = true;
    async function run() {
      try {
        setFinalDeliveryLoading(true);
        setFinalDelivery(null);

        const artifactsByJob = await Promise.all(
          jobs.map((j) => getJobArtifacts(j.id).catch(() => ({ artifacts: [] as Artifact[] })))
        );
        if (!alive) return;

        const artifacts = artifactsByJob.flatMap((x) => x.artifacts);
        const tasksById = new Map(tasks.map((t) => [t.id, t]));

        const artifactSummaries = artifacts
          .filter((a) => typeof a.metadata?.summary === 'string' && a.metadata.summary.trim().length > 0)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, 10)
          .map((a) => ({ type: a.type, summary: a.metadata.summary as string }));

        const deploymentCounts = envs.map((e) => ({
          envId: e.id,
          envName: e.name,
          count: jobs.filter((j) => j.environment === e.id && (j.workflowPhase === 'deployment' || j.workflowPhase === 'verification')).length
        }));

        const failed = jobs.filter((j) => j.status === 'failed').length;
        const cancelled = jobs.filter((j) => j.status === 'cancelled').length;
        const sampleErrors = jobs.filter((j) => j.lastError).slice(0, 3).map((j) => j.lastError as string);

        const releaseNotesArtifacts = artifacts
          .filter((a) => {
            const task = tasksById.get(a.taskId);
            return task?.agentType === 'release' || task?.agentType === 'documentation';
          })
          .filter((a) => typeof a.metadata?.summary === 'string' && a.metadata.summary.trim().length > 0)
          .slice(0, 6);

        const releaseNotes = releaseNotesArtifacts.map((a) => a.metadata.summary as string);

        if (!alive) return;
        setFinalDelivery({
          artifactSummaries,
          deploymentCounts,
          defectSummary: { failed, cancelled, sampleErrors },
          releaseNotes
        });
      } finally {
        if (alive) setFinalDeliveryLoading(false);
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [blueprint?.status, blueprintId, envs, jobs, tasks]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Control Center</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blueprint Sessions Rail</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.rail}>
              {blueprintsForProject.map((b) => {
                const active = b.id === blueprintId;
                const incident = b.status === 'failed' || b.status === 'cancelled';
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[
                      styles.railChip,
                      active ? styles.railChipActive : undefined,
                      incident ? styles.railChipAlert : undefined
                    ]}
                    onPress={() => navigation.navigate('Dashboard', { projectId, blueprintId: b.id })}
                  >
                    <Text style={[styles.railChipText, active ? styles.railChipTextActive : undefined]} numberOfLines={1}>
                      {b.name || 'Blueprint'}
                    </Text>
                    <Text style={styles.railChipSubtle} numberOfLines={1}>
                      {b.status}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={styles.row}>
          <View style={styles.healthCard}>
            <Text style={styles.cardLabel}>Overall Success</Text>
            <Text style={styles.cardValue}>{derived.failed > 0 ? 'Degraded' : 'Stable'}</Text>
            <Text style={styles.cardSubtle}>{derived.successRate}% success rate</Text>
          </View>
          <View style={styles.healthCard}>
            <Text style={styles.cardLabel}>Active Incidents</Text>
            <Text style={styles.cardValueAlert}>{derived.failed}</Text>
            <Text style={styles.cardSubtle}>{derived.running} active jobs</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agent Tiles</Text>
          <View style={styles.agentGrid}>
            {agentTiles.map((a) => (
              <View key={a.type} style={styles.agentTile}>
                <Text style={styles.agentName}>{a.label}</Text>
                <Text style={styles.agentStatus}>{a.status}</Text>
                <Text style={styles.agentMeta}>{a.loadCount} active tasks</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Queue Overview</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.lanesRow}>
              {jobLanes.map((l) => (
                <View key={l.status} style={styles.laneCard}>
                  <Text style={styles.laneLabel}>{l.label}</Text>
                  <Text style={[styles.laneValue, l.status === 'failed' ? styles.laneValueAlert : undefined]}>{l.count}</Text>
                  <Text style={styles.laneSubtle} numberOfLines={2}>
                    {l.jobs.length ? l.jobs.map((j) => `L${j.lineNumber}`).join(', ') : '—'}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blueprint Run</Text>
          <View style={styles.blueprintCard}>
            <Text style={styles.cardLabel}>{blueprint?.name ?? 'Blueprint'}</Text>
            <Text style={styles.cardSubtle}>
              {derived.completed} / {derived.total} completed • {derived.failed} failed
            </Text>
            <View style={styles.progressRail}>
              <View style={[styles.progressSegment, styles.progressDone, { flex: Math.max(1, progressSegments.done) }]} />
              <View style={[styles.progressSegment, styles.progressRunning, { flex: Math.max(1, progressSegments.running) }]} />
              <View style={[styles.progressSegment, styles.progressTodo, { flex: Math.max(1, progressSegments.todo) }]} />
            </View>
            {blueprint ? (
              <Text style={styles.blueprintStatusText}>
                Status: {blueprint.status} • Last update {formatTime(blueprint.updatedAt)}
              </Text>
            ) : null}
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#2563EB" />
            <Text style={styles.subtle}>Initializing…</Text>
          </View>
        ) : null}

        {refreshError ? <Text style={styles.error}>Error: {refreshError}</Text> : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Graph (By Line)</Text>
          <FlatList
            data={[...jobs].sort((a, b) => a.lineNumber - b.lineNumber)}
            keyExtractor={(j) => j.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => navigation.navigate('JobDetail', { jobId: item.id, blueprintId })}>
                <View style={styles.jobCard}>
                  <View style={styles.jobTopRow}>
                    <Text style={styles.jobLine}>Line {item.lineNumber}</Text>
                    <Text style={styles.jobStatus}>{item.status}</Text>
                  </View>
                  <Text style={styles.jobType}>{item.inferredType}</Text>
                  <Text style={styles.jobPriority}>Priority: {item.priority}</Text>
                  {item.workflowPhase ? <Text style={styles.jobPhase}>Phase: {item.workflowPhase}</Text> : null}
                  {item.dependencies?.length ? (
                    <Text style={styles.jobDependencies} numberOfLines={2}>
                      Depends on{' '}
                      {item.dependencies
                        .map((id) => lineByJobId.get(id))
                        .filter((n): n is number => typeof n === 'number')
                        .map((n) => `L${n}`)
                        .join(', ')}
                    </Text>
                  ) : null}
                  {item.lastError ? (
                    <Text style={styles.jobError} numberOfLines={2}>
                      {item.lastError}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Timeline</Text>
          <FlatList
            data={filteredTimeline}
            keyExtractor={(e) => e.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.timelineRow}>
                <View style={styles.timelineDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.timelineType} numberOfLines={1}>
                    {item.eventType}
                  </Text>
                  <Text style={styles.timelineSubtle}>
                    {item.actor} • {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.subtle}>No audit events yet.</Text>}
          />
        </View>

        {finalDeliveryLoading ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Final Delivery</Text>
            <ActivityIndicator color="#2563EB" />
          </View>
        ) : null}

        {blueprint &&
        (blueprint.status === 'completed' ||
          blueprint.status === 'failed' ||
          blueprint.status === 'cancelled') &&
        finalDelivery ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Final Delivery</Text>

            <Text style={styles.subsectionTitle}>Artifact Summaries</Text>
            <FlatList
              data={finalDelivery.artifactSummaries}
              keyExtractor={(i, idx) => `${i.type}-${idx}`}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.miniCard}>
                  <Text style={styles.miniTitle}>{item.type}</Text>
                  <Text style={styles.miniSubtle}>{item.summary}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.subtle}>No artifacts found.</Text>}
            />

            <Text style={styles.subsectionTitle}>Deployment Status</Text>
            <FlatList
              data={finalDelivery.deploymentCounts}
              keyExtractor={(d) => d.envId}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.miniCard}>
                  <Text style={styles.miniTitle}>{item.envName}</Text>
                  <Text style={styles.miniSubtle}>{item.count} deployment/verification steps</Text>
                </View>
              )}
            />

            <Text style={styles.subsectionTitle}>Defect Summary</Text>
            <View style={styles.miniCard}>
              <Text style={styles.miniTitle}>
                {finalDelivery.defectSummary.failed} failed • {finalDelivery.defectSummary.cancelled} cancelled
              </Text>
              {finalDelivery.defectSummary.sampleErrors.length ? (
                <Text style={styles.miniSubtle} numberOfLines={3}>
                  {finalDelivery.defectSummary.sampleErrors.join(' | ')}
                </Text>
              ) : (
                <Text style={styles.miniSubtle}>No failure diagnostics captured.</Text>
              )}
            </View>

            <Text style={styles.subsectionTitle}>Release Notes</Text>
            <FlatList
              data={finalDelivery.releaseNotes}
              keyExtractor={(_, idx) => String(idx)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.miniCard}>
                  <Text style={styles.miniSubtle}>{item}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.subtle}>Release notes not available.</Text>}
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Controls Panel</Text>
          <View style={styles.adminRow}>
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => adminPauseBlueprint(blueprintId).then(() => refresh().catch(() => null))}
            >
              <Text style={styles.adminButtonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => adminResumeBlueprint(blueprintId).then(() => refresh().catch(() => null))}
            >
              <Text style={styles.adminButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.adminButtonDanger}
              onPress={() => adminCancelBlueprint(blueprintId).then(() => refresh().catch(() => null))}
            >
              <Text style={styles.adminButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtle}>Environment selection</Text>
          <View style={styles.envRow}>
            {envs.map((e) => (
              <TouchableOpacity
                key={e.id}
                style={[styles.envPill, selectedEnv === e.id ? styles.envPillActive : undefined]}
                onPress={() => setSelectedEnv(e.id)}
              >
                <Text style={styles.envPillText}>{e.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.adminButton}
            disabled={!runId}
            onPress={() => {
              if (!runId) return;
              adminSetRunEnvironment(runId, selectedEnv).then(() => refresh().catch(() => null));
            }}
          >
            <Text style={styles.adminButtonText}>Apply environment</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8
  },
  scroll: {
    paddingBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  healthCard: {
    flex: 1,
    backgroundColor: '#0B1020',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  cardLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#22C55E'
  },
  cardValueAlert: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F97373'
  },
  cardSubtle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  section: {
    marginTop: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 8
  },
  agentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  agentTile: {
    width: '48%',
    backgroundColor: '#020617',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  agentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F9FAFB',
    marginBottom: 4
  },
  agentStatus: {
    fontSize: 12,
    color: '#4ADE80'
  },
  agentMeta: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2
  },
  blueprintCard: {
    backgroundColor: '#0B1020',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  center: { alignItems: 'center', marginTop: 14 },
  subtle: { color: '#6B7280', fontSize: 12, marginTop: 6 },
  error: { color: '#F97373', marginTop: 8, fontSize: 12 },
  progressRail: {
    flexDirection: 'row',
    marginTop: 8,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#111827'
  },
  progressSegment: {
    flex: 1
  },
  progressDone: {
    backgroundColor: '#22C55E'
  },
  progressRunning: {
    backgroundColor: '#FACC15'
  },
  progressTodo: {
    backgroundColor: '#1F2937'
  },
  jobCard: {
    backgroundColor: '#0B1020',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10
  },
  jobTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  jobLine: { color: '#E5E7EB', fontWeight: '600' },
  jobStatus: { color: '#9CA3AF', fontWeight: '600' },
  jobType: { color: '#60A5FA', marginBottom: 4, fontWeight: '600' },
  jobPriority: { color: '#9CA3AF', fontSize: 12, marginBottom: 4 },
  jobPhase: { color: '#6B7280', fontSize: 12 },
  jobError: { color: '#F97373', fontSize: 12, marginTop: 8 },
  adminRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  adminButton: { flex: 1, backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  adminButtonDanger: { flex: 1, backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  adminButtonText: { color: '#F9FAFB', fontWeight: '700' },
  envRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 },
  envPill: { backgroundColor: '#111827', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#1E293B' },
  envPillActive: { borderColor: '#60A5FA' },
  envPillText: { color: '#E5E7EB', fontWeight: '600', fontSize: 12 },

  rail: { flexDirection: 'row', paddingVertical: 6, gap: 10 },
  railChip: {
    backgroundColor: '#0B1020',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginRight: 6,
    width: 180
  },
  railChipActive: {
    borderColor: '#60A5FA',
    backgroundColor: '#0A1730'
  },
  railChipAlert: {
    borderColor: '#EF4444'
  },
  railChipText: { color: '#E5E7EB', fontWeight: '600', fontSize: 12, marginBottom: 6 },
  railChipTextActive: { color: '#FFFFFF' },
  railChipSubtle: { color: '#6B7280', fontSize: 11 },

  blueprintStatusText: { color: '#6B7280', fontSize: 12, marginTop: 8 },

  lanesRow: { flexDirection: 'row', paddingVertical: 6, gap: 10 },
  laneCard: {
    width: 110,
    backgroundColor: '#0B1020',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  laneLabel: { color: '#9CA3AF', fontWeight: '600', fontSize: 12, marginBottom: 6 },
  laneValue: { color: '#E5E7EB', fontWeight: '700', fontSize: 20 },
  laneValueAlert: { color: '#F97373' },
  laneSubtle: { color: '#6B7280', fontSize: 11, marginTop: 4 },

  jobDependencies: { color: '#93C5FD', fontSize: 12, marginTop: 6 },

  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#2563EB',
    marginTop: 4
  },
  timelineType: { color: '#E5E7EB', fontWeight: '600', fontSize: 12, marginBottom: 4 },
  timelineSubtle: { color: '#6B7280', fontSize: 11 },

  subsectionTitle: { color: '#E5E7EB', fontWeight: '600', fontSize: 14, marginTop: 14, marginBottom: 8 },
  miniCard: {
    backgroundColor: '#0B1020',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10
  },
  miniTitle: { color: '#F9FAFB', fontWeight: '700', fontSize: 12, marginBottom: 6 },
  miniSubtle: { color: '#9CA3AF', fontSize: 12 }
});

