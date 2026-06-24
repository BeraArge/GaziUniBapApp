import React, {useEffect, useRef} from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ScreenContainer from '../components/ui/ScreenContainer';
import {MainScreenProps} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {useAuth} from '../store/useAuth';
import {fetchCompetitionHome} from '../store/questionsSlice';
import {colors, radius, spacing} from '../theme/colors';
import {LeaderboardEntry} from '../types/simulation';

function entryName(e: LeaderboardEntry): string {
  if (e.fullName && e.fullName.trim()) {
    return e.fullName;
  }
  return e.isCurrentUser ? 'Siz' : `Öğrenci #${e.userId}`;
}

export default function ResultScreen({
  navigation,
  route,
}: MainScreenProps<'Result'>) {
  const dispatch = useAppDispatch();
  const {logout} = useAuth();
  const note = route.params?.note;
  const {competition, competitionLoading, competitionError} = useAppSelector(
    s => s.questions,
  );
  const notifiedRef = useRef(false);

  useEffect(() => {
    dispatch(fetchCompetitionHome());
  }, [dispatch]);

  // Simülasyon sonu bildirimi (yalnızca gerçekten tamamlanan akışta, bir kez).
  useEffect(() => {
    if (note || notifiedRef.current) {
      return;
    }
    notifiedRef.current = true;
    Alert.alert(
      'Simülasyon Sona Erdi',
      'Sevgili öğrenciler,\nSimülasyon uygulaması sona ermiştir. Bu simülasyona gönüllü olarak katılım sağladığınız için her birinize içtenlikle teşekkür ederiz.',
      [{text: 'Devam'}],
    );
  }, [note]);

  if (competitionLoading && !competition) {
    return (
      <ScreenContainer contentStyle={styles.centerContent}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Sonuçlar hazırlanıyor…</Text>
      </ScreenContainer>
    );
  }

  if (competitionError && !competition) {
    return (
      <ScreenContainer
        contentStyle={styles.centerContent}
        footer={
          <Button
            title="Tekrar Dene"
            onPress={() => dispatch(fetchCompetitionHome())}
          />
        }>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.errorText}>{competitionError}</Text>
      </ScreenContainer>
    );
  }

  const c = competition;
  const passed = (c?.successRate ?? 0) >= 60;
  const board = c?.leaderboard?.length ? c.leaderboard : c?.nearbyUsers ?? [];

  return (
    <ScreenContainer
      contentStyle={styles.content}
      footer={
        <View style={styles.footer}>
          {!note ? (
            <Button
              title="Çözümleme Oturumuna Geç"
              onPress={() => navigation.navigate('Debriefing')}
            />
          ) : null}
          <Button
            title="Çıkış Yap"
            variant={note ? 'primary' : 'outline'}
            onPress={logout}
          />
        </View>
      }>
      <View style={styles.center}>
        <Text style={styles.emoji}>{passed ? '🎉' : '📚'}</Text>
        <Text style={styles.title}>Simülasyon Tamamlandı</Text>
        {c?.statusMessage ? (
          <Text style={styles.status}>{c.statusMessage}</Text>
        ) : null}
      </View>

      {note ? (
        <View style={styles.noteBanner}>
          <Text style={styles.noteText}>ℹ️  {note}</Text>
        </View>
      ) : null}

      {/* Skor + sıralama */}
      <Card style={styles.scoreCard}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreCol}>
            <Text style={styles.scoreBig}>{c?.totalScore ?? 0}</Text>
            <Text style={styles.scoreLabel}>Puan</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.scoreCol}>
            <Text style={styles.scoreBig}>
              {c?.rank ?? '-'}
              <Text style={styles.scoreSmall}>
                {' '}
                / {c?.totalParticipantCount ?? '-'}
              </Text>
            </Text>
            <Text style={styles.scoreLabel}>Sıralama</Text>
          </View>
        </View>

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
            %{Math.round(c?.successRate ?? 0)} başarı · {c?.correctCount ?? 0}{' '}
            doğru / {c?.wrongCount ?? 0} yanlış
          </Text>
        </View>
      </Card>

      {/* Sıralama listesi */}
      {board.length > 0 && (
        <View style={styles.boardWrap}>
          <Text style={styles.boardTitle}>Sıralama</Text>
          {board.map(e => (
            <View
              key={e.userId}
              style={[styles.boardRow, e.isCurrentUser && styles.boardRowMe]}>
              <Text
                style={[styles.rankCell, e.isCurrentUser && styles.meText]}>
                {e.rank}
              </Text>
              <Text
                style={[styles.nameCell, e.isCurrentUser && styles.meText]}
                numberOfLines={1}>
                {entryName(e)}
              </Text>
              <Text
                style={[styles.scoreCell, e.isCurrentUser && styles.meText]}>
                {e.totalScore} puan
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
  },
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
  center: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  status: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  noteBanner: {
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  noteText: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '600',
    lineHeight: 20,
  },

  errorText: {
    fontSize: 15,
    color: colors.danger,
    textAlign: 'center',
    lineHeight: 22,
  },
  scoreCard: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  scoreCol: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
  },
  scoreBig: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.primary,
  },
  scoreSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    alignSelf: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  boardWrap: {
    gap: spacing.sm,
  },
  boardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  boardRowMe: {
    borderColor: colors.primary,
    backgroundColor: '#FFF1E6',
  },
  rankCell: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMuted,
    width: 28,
  },
  nameCell: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  scoreCell: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  meText: {
    color: colors.primary,
  },
});
