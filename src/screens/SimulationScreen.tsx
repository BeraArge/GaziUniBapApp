import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import SceneStep from '../components/steps/SceneStep';
import TableStep from '../components/steps/TableStep';
import TextStep from '../components/steps/TextStep';
import VideoStep from '../components/steps/VideoStep';
import Button from '../components/ui/Button';
import ScreenContainer from '../components/ui/ScreenContainer';
import {demoCase} from '../data/demoCase';
import {MainScreenProps} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {completeSimulation, fetchQuestions, submitAnswers} from '../store/questionsSlice';
import {getSimulationProgress, saveSimulationProgress} from '../services/simulationProgress';
import {colors, spacing} from '../theme/colors';
import {AnswerRecord, Step} from '../types/simulation';

export default function SimulationScreen({navigation}: MainScreenProps<'Simulation'>) {
  const dispatch = useAppDispatch();
  const {items, meta, loading, error} = useAppSelector(s => s.questions);
  const userId = useAppSelector(s => s.auth.user?.id) as number | undefined;
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const correctRef = useRef(0);
  const staticCount = demoCase.steps.length;
  const steps: Step[] = useMemo(() => [...demoCase.steps, ...items], [items]);
  const totalQuestions = useMemo(() => items.filter(s => !!s.prompt?.trim()).length, [items]);

  const initialize = useCallback(async () => {
    setReady(false);
    setStartError(null);
    setBlocked(false);
    try {
      if (userId == null) throw new Error('Kullanıcı bilgisi bulunamadı. Tekrar giriş yapınız.');
      // Her girişte backend tamamlanma bilgisi taze okunur; Redux cache kullanılmaz.
      const response = await dispatch(fetchQuestions()).unwrap();
      if (response.meta.simulasyonTamamlandiMi) {
        setBlocked(true);
        return;
      }
      if (!response.items.length) throw new Error('Simülasyon adımları bulunamadı.');
      const progress = await getSimulationProgress(userId);
      if (!progress) {
        setIndex(0);
      } else {
        const lastIndex = response.items.findIndex(
          s => s.id === progress.lastCompletedStepId && s.order === progress.lastCompletedOrder,
        );
        if (lastIndex === response.items.length - 1) {
          // Backend henüz tamamlandı demiyorsa son adım kaydını güvenli biçimde doğrula.
          throw new Error('Son adımın tamamlanma durumu sunucuyla eşleşmiyor. Lütfen tekrar deneyin.');
        } else if (lastIndex >= 0) {
          setIndex(staticCount + lastIndex + 1);
        } else {
          // İçerik değiştiyse yanlış adımı atlamamak için durdur.
          throw new Error('Simülasyon adımları değişmiş. Kaldığınız yer doğrulanamadı.');
        }
      }
      setReady(true);
    } catch (e: any) {
      setStartError(typeof e === 'string' ? e : e?.message ?? 'Simülasyon açılamadı.');
    }
  }, [dispatch, userId, staticCount]);

  useEffect(() => { void initialize(); }, [initialize]);

  const step = steps[index];
  const isLast = index === steps.length - 1;
  const questionOrdinal = items.slice(0, Math.max(0, index - staticCount))
    .filter(s => !!s.prompt?.trim()).length;
  const displayQuestionNo = questionOrdinal + (step?.type === 'question' && step.prompt?.trim() ? 1 : 0);

  const advance = () => setIndex(i => i + 1);

  const completeStep = async (answer?: AnswerRecord) => {
    if (savingRef.current || !step || userId == null) return;
    savingRef.current = true;
    setSaving(true);
    try {
      if (answer) {
        const result = await dispatch(submitAnswers({cevaplar: [answer]})).unwrap();
        if (result?.isSuccess === false) throw new Error(result?.message || 'Cevap kaydedilemedi.');
      }
      if (step.type === 'question') {
        if (isLast) {
          // Endpoint geldiğinde yalnızca questionsSlice.completeSimulation içindeki
          // endpoint ve gerekiyorsa request body güncellenecek.
          await dispatch(completeSimulation()).unwrap();
          // Backend tamamlanması esas kayıttır. Yerel yazma başarısız olsa bile
          // backend başarıyla bitirdiyse kullanıcıyı sonuçtan alıkoyma.
          try {
            await saveSimulationProgress(userId, step.id, step.order ?? 0);
          } catch (storageError) {
            console.warn('Simülasyon tamamlandı fakat yerel ilerleme yazılamadı:', storageError);
          }
          navigation.replace('Result', {correct: correctRef.current, total: totalQuestions});
          return;
        }
        await saveSimulationProgress(userId, step.id, step.order ?? 0);
        if (answer?.isCorrect) correctRef.current += 1;
        if (step.partArasiMi) {
          Alert.alert('Simülasyona Ara Ver', 'Bu bölümü tamamladınız. Ara vermek ister misiniz?', [
            {text: 'Devam Et', onPress: advance},
            {text: 'Ara Ver', onPress: () => navigation.replace('Break')},
          ], {cancelable: false});
          return;
        }
      }
      advance();
    } catch (e: any) {
      Alert.alert('Kayıt Hatası', typeof e === 'string' ? e : e?.message ?? 'İşlem başarısız. Lütfen tekrar deneyin.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (blocked) return (
    <ScreenContainer><View style={styles.center}>
      <Text style={styles.centerText}>Bu simülasyonu daha önce tamamladınız. Tekrar başlatamazsınız.</Text>
    </View></ScreenContainer>
  );
  if (!ready || !step) return (
    <ScreenContainer><View style={styles.center}>
      {loading || !startError ? <ActivityIndicator color={colors.primary} /> : null}
      <Text style={startError ? styles.errorText : styles.centerText}>
        {startError ?? 'Simülasyon hazırlanıyor…'}
      </Text>
      {startError ? <Button title="Tekrar Dene" onPress={() => void initialize()} /> : null}
    </View></ScreenContainer>
  );

  if (step.type === 'question') return (
    <SceneStep
      key={`${step.id}-${index}`}
      step={step}
      questionNo={displayQuestionNo}
      totalQuestions={totalQuestions}
      onNext={answer => void completeStep(answer)}
      onStepComplete={() => void completeStep()}
      saving={saving}
    />
  );

  return (
    <ScreenContainer footer={<>
      <View style={styles.progressBar}><View style={[styles.progressFill, {width: `${((index + 1) / steps.length) * 100}%`}]} /></View>
      <Text style={styles.progressText}>Adım {index + 1} / {steps.length}</Text>
      <Button title="İlerle" onPress={() => void completeStep()} disabled={saving} />
    </>}>
      {step.type === 'text' ? <TextStep step={step} /> :
       step.type === 'table' ? <TableStep step={step} /> :
       step.type === 'video' ? <VideoStep step={step} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md},
  centerText: {color: colors.textMuted, fontSize: 15, textAlign: 'center'},
  errorText: {color: colors.danger, fontSize: 15, textAlign: 'center'},
  progressBar: {height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden'},
  progressFill: {height: '100%', backgroundColor: colors.primary},
  progressText: {fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs},
});
