import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import store from './store';
import RootNavigator from './navigation/RootNavigator';
import theme from './theme/theme';

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer theme={theme.navigationTheme}>
        <RootNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </Provider>
  );
}
