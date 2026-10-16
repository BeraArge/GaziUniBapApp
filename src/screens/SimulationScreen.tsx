import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import SceneStep from '../components/steps/SceneStep';
import TableStep from '../components/steps/TableStep';
import TextStep from '../components/steps/TextStep';
import VideoStep from '../components/steps/VideoStep';
import Button from '../components/ui/Button';
import ScreenContainer from '../components/ui/ScreenContainer';
import { demoCase } from '../data/demoCase';
import { MainScreenProps } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchQuestions, submitAnswers } from '../store/questionsSlice';
import { colors, spacing } from '../theme/colors';
import { AnswerRecord, Step } from '../types/simulation';

export default function SimulationScreen({
  navigation,
}: MainScreenProps<'Simulation'>) {
  const dispatch = useAppDispatch();
  const { items, meta, loading, error, loaded } = useAppSelector(
    s => s.questions,
  );

  const [index, setIndex] = useState(0);
  // Doğru sayısı (mutasyon için ref).
  const correctRef = useRef(0);
  // Bu oturumda verilen cevaplar (part bitiminde toplu gönderilir).
  const answersRef = useRef<AnswerRecord[]>([]);
  // Devam (resume) konumlandırması yalnızca bir kez yapılır.
  const positionedRef = useRef(false);
  // API'ye aynı anda birden fazla kayıt isteği gönderilmesini önler.
  const savingRef = useRef(false);
  // Mola penceresinin aynı adımda tekrar açılmasını önler.
  const breakAlertRef = useRef(false);

  // Açılışta soruları API'den çek.
  useEffect(() => {
    if (!loaded) {
      dispatch(fetchQuestions());
    }
  }, [dispatch, loaded]);

  // Statik ön bilgilendirme adımları korunuyor.
  // API kayıtları bunların ardından gösterilecek.
  const steps: Step[] = useMemo(() => [...demoCase.steps, ...items], [items]);

  // Yalnızca soru metni bulunan kayıtları say.
  const totalQuestions = useMemo(
    () => items.filter(item => Boolean(item.prompt?.trim())).length,
    [items],
  );

  // Statik ön bilgilendirme ekranlarının sayısı.
  const staticCount = demoCase.steps.length;

  const { ilkPartTamamlandiMi } = meta;

  // Devam: ilk part tamamlandıysa statik adımları atlayıp doğrudan kalan ilk
  // sorudan başla (bir kez).
  useEffect(() => {
    if (!loaded || items.length === 0 || positionedRef.current) {
      return;
    }

    positionedRef.current = true;

    if (ilkPartTamamlandiMi) {
      // Backend ilk 7 kaydı çıkarmışsa gelen listenin
      // ilk elemanı 8. senaryo adımıdır.
      setIndex(staticCount);
    }
  }, [loaded, items.length, ilkPartTamamlandiMi, staticCount]);

  const goToResult = () => {
    // replace: SimulationScreen (ve üstündeki SceneStep mod'u) kaldırılır,
    // böylece Result ekranı görünür. navigate kullanılırsa modal üstte kalır.
    navigation.replace('Result', {
      correct: correctRef.current,
      total: totalQuestions,
    });
  };

  const goNext = () => {
    if (index === steps.length - 1) {
      goToResult();
      return;
    }
    setIndex(i => i + 1);
  };

  const completeCurrentStep = () => {
    const currentStep = steps[index];

    if (
      currentStep.type === 'question' &&
      currentStep.partArasiMi &&
      !ilkPartTamamlandiMi
    ) {
      if (breakAlertRef.current) {
        return;
      }

      breakAlertRef.current = true;

      Alert.alert(
        'Simülasyona Ara Ver',
        'Bu bölümü tamamladınız. Ara vermek ister misiniz?',
        [
          {
            text: 'Devam Et',
            onPress: () => {
              goNext();
            },
          },
          {
            text: 'Ara Ver',
            onPress: async () => {
              if (savingRef.current) {
                return;
              }

              const cevaplar = answersRef.current.slice();

              if (cevaplar.length === 0) {
                Alert.alert(
                  'Kayıt gerekli',
                  'Ara vermeden önce ilerleme kaydının backend tarafından desteklenmesi gerekiyor.',
                );
                return;
              }

              savingRef.current = true;

              try {
                const result = await dispatch(
                  submitAnswers({ cevaplar }),
                ).unwrap();

                if (result?.isSuccess === false) {
                  throw new Error(result?.message || 'Cevaplar kaydedilemedi.');
                }

                navigation.replace('Break');
              } catch (err: any) {
                breakAlertRef.current = false;

                Alert.alert(
                  'Kayıt Hatası',
                  err?.message ||
                    'Cevaplar kaydedilemedi. Lütfen tekrar deneyin.',
                  [
                    {
                      text: 'Tamam',
                      onPress: () => {
                        completeCurrentStep();
                      },
                    },
                  ],
                );
              } finally {
                savingRef.current = false;
              }
            },
          },
        ],
        { cancelable: false },
      );
      return;
    }

    goNext();
  };

  const handleStepComplete = async () => {
    // Son senaryo adımı tamamlandıysa cevapları kaydet.
    if (isLast) {
      if (savingRef.current) {
        return;
      }

      savingRef.current = true;

      try {
        const cevaplar = answersRef.current.slice();

        // Kaydedilecek cevap varsa backend'e gönder.
        if (cevaplar.length > 0) {
          const result = await dispatch(submitAnswers({ cevaplar })).unwrap();

          if (result?.isSuccess === false) {
            throw new Error(result?.message || 'Cevaplar kaydedilemedi.');
          }
        }

        goToResult();
      } catch (err: any) {
        Alert.alert(
          'Kayıt Hatası',
          err?.message || 'Cevaplar kaydedilemedi. Lütfen tekrar deneyin.',
        );
      } finally {
        savingRef.current = false;
      }

      return;
    }

    // Son adım değilse mola kontrolünü yap.
    completeCurrentStep();
  };

  const step = steps[index];
  const isLast = index === steps.length - 1;
  const isQuestion = step.type === 'question';

  // O anki sorunun 0-based sırası (sorular arasında).
  const questionOrdinal = items
    .slice(0, Math.max(0, index - staticCount))
    .filter(item => Boolean(item.prompt?.trim())).length;

  // Tanım adımlarının sonuna gelindi ama sorular henüz hazır değil.
  const awaitingQuestions =
    index === staticCount - 1 && (!loaded || items.length === 0);

  // Soru adımı: tam ekran video + modal soru olarak sunulur (SceneStep).

  const handleSceneNext = async (answer: AnswerRecord) => {
    // Aynı sorunun cevabı daha önce eklendiyse tekrar ekleme.
    // Kayıt işlemi devam ediyorsa yeni işlem başlatma.
    if (savingRef.current) {
      return;
    }

    // Aynı sorunun cevabını ikinci kez ekleme.
    const alreadyAnswered = answersRef.current.some(
      item => item.soruId === answer.soruId,
    );

    if (!alreadyAnswered) {
      answersRef.current.push(answer);

      if (answer.isCorrect) {
        correctRef.current += 1;
      }
    }

    // Daha önce cevaplanan bir soruda yalnızca
    // başarısız final kaydının tekrar denenmesine izin ver.
    if (alreadyAnswered && !isLast) {
      return;
    }

    if (isLast) {
      if (savingRef.current) {
        return;
      }

      savingRef.current = true;

      try {
        const result = await dispatch(
          submitAnswers({
            cevaplar: answersRef.current.slice(),
          }),
        ).unwrap();

        if (result?.isSuccess === false) {
          throw new Error(result?.message || 'Cevaplar kaydedilemedi.');
        }

        goToResult();
      } catch (err: any) {
        Alert.alert(
          'Kayıt Hatası',
          err?.message || 'Cevaplar kaydedilemedi. Lütfen tekrar deneyin.',
        );
      } finally {
        savingRef.current = false;
      }
      return;
    }

    completeCurrentStep();
  };

  // Görüntülenecek soru numarası (oturum başlangıcından itibaren) ve toplam.
  const displayQuestionNo =
    step.type === 'question' && step.prompt?.trim()
      ? questionOrdinal + 1
      : questionOrdinal;

  const displayTotal = totalQuestions;

  const renderStep = () => {
    switch (step.type) {
      case 'text':
        return <TextStep step={step} />;
      case 'table':
        return <TableStep step={step} />;
      case 'video':
        return <VideoStep step={step} />;
      case 'question':
        // key={index}: her soruda bileşen (ve video) sıfırdan oluşur.
        return (
          <SceneStep
            key={index}
            step={step}
            questionNo={displayQuestionNo}
            totalQuestions={displayTotal}
            onNext={handleSceneNext}
            onStepComplete={handleStepComplete}
          />
        );
    }
  };

  // Soru adımı tüm akışı kendi (modal) içinde yönetir; normal sayfa/footer gizlenir.
  if (isQuestion) {
    return renderStep();
  }

  // Sorular yüklenmeden son tanım adımından ilerlenemez.
  const nextDisabled = awaitingQuestions;
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
                { width: `${((index + 1) / steps.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Adım {index + 1} / {steps.length}
          </Text>
          <Button title={nextTitle} onPress={goNext} disabled={nextDisabled} />
        </>
      }
    >
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
