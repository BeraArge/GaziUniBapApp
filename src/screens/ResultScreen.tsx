import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ScreenContainer from '../components/ui/ScreenContainer';
import {demoCase} from '../data/demoCase';
import {MainScreenProps} from '../navigation/types';
import {colors, spacing} from '../theme/colors';

export default function ResultScreen({
  route,
  navigation,
}: MainScreenProps<'Result'>) {
  const {correct, total} = route.params;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = percent >= 60;

  return (
    <ScreenContainer
      contentStyle={styles.content}
      footer={
        <Button
          title="Başa Dön"
          onPress={() =>
            navigation.reset({index: 0, routes: [{name: 'PreBriefing'}]})
          }
        />
      }>
      <View style={styles.center}>
        <Text style={styles.emoji}>{passed ? '🎉' : '📚'}</Text>
        <Text style={styles.title}>Simülasyon Tamamlandı</Text>
        <Text style={styles.caseName}>{demoCase.title}</Text>
      </View>

      <Card style={styles.scoreCard}>
        <Text style={styles.scoreBig}>
          {correct}/{total}
        </Text>
        <Text style={styles.scoreLabel}>Doğru Cevap</Text>
        <View
          style={[
            styles.badge,
            {backgroundColor: passed ? colors.successBg : colors.dangerBg},
          ]}>
          <Text
            style={[
              styles.badgeText,
              {color: passed ? colors.success : colors.danger},
            ]}>
            %{percent} başarı — {passed ? 'Başarılı' : 'Tekrar deneyin'}
          </Text>
        </View>
      </Card>

      <Text style={styles.note}>
        {passed
          ? 'Tebrikler! Klinik muhakemenizi başarıyla uyguladınız.'
          : 'Vakayı tekrar gözden geçirip yeniden deneyebilirsiniz.'}
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  center: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  caseName: {
    fontSize: 15,
    color: colors.textMuted,
  },
  scoreCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  scoreBig: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: 15,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    marginTop: spacing.sm,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  note: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
