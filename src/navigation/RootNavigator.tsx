import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {useAuth} from '../store/useAuth';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

export default function RootNavigator() {
  const {token} = useAuth();

  return (
    <NavigationContainer>
      {token ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
