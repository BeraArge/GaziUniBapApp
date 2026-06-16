/**
 * GaziUniBapApp — Hemşirelik Vaka Simülasyonu
 *
 * @format
 */
import React from 'react';
import {StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import {store} from './src/store';
import {colors} from './src/theme/colors';

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
