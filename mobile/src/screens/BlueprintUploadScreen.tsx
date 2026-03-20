import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { createBlueprint } from '../lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'BlueprintUpload'>;

export const BlueprintUploadScreen: React.FC<Props> = ({ route, navigation }) => {
  const { projectId } = route.params;
  const [name, setName] = useState('');
  const [blueprint, setBlueprint] = useState('');

  const onSubmit = async () => {
    if (!name || !blueprint) return;
    const res = await createBlueprint({ projectId, name, rawText: blueprint });
    navigation.replace('Dashboard', { projectId, blueprintId: res.blueprint.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Blueprint name</Text>
        <TextInput
          style={styles.input}
          placeholder="Marketing site v1"
          placeholderTextColor="#6B7280"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Blueprint (one job per line)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Line 1: Plan mobile architecture&#10;Line 2: Implement backend APIs..."
          placeholderTextColor="#6B7280"
          value={blueprint}
          onChangeText={setBlueprint}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>Start autonomous run</Text>
        </TouchableOpacity>
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
  label: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
    marginTop: 12
  },
  input: {
    backgroundColor: '#0B1020',
    color: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  multiline: {
    minHeight: 160,
    marginTop: 4
  },
  button: {
    marginTop: 24,
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center'
  },
  buttonText: {
    color: '#F9FAFB',
    fontWeight: '600',
    fontSize: 16
  }
});

