import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {Pressable, Text} from 'react-native';
import {useAuth} from '../store/useAuth';
import PreBriefingScreen from '../screens/PreBriefingScreen';
import ResultScreen from '../screens/ResultScreen';
import SimulationScreen from '../screens/SimulationScreen';
import {colors} from '../theme/colors';
import {MainStackParamList} from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

function LogoutButton() {
  const {logout} = useAuth();
  return (
    <Pressable onPress={logout} hitSlop={8}>
      <Text style={{color: colors.white, fontWeight: '600'}}>Çıkış</Text>
    </Pressable>
  );
}

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.primary},
        headerTintColor: colors.white,
        headerTitleStyle: {fontWeight: '700'},
        headerBackTitle: 'Geri',
      }}>
      <Stack.Screen
        name="PreBriefing"
        component={PreBriefingScreen}
        options={{
          title: 'Ön Bilgilendirme',
          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen
        name="Simulation"
        component={SimulationScreen}
        options={{title: 'Simülasyon'}}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{title: 'Sonuç', headerBackVisible: false}}
      />
    </Stack.Navigator>
  );
}
