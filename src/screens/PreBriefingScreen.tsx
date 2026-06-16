import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ScreenContainer from '../components/ui/ScreenContainer';
import {useAuth} from '../store/useAuth';
import {demoCase} from '../data/demoCase';
import {MainScreenProps} from '../navigation/types';
import {colors, spacing} from '../theme/colors';

export default function PreBriefingScreen({
  navigation,
}: MainScreenProps<'PreBriefing'>) {
  const {user} = useAuth();

  return (
    <ScreenContainer
      footer={
        <Button
          title="Okudum, Başla"
          onPress={() => navigation.navigate('Simulation')}
        />
      }>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hoş geldiniz
          {user?.adSoyad || user?.fullName ? `, ${user.adSoyad ?? user.fullName}` : ''}{' '}
          👋
        </Text>
        <Text style={styles.caseTitle}>{demoCase.title}</Text>
      </View>

      <Card>
        <Text style={styles.sectionLabel}>ÖN BİLGİLENDİRME</Text>
        <Text style={styles.body}>{demoCase.preBriefing}</Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  greeting: {
    fontSize: 16,
    color: colors.textMuted,
  },
  caseTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 16,
    lineHeight: 25,
    color: colors.text,
  },
});
