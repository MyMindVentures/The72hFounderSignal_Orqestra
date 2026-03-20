import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import {
  adminSetJobPriority,
  getAuditEvents,
  getBlueprint,
  getJob,
  getJobArtifacts,
  getJobTasks,
  type AuditEvent,
  type Artifact,
  type Job,
  type Task
} from '../lib/api';
import { ProgressRail } from '../components/ProgressRail';
import { SegmentedTabs } from '../components/SegmentedTabs';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;

export const JobDetailScreen: React.FC<Props> = ({ route }) => {
  const { jobId, blueprintId } = route.params;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'diagnostics'>('overview');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [blueprintJobs, setBlueprintJobs] = useState<Job[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [priorityDraft, setPriorityDraft] = useState<number>(0);
  const [priorityBusy, setPriorityBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        setLoading(true);

        const blueprintJobsPromise = blueprintId
          ? getBlueprint(blueprintId).then((r) => r.jobs)
          : Promise.resolve([] as Job[]);

        const [tasksRes, artifactsRes, jobRes, blueprintJobsRes, auditRes] = await Promise.all([
          getJobTasks(jobId),
          getJobArtifacts(jobId),
          getJob(jobId),
          blueprintJobsPromise,
          getAuditEvents()
        ]);

        if (!alive) return;
        setTasks(tasksRes.tasks);
        setArtifacts(artifactsRes.artifacts);
        setJob(jobRes.job);
        setBlueprintJobs(blueprintJobsRes);
        setAuditEvents(auditRes.auditEvents);
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [blueprintId, jobId]);

  useEffect(() => {
    if (!job) return;
    setPriorityDraft(job.priority);
  }, [job]);

  const lineByJobId = useMemo(() => {
    const m = new Map<string, number>();
    blueprintJobs.forEach((j) => m.set(j.id, j.lineNumber));
    return m;
  }, [blueprintJobs]);

  const dependencyText = useMemo(() => {
    if (!job?.dependencies?.length) return 'None';
    const lines = job.dependencies
      .map((id) => lineByJobId.get(id))
      .filter((n): n is number => typeof n === 'number');

    if (lines.length) return lines.map((n) => `Line ${n}`).join(', ');
    return job.dependencies.slice(0, 3).join(', ') + (job.dependencies.length > 3 ? '…' : '');
  }, [job, lineByJobId]);

  const progressSegments = useMemo(() => {
    const total = Math.max(1, tasks.length);
    const done = tasks.filter((t) => t.status === 'completed').length;
    const running = tasks.filter((t) => t.status === 'running' || t.status === 'blocked' || t.status === 'retrying').length;
    const todo = Math.max(0, total - done - running);
    return { done, running, todo, total };
  }, [tasks]);

  const agentActivity = useMemo(() => {
    const m = new Map<
      string,
      { agentType: string; completed: number; failed: number; inProgress: number; attempts: number }
    >();

    for (const t of tasks) {
      const cur = m.get(t.agentType) ?? { agentType: t.agentType, completed: 0, failed: 0, inProgress: 0, attempts: 0 };
      cur.attempts = Math.max(cur.attempts, t.attemptCount);
      if (t.status === 'completed') cur.completed += 1;
      else if (t.status === 'failed') cur.failed += 1;
      else cur.inProgress += 1;
      m.set(t.agentType, cur);
    }

    return Array.from(m.values()).sort((a, b) => b.inProgress + b.failed + b.completed - (a.inProgress + a.failed + a.completed));
  }, [tasks]);

  const failedTasks = useMemo(() => tasks.filter((t) => t.status === 'failed').sort((a, b) => b.attemptCount - a.attemptCount), [tasks]);
  const retryingTasks = useMemo(() => tasks.filter((t) => t.status === 'retrying' || t.status === 'blocked'), [tasks]);

  const relevantTimeline = useMemo(() => {
    if (!job) return [];
    const taskIds = new Set(tasks.map((t) => t.id));
    const filtered = auditEvents.filter((e) => {
      const rel = e.relatedEntity;
      if (!rel) return false;
      if (rel.type === 'job' && rel.id === job.id) return true;
      if (rel.type === 'task' && taskIds.has(rel.id)) return true;
      return false;
    });
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);
  }, [auditEvents, job, tasks]);

  const applyPriority = async () => {
    if (!job) return;
    const clamped = Math.max(0, Math.min(10, Math.round(priorityDraft)));
    if (clamped === job.priority) return;

    try {
      setPriorityBusy(true);
      await adminSetJobPriority(jobId, clamped);
      const jobRes = await getJob(jobId);
      setJob(jobRes.job);
      setPriorityDraft(clamped);
    } finally {
      setPriorityBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.subtle}>Loading job details…</Text>
        </View>
      )}

      {!loading && job && (
        <>
          <View style={styles.card}>
            <Text style={styles.title}>Line {job.lineNumber}</Text>
            <Text style={styles.type}>{job.inferredType}</Text>
            <Text style={styles.status}>{job.status}</Text>
            {job.workflowPhase ? <Text style={styles.subtle}>Phase: {job.workflowPhase}</Text> : null}
            {job.lastError ? <Text style={styles.error}>Error: {job.lastError}</Text> : null}

            <Text style={styles.label}>Dependencies</Text>
            <Text style={styles.raw}>{dependencyText}</Text>

            <Text style={styles.label}>Blueprint line</Text>
            <Text style={styles.raw}>{job.rawText}</Text>
          </View>

          <SegmentedTabs
            tabs={[
              { key: 'overview', label: 'Overview' },
              { key: 'logs', label: 'Logs & Artifacts' },
              { key: 'diagnostics', label: 'Diagnostics' }
            ]}
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k)}
          />

          {activeTab === 'overview' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progress</Text>
              <ProgressRail done={progressSegments.done} running={progressSegments.running} todo={progressSegments.todo} />

              <Text style={styles.subtle}>
                {progressSegments.done} completed • {progressSegments.running} in progress • {progressSegments.todo} remaining
              </Text>

              <Text style={styles.sectionTitle}>Per-Agent Activity</Text>
              {agentActivity.length === 0 ? <Text style={styles.subtle}>No task activity yet.</Text> : null}
              {agentActivity.map((a) => (
                <View key={a.agentType} style={styles.miniCard}>
                  <Text style={styles.miniTitle}>{a.agentType}</Text>
                  <Text style={styles.miniSubtle}>
                    Completed: {a.completed} • In progress: {a.inProgress} • Failed: {a.failed} (max attempt {a.attempts})
                  </Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Admin: Priority Override</Text>
              <Text style={styles.subtle}>Priority ranges 0 (low) to 10 (high)</Text>
              <View style={styles.priorityRow}>
                <TouchableOpacity
                  style={styles.stepButton}
                  onPress={() => setPriorityDraft((p) => Math.max(0, p - 1))}
                  disabled={priorityBusy || priorityDraft <= 0}
                >
                  <Text style={styles.stepButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.priorityValue}>{priorityDraft}</Text>
                <TouchableOpacity
                  style={styles.stepButton}
                  onPress={() => setPriorityDraft((p) => Math.min(10, p + 1))}
                  disabled={priorityBusy || priorityDraft >= 10}
                >
                  <Text style={styles.stepButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.priorityApplyButton,
                  priorityBusy ? { opacity: 0.7 } : undefined,
                  priorityDraft === job.priority ? { opacity: 0.7 } : undefined
                ]}
                disabled={priorityBusy || priorityDraft === job.priority}
                onPress={() => void applyPriority()}
              >
                <Text style={styles.priorityApplyButtonText}>{priorityBusy ? 'Applying…' : 'Apply priority'}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {activeTab === 'logs' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Artifacts</Text>
              {artifacts.length === 0 ? <Text style={styles.subtle}>No artifacts yet.</Text> : null}
              {[...artifacts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((a) => (
                <View key={a.id} style={styles.miniCard}>
                  <Text style={styles.miniTitle}>{a.type}</Text>
                  <Text style={styles.miniSubtle}>Created: {a.createdAt}</Text>
                  {a.metadata?.summary ? <Text style={styles.miniSubtle}>{a.metadata.summary}</Text> : null}
                </View>
              ))}

              <Text style={styles.sectionTitle}>Task List</Text>
              {tasks.length === 0 ? <Text style={styles.subtle}>No tasks yet.</Text> : null}
              {tasks.map((t) => (
                <View key={t.id} style={styles.miniCard}>
                  <Text style={styles.miniTitle}>{t.agentType}</Text>
                  <Text style={styles.miniSubtle}>{t.description}</Text>
                  <Text style={styles.miniSubtle}>
                    Status: {t.status} (attempt {t.attemptCount})
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {activeTab === 'diagnostics' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Failure Diagnostics</Text>
              {job.lastError ? <Text style={styles.error}>{job.lastError}</Text> : <Text style={styles.subtle}>No failure diagnostics captured.</Text>}

              <Text style={styles.sectionTitle}>Failed Tasks</Text>
              {failedTasks.length === 0 ? <Text style={styles.subtle}>No failed tasks yet.</Text> : null}
              {failedTasks.map((t) => (
                <View key={t.id} style={styles.miniCard}>
                  <Text style={styles.miniTitle}>{t.agentType}</Text>
                  <Text style={styles.miniSubtle}>{t.description}</Text>
                  <Text style={styles.miniSubtle}>
                    Status: {t.status} (attempt {t.attemptCount})
                  </Text>
                </View>
              ))}

              {retryingTasks.length ? (
                <>
                  <Text style={styles.sectionTitle}>Retry / Blocked State</Text>
                  {retryingTasks.map((t) => (
                    <View key={t.id} style={styles.miniCard}>
                      <Text style={styles.miniTitle}>{t.agentType}</Text>
                      <Text style={styles.miniSubtle}>
                        Status: {t.status} (attempt {t.attemptCount})
                      </Text>
                    </View>
                  ))}
                </>
              ) : null}

              <Text style={styles.sectionTitle}>Relevant Audit Events</Text>
              {relevantTimeline.length === 0 ? (
                <Text style={styles.subtle}>No related audit events found.</Text>
              ) : null}
              {relevantTimeline.map((e) => (
                <View key={e.id} style={styles.timelineRow}>
                  <View style={styles.timelineDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.timelineType} numberOfLines={1}>
                      {e.eventType}
                    </Text>
                    <Text style={styles.timelineSubtle}>
                      {e.actor} • {e.createdAt}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#02010A'
  },
  center: {
    alignItems: 'center',
    marginTop: 30
  },
  card: {
    backgroundColor: '#0B1020',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16
  },
  title: { fontSize: 18, fontWeight: '600', color: '#E5E7EB', marginBottom: 4 },
  type: { color: '#60A5FA', fontWeight: '600', marginBottom: 6 },
  status: { color: '#9CA3AF', marginBottom: 6 },
  subtle: { color: '#6B7280', fontSize: 12, marginTop: 4 },
  error: { color: '#F97373', fontSize: 12, marginTop: 8 },
  label: { color: '#9CA3AF', fontWeight: '600', marginTop: 12, marginBottom: 6 },
  raw: { color: '#E5E7EB', backgroundColor: '#111827', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1E293B' },
  section: { marginTop: 16, marginBottom: 10 },
  sectionTitle: { color: '#E5E7EB', fontWeight: '600', marginBottom: 8 },

  tabsRow: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 8 },
  tabButton: {
    flex: 1,
    backgroundColor: '#0B1020',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  tabButtonActive: {
    borderColor: '#60A5FA',
    backgroundColor: '#0A1730'
  },
  tabButtonText: { color: '#E5E7EB', fontWeight: '600', fontSize: 12 },
  tabButtonTextActive: { color: '#FFFFFF' },

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

  priorityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 10 },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepButtonText: { color: '#E5E7EB', fontWeight: '800', fontSize: 18 },
  priorityValue: { color: '#E5E7EB', fontWeight: '800', fontSize: 18, minWidth: 40, textAlign: 'center' },
  priorityApplyButton: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  priorityApplyButtonText: { color: '#F9FAFB', fontWeight: '700' },

  miniCard: {
    backgroundColor: '#0B1020',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10
  },
  miniTitle: { color: '#F9FAFB', fontWeight: '600', marginBottom: 4 },
  miniSubtle: { color: '#9CA3AF', fontSize: 12 },

  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#2563EB',
    marginTop: 4
  },
  timelineType: { color: '#E5E7EB', fontWeight: '600', fontSize: 12, marginBottom: 4 },
  timelineSubtle: { color: '#6B7280', fontSize: 11 }
});

