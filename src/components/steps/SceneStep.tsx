import React, {useEffect, useRef, useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Video from 'react-native-video';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  AnswerRecord,
  QuestionStep as QuestionStepType,
} from '../../types/simulation';
import {colors, radius, spacing} from '../../theme/colors';
import Button from '../ui/Button';
import QuestionStep from './QuestionStep';

type Props = {
  step: QuestionStepType;
  questionNo: number;
  totalQuestions: number;
  /** İlerle/Bitir'e basıldığında verilen cevabın kaydını üst ekrana iletir. */
  onNext: (answer: AnswerRecord) => void;
};

/**
 * Soru adımının tam ekran sunumu.
 *  - Video varsa önce tam ekran oynar; bittiğinde (onEnd) soru fazına geçilir.
 *  - Soru, video son karede duraklamış arka plan üzerine modal kart olarak gelir.
 *  - Video yoksa doğrudan soru fazıyla başlar (düz koyu arka plan).
 */
export default function SceneStep({
  step,
  questionNo,
  totalQuestions,
  onNext,
}: Props) {
  const hasVideo = !!step.videoUrl;
  const [phase, setPhase] = useState<'video' | 'question'>(
    hasVideo ? 'video' : 'question',
  );
  const [showTranscript, setShowTranscript] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const selectedRef = useRef<number | null>(null);

  // Süre ölçümü: soru gösterildiği an, cevap verildiği an.
  const questionShownAtRef = useRef<number>(0);
  const answeredAtRef = useRef<number>(0);

  // Soru fazına geçildiğinde cevaplama süresi sayacını başlat.
  useEffect(() => {
    if (phase === 'question') {
      questionShownAtRef.current = Date.now();
    }
  }, [phase]);

  const handleAnswered = (correct: boolean, selectedIndex: number) => {
    setAnswered(true);
    setIsCorrect(correct);
    selectedRef.current = selectedIndex;
    answeredAtRef.current = Date.now();
  };

  const handleNext = () => {
    const now = Date.now();
    const cevaplamaSuresiSaniye = Math.max(
      0,
      Math.round((answeredAtRef.current - questionShownAtRef.current) / 1000),
    );
    // Açıklama (videoTranscript) yalnızca yanlış cevapta gösterilir; doğruda
    // (veya doğru cevap bilinmiyorsa) okuma süresi 0 gider.
    const knownAnswer = step.correctIndex != null;
    const showedExplanation = knownAnswer && !isCorrect;
    const aciklamaOkumaSuresiSaniye = showedExplanation
      ? Math.max(0, Math.round((now - answeredAtRef.current) / 1000))
      : 0;
    const idx = selectedRef.current ?? 0;
    onNext({
      soruId: step.id,
      verilenCevap: step.optionKeys[idx] ?? '',
      cevaplamaSuresiSaniye,
      aciklamaOkumaSuresiSaniye,
      isCorrect,
    });
  };

  return (
    <Modal visible animationType="fade" presentationStyle="fullScreen">
      <View style={styles.root}>
        {/* Video katmanı (varsa). Soru fazında duraklatılmış arka planda kalır. */}
        {hasVideo && (
          <Video
            source={{uri: step.videoUrl!}}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
            controls={phase === 'video'}
            paused={phase !== 'video'}
            onEnd={() => setPhase('question')}
          />
        )}

        {/* VIDEO FAZI: üstte metin/atlama kontrolleri */}
        {phase === 'video' && (
          <SafeAreaView style={styles.videoControls} edges={['top', 'bottom']}>
            <View style={styles.topBar}>
              <Pressable
                onPress={() => setShowTranscript(v => !v)}
                style={styles.pillBtn}>
                <Text style={styles.pillText}>
                  {showTranscript ? '📕  Metni Gizle' : '📖  Metni Oku'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPhase('question')}
                style={styles.pillBtn}>
                <Text style={styles.pillText}>Soruyu Göster ›</Text>
              </Pressable>
            </View>

            {showTranscript && step.videoTranscript ? (
              <ScrollView style={styles.transcriptBox}>
                <Text style={styles.transcriptText}>
                  {step.videoTranscript}
                </Text>
              </ScrollView>
            ) : null}
          </SafeAreaView>
        )}

        {/* SORU FAZI: koyu overlay + alttan modal kart */}
        {phase === 'question' && (
          <SafeAreaView
            style={[StyleSheet.absoluteFill, styles.dim]}
            edges={['bottom']}>
            <View style={styles.sheet}>
              <Text style={styles.counter}>
                Soru {questionNo} / {totalQuestions}
              </Text>
              <ScrollView
                style={styles.sheetScroll}
                contentContainerStyle={styles.sheetContent}
                showsVerticalScrollIndicator={false}>
                <QuestionStep step={step} onAnswered={handleAnswered} />
              </ScrollView>
              {answered && (
                <Button
                  title={
                    questionNo === totalQuestions
                      ? 'Bitir ve Sonucu Gör'
                      : 'İlerle'
                  }
                  onPress={handleNext}
                />
              )}
            </View>
          </SafeAreaView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoControls: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  pillBtn: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  pillText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  transcriptBox: {
    marginTop: spacing.sm,
    maxHeight: '50%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  transcriptText: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 24,
  },
  dim: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    maxHeight: '88%',
    gap: spacing.md,
  },
  counter: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  sheetScroll: {
    flexGrow: 0,
  },
  sheetContent: {
    paddingBottom: spacing.sm,
  },
});
