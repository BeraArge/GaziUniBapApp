import React, {useEffect, useMemo, useRef, useState} from 'react';
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
import {fetchQuestions, submitAnswers} from '../store/questionsSlice';
import {colors, spacing} from '../theme/colors';
import {AnswerRecord, Step} from '../types/simulation';

export default function SimulationScreen({
  navigation,
}: MainScreenProps<'Simulation'>) {
  const dispatch = useAppDispatch();
  const {items, meta, loading, error, loaded} = useAppSelector(
    s => s.questions,
  );

  const [index, setIndex] = useState(0);
  // Doğru sayısı (mutasyon için ref).
  const correctRef = useRef(0);
  // Bu oturumda verilen cevaplar (part bitiminde toplu gönderilir).
  const answersRef = useRef<AnswerRecord[]>([]);
  // Devam (resume) konumlandırması yalnızca bir kez yapılır.
  const positionedRef = useRef(false);

  // Açılışta soruları API'den çek.
  useEffect(() => {
    if (!loaded) {
      dispatch(fetchQuestions());
    }
  }, [dispatch, loaded]);

  // Statik vaka adımları + API'den gelen sorular.
  const steps: Step[] = useMemo(() => [...demoCase.steps, ...items], [items]);
  const totalQuestions = items.length;

  // Statik tanım adımlarının sayısı (sorular bunlardan sonra eklenir).
  const staticCount = steps.length - totalQuestions;
  const {partBreakQuestionCount, ilkPartTamamlandiMi, kalanSoruSayisi} = meta;

  // Devam (resume) atlama miktarı (sorular arasında 0-based).
  // Backend devam ederken `sorular`'ı yalnızca kalan sorularla döndürebilir;
  // bu durumda totalQuestions == kalanSoruSayisi olur → offset 0 (listenin
  // başından başla). Tüm soruları döndürürse offset = atlanacak soru sayısı.
  const resumeOffset = ilkPartTamamlandiMi
    ? Math.max(0, totalQuestions - (kalanSoruSayisi || totalQuestions))
    : 0;

  // Devam: ilk part tamamlandıysa statik adımları atlayıp doğrudan kalan ilk
  // sorudan başla (bir kez).
  useEffect(() => {
    if (loaded && totalQuestions > 0 && !positionedRef.current) {
      positionedRef.current = true;
      if (ilkPartTamamlandiMi) {
        setIndex(staticCount + resumeOffset);
      }
    }
  }, [loaded, totalQuestions, ilkPartTamamlandiMi, staticCount, resumeOffset]);

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

  const step = steps[index];
  const isLast = index === steps.length - 1;
  const isQuestion = step.type === 'question';

  // O anki sorunun 0-based sırası (sorular arasında).
  const questionOrdinal = index - staticCount;
  // Part-arası sorusu: ilk part'ın son sorusu (count → 0-based index).
  const isBreakQuestion =
    partBreakQuestionCount > 0 &&
    questionOrdinal === partBreakQuestionCount - 1 &&
    !ilkPartTamamlandiMi;

  // Tanım adımlarının sonuna gelindi ama sorular henüz hazır değil.
  const awaitingQuestions = isLast && !loaded;

  // Soru adımı: tam ekran video + modal soru olarak sunulur (SceneStep).
  const handleSceneNext = async (answer: AnswerRecord) => {
    if (answer.isCorrect) {
      correctRef.current += 1;
    }
    answersRef.current.push(answer);

    // Part 1'in son sorusu işaretlendi → ara vermek isteyip istemediğini sor.
    // Sadece ARA VERİRSE part 1 cevapları ayrı gönderilir. Devam ederse hiçbir
    // şey gönderilmez; tüm cevaplar en sonda tek seferde gönderilir.
    if (isBreakQuestion) {
      Alert.alert(
        'Ara',
        'Ara vermek ister misiniz?',
        [
          {
            text: 'Hayır',
            style: 'cancel',
            onPress: () => goNext(),
          },
          {
            text: 'Evet',
            onPress: () => {
              dispatch(submitAnswers({cevaplar: answersRef.current.slice()}));
              navigation.replace('Break');
            },
          },
        ],
        {cancelable: false},
      );
      return;
    }

    // Simülasyonun son sorusu → bu oturumdaki TÜM cevapları tek seferde gönder.
    if (isLast) {
      // Skor/sıralama güncel olsun diye gönderimi bekle, sonra sonuca geç.
      await dispatch(submitAnswers({cevaplar: answersRef.current.slice()}));
      goToResult();
      return;
    }

    goNext();
  };

  // Görüntülenecek soru numarası (oturum başlangıcından itibaren) ve toplam.
  const sessionStartOrdinal = resumeOffset;
  const displayQuestionNo = questionOrdinal - sessionStartOrdinal + 1;
  const displayTotal = kalanSoruSayisi || totalQuestions;

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
