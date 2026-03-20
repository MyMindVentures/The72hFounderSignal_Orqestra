import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { getBlueprints, getJobs, getProjects, type Blueprint, type Job, type Project } from '../lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Projects'>;

export const ProjectListScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setError(null);
        const [projRes, bpRes, jobsRes] = await Promise.all([getProjects(), getBlueprints(), getJobs()]);
        if (!alive) return;
        setProjects(projRes.projects);
        setBlueprints(bpRes.blueprints);
        setJobs(jobsRes.jobs);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? String(e));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  const now = Date.now();
  const recentBlueprints = useMemo(() => {
    // Sort newest-first by update time; show a concise top list for history.
    return [...blueprints].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 12);
  }, [blueprints]);

  const projectCards = useMemo(() => {
    const activeJobStatuses = new Set<Job['status']>(['running', 'queued', 'planning', 'blocked', 'retrying']);
    const terminalFailureStatuses = new Set<Job['status']>(['failed', 'cancelled']);

    return projects.map((p) => {
      const projectJobs = jobs.filter((j) => j.blueprintId && blueprints.find((b) => b.id === j.blueprintId)?.projectId === p.id);

      const runningJobs = projectJobs.filter((j) => activeJobStatuses.has(j.status)).length;
      const failures = projectJobs.filter((j) => terminalFailureStatuses.has(j.status)).length;

      const lastRunAt = blueprints
        .filter((b) => b.projectId === p.id && b.status !== 'draft')
        .map((b) => Date.parse(b.updatedAt))
        .filter((t) => Number.isFinite(t))
        .sort((a, b) => b - a)[0];

      return {
        id: p.id,
        name: p.name,
        runningJobs,
        failures,
        lastRunAt: lastRunAt ?? null
      };
    });
  }, [blueprints, jobs, projects]);

  function formatRelativeTime(iso: string | null) {
    if (!iso) return '—';
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return '—';

    const deltaMs = Math.max(0, now - t);
    const minutes = Math.floor(deltaMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const historyItems = useMemo(() => {
    return recentBlueprints.map((b) => {
      const incident = b.status === 'failed' || b.status === 'cancelled';
      return { blueprint: b, projectId: b.projectId, incident };
    });
  }, [recentBlueprints]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Projects</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.subtle}>Loading control center…</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>Error: {error}</Text> : null}

      {!loading ? (
        <>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <FlatList
            data={projectCards}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('BlueprintUpload', { projectId: item.id })}
              >
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.cardRow}>
                  <Text style={styles.metric}>{item.runningJobs} active jobs</Text>
                  <Text style={[styles.metric, item.failures ? styles.metricAlert : undefined]}>
                    {item.failures} incidents
                  </Text>
                </View>
                <Text style={styles.subtle}>Last run {formatRelativeTime(item.lastRunAt ? new Date(item.lastRunAt).toISOString() : null)}</Text>
              </TouchableOpacity>
            )}
          />

          <Text style={styles.sectionTitle}>History</Text>
          <FlatList
            data={historyItems}
            keyExtractor={(item) => item.blueprint.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.historyCard}
                onPress={() => navigation.navigate('Dashboard', { projectId: item.projectId, blueprintId: item.blueprint.id })}
              >
                <View style={styles.historyTopRow}>
                  <Text style={styles.historyTitle} numberOfLines={1}>
                    {item.blueprint.name || 'Blueprint'}
                  </Text>
                  <Text style={[styles.statusChip, item.incident ? styles.statusChipAlert : styles.statusChipOk]}>
                    {item.blueprint.status}
                  </Text>
                </View>
                <Text style={styles.subtle}>Updated {formatRelativeTime(item.blueprint.updatedAt)}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 10
  },
  listContent: {
    paddingBottom: 24
  },
  card: {
    backgroundColor: '#0B1020',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 6
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  metric: {
    fontSize: 13,
    color: '#9CA3AF'
  },
  metricAlert: {
    color: '#F97373'
  },
  subtle: {
    fontSize: 12,
    color: '#6B7280'
  },
  center: {
    alignItems: 'center',
    marginTop: 20,
    gap: 8
  },
  error: {
    color: '#F97373',
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginTop: 18,
    marginBottom: 10
  },
  historyCard: {
    backgroundColor: '#0B1020',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  historyTitle: {
    color: '#E5E7EB',
    fontWeight: '600',
    flex: 1,
    marginRight: 10
  },
  statusChip: {
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999
  },
  statusChipOk: {
    backgroundColor: '#111827',
    color: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  statusChipAlert: {
    backgroundColor: '#2A0B0B',
    color: '#F87171',
    borderWidth: 1,
    borderColor: '#EF4444'
  }
});

