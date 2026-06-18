import React, {useEffect, useRef} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ScreenContainer from '../components/ui/ScreenContainer';
import {useAuth} from '../store/useAuth';
import {demoCase} from '../data/demoCase';
import {MainScreenProps} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {fetchQuestions} from '../store/questionsSlice';
import {colors, spacing} from '../theme/colors';

export default function PreBriefingScreen({
  navigation,
}: MainScreenProps<'PreBriefing'>) {
  const {user} = useAuth();
  const dispatch = useAppDispatch();
  const {loaded, error, meta} = useAppSelector(s => s.questions);
  const redirectedRef = useRef(false);

  // Girişte soruları çek.
  useEffect(() => {
    if (!loaded) {
      dispatch(fetchQuestions());
    }
  }, [dispatch, loaded]);

  // Simülasyon daha önce tamamlandıysa (ya da backend "tekrar başlayamazsınız"
  // diye reddettiyse) hiç başlatma; mesaj + skor için doğrudan Sonuç'a git.
  const blockedNote = meta.simulasyonTamamlandiMi
    ? 'Simülasyonu daha önce tamamladınız. Tekrar başlayamazsınız.'
    : error ?? null;

  useEffect(() => {
    if (blockedNote && !redirectedRef.current && navigation.isFocused()) {
      redirectedRef.current = true;
      navigation.replace('Result', {correct: 0, total: 0, note: blockedNote});
    }
  }, [blockedNote, navigation]);

  // Sorular yükleniyor / engellenmiş kullanıcı Sonuç'a yönlendiriliyor → bekleme.
  if (!loaded || blockedNote) {
    return (
      <ScreenContainer contentStyle={styles.centerContent}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Hazırlanıyor…</Text>
      </ScreenContainer>
    );
  }

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
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 15,
    color: colors.textMuted,
  },
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
