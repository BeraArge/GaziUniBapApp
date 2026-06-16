import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import QuestionStep from '../components/steps/QuestionStep';
import TableStep from '../components/steps/TableStep';
import TextStep from '../components/steps/TextStep';
import VideoStep from '../components/steps/VideoStep';
import Button from '../components/ui/Button';
import ScreenContainer from '../components/ui/ScreenContainer';
import {demoCase} from '../data/demoCase';
import {MainScreenProps} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {fetchQuestions} from '../store/questionsSlice';
import {colors, spacing} from '../theme/colors';
import {Step} from '../types/simulation';

export default function SimulationScreen({
  navigation,
}: MainScreenProps<'Simulation'>) {
  const dispatch = useAppDispatch();
  const {items, loading, error, loaded} = useAppSelector(s => s.questions);

  const [index, setIndex] = useState(0);
  // Bir soru adımında cevap verilip verilmediği — verilene kadar "İlerle" pasif.
  const [answeredCurrent, setAnsweredCurrent] = useState(false);
  // Doğru sayısı (mutasyon için ref).
  const correctRef = useRef(0);

  // Açılışta soruları API'den çek.
  useEffect(() => {
    if (!loaded) {
      dispatch(fetchQuestions());
    }
  }, [dispatch, loaded]);

  // Statik vaka adımları + API'den gelen sorular.
  const steps: Step[] = useMemo(() => [...demoCase.steps, ...items], [items]);
  const totalQuestions = items.length;

  const handleAnswered = (isCorrect: boolean) => {
    if (isCorrect) {
      correctRef.current += 1;
    }
    setAnsweredCurrent(true);
  };

  const goNext = () => {
    if (index === steps.length - 1) {
      navigation.replace('Result', {
        correct: correctRef.current,
        total: totalQuestions,
      });
      return;
    }
    setIndex(i => i + 1);
    setAnsweredCurrent(false);
  };

  const step = steps[index];
  const isLast = index === steps.length - 1;

  // Tanım adımlarının sonuna gelindi ama sorular henüz hazır değil.
  const awaitingQuestions = isLast && !loaded;

  const renderStep = () => {
    switch (step.type) {
      case 'text':
        return <TextStep step={step} />;
      case 'table':
        return <TableStep step={step} />;
      case 'video':
        return <VideoStep step={step} />;
      case 'question':
        // key={index}: her soruda bileşen sıfırdan oluşur, böylece önceki
        // sorunun seçimi/geri bildirimi sıfırlanır.
        return (
          <QuestionStep key={index} step={step} onAnswered={handleAnswered} />
        );
    }
  };

  // Soru adımında cevap verilmeden ilerlenemez; sorular yüklenmeden de bitirilemez.
  const nextDisabled =
    (step.type === 'question' && !answeredCurrent) || awaitingQuestions;
  const nextTitle = isLast ? 'Bitir ve Sonucu Gör' : 'İlerle';

  return (
    <ScreenContainer
      footer={
        <>
          {/* Tanım bitti, sorular yükleniyor/hata */}
          {awaitingQuestions && loading && (
            <View style={styles.statusRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.centerText}>Sorular yükleniyor…</Text>
            </View>
          )}
          {awaitingQuestions && error && (
            <View style={styles.statusRow}>
              <Text style={styles.errorText}>{error}</Text>
              <Button
                title="Tekrar Dene"
                variant="outline"
                onPress={() => dispatch(fetchQuestions())}
              />
            </View>
          )}

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {width: `${((index + 1) / steps.length) * 100}%`},
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Adım {index + 1} / {steps.length}
          </Text>
          <Button title={nextTitle} onPress={goNext} disabled={nextDisabled} />
        </>
      }>
      {renderStep()}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  centerText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: 15,
    color: colors.danger,
    textAlign: 'center',
    lineHeight: 21,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
