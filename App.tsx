import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import ScoreRevealScreen from './ScoreRevealScreen';

export default function App() {
  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      <ScoreRevealScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
});
