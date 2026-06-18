import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ScreenContainer from '../components/ui/ScreenContainer';
import {MainScreenProps} from '../navigation/types';
import {useAuth} from '../store/useAuth';
import {colors, spacing} from '../theme/colors';

/**
 * "Ara verildi" ekranı. Öğrenci part 1 sonunda ara vermeyi seçtiğinde gösterilir.
 * Çıkış yapıldığında bir sonraki girişte kaldığı yerden (part 2) devam eder.
 */
export default function BreakScreen({}: MainScreenProps<'Break'>) {
  const {logout} = useAuth();

  return (
    <ScreenContainer
      contentStyle={styles.content}
      footer={<Button title="Çıkış" onPress={logout} />}>
      <View style={styles.center}>
        <Text style={styles.emoji}>☕️</Text>
        <Text style={styles.title}>Ara Verildi</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.text}>
          İlk bölümü tamamladınız ve cevaplarınız kaydedildi. Daha sonra tekrar
          giriş yaptığınızda simülasyona kaldığınız yerden devam edebilirsiniz.
        </Text>
      </Card>
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
  card: {
    gap: spacing.sm,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'center',
  },
});
