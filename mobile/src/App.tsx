import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProjectListScreen } from './screens/ProjectListScreen';
import { BlueprintUploadScreen } from './screens/BlueprintUploadScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { JobDetailScreen } from './screens/JobDetailScreen';

export type RootStackParamList = {
  Projects: undefined;
  BlueprintUpload: { projectId: string };
  Dashboard: { projectId: string; blueprintId: string };
  JobDetail: { jobId: string; blueprintId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        id="root"
        initialRouteName="Projects"
        screenOptions={{
          headerStyle: { backgroundColor: '#050816' },
          headerTintColor: '#ffffff',
          contentStyle: { backgroundColor: '#02010A' }
        }}
      >
        <Stack.Screen name="Projects" component={ProjectListScreen} options={{ title: 'Control Center' }} />
        <Stack.Screen name="BlueprintUpload" component={BlueprintUploadScreen} options={{ title: 'Blueprint Upload' }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Control Center Dashboard' }} />
        <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job Detail' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

