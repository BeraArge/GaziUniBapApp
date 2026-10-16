import React, { useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AnswerRecord,
  QuestionStep as QuestionStepType,
} from '../../types/simulation';
import { colors, radius, spacing } from '../../theme/colors';
import Button from '../ui/Button';
import QuestionStep from './QuestionStep';
import NotificationStep from './NotificationStep';

type Props = {
  step: QuestionStepType;
  questionNo: number;
  totalQuestions: number;
  /** İlerle/Bitir'e basıldığında verilen cevabın kaydını üst ekrana iletir. */
  onNext: (answer: AnswerRecord) => void;
  onStepComplete?: () => void;
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
  onStepComplete,
}: Props) {
  const hasVideo = !!step.videoUrl;
  const [phase, setPhase] = useState<'video' | 'question' | 'notification'>(
    hasVideo ? 'video' : step.prompt?.trim() ? 'question' : 'notification',
  );
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const videoEndedRef = useRef(false);
  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const selectedRef = useRef<number | null>(null);
  const pendingAnswerRef = useRef<AnswerRecord | null>(null);
  const openEndedTextRef = useRef<string | null>(null);

  // Süre ölçümü: soru gösterildiği an, cevap verildiği an.
  const questionShownAtRef = useRef<number>(0);
  const answeredAtRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (waitTimerRef.current) {
        clearTimeout(waitTimerRef.current);
      }
    };
  }, []);

  const handleVideoEnd = () => {
    if (videoEndedRef.current) {
      return;
    }

    videoEndedRef.current = true;

    const seconds = Math.max(0, Number(step.beklemeSuresi ?? 0));
    setRemainingSeconds(Math.ceil(seconds));

    const finishVideo = () => {
      setWaitingForNext(false);

      // Sorusu olmayan video tamamlandı.
      if (!step.prompt?.trim()) {
        if (step.bildirimMetni?.trim()) {
          setPhase('notification');
        } else {
          onStepComplete?.();
        }
        return;
      }

      // Soru varsa soru ekranına geç.
      setPhase('question');
    };

    if (seconds === 0) {
      finishVideo();
      return;
    }

    setWaitingForNext(true);

    waitTimerRef.current = setTimeout(() => {
      finishVideo();
    }, seconds * 1000);
  };

  useEffect(() => {
    if (!waitingForNext) {
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds(previous => Math.max(0, previous - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [waitingForNext]);

  // Soru fazına geçildiğinde cevaplama süresi sayacını başlat.
  useEffect(() => {
    if (phase === 'question') {
      questionShownAtRef.current = Date.now();
    }
  }, [phase]);

  const handleAnswered = (
    correct: boolean,
    selectedIndex: number,
    openEndedText?: string,
  ) => {
    setAnswered(true);
    setIsCorrect(correct);
    selectedRef.current = selectedIndex;
    openEndedTextRef.current = openEndedText ?? null;
    answeredAtRef.current = Date.now();
  };

  const handleNext = () => {
    const now = Date.now();

    const cevaplamaSuresiSaniye = Math.max(
      0,
      Math.round((answeredAtRef.current - questionShownAtRef.current) / 1000),
    );

    const knownAnswer = step.correctIndex != null;
    const showedExplanation = knownAnswer && !isCorrect;

    const aciklamaOkumaSuresiSaniye = showedExplanation
      ? Math.max(0, Math.round((now - answeredAtRef.current) / 1000))
      : 0;

    const idx = selectedRef.current ?? 0;

    const answer: AnswerRecord = {
      soruId: step.id,
      verilenCevap: step.isOpenEnded
        ? openEndedTextRef.current ?? ''
        : step.optionKeys[idx] ?? '',
      cevaplamaSuresiSaniye,
      aciklamaOkumaSuresiSaniye,
      isCorrect,
    };

    // Bildirim varsa önce bildirimi göster.
    if (step.bildirimMetni?.trim()) {
      pendingAnswerRef.current = answer;
      setPhase('notification');
      return;
    }

    onNext(answer);
  };

  return (
    <Modal visible animationType="fade" presentationStyle="fullScreen">
      <View style={styles.root}>
        {/* Video katmanı (varsa). Soru fazında duraklatılmış arka planda kalır. */}
        {hasVideo && (
          <Video
            source={{ uri: step.videoUrl! }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
            controls={phase === 'video'}
            paused={phase !== 'video' || waitingForNext}
            onEnd={handleVideoEnd}
          />
        )}

        {phase === 'video' && waitingForNext && (
          <View style={styles.waitOverlay} pointerEvents="none">
            <Text style={styles.waitTitle}>Video tamamlandı</Text>

            <Text style={styles.waitTime}>
              {Math.floor(remainingSeconds / 60)
                .toString()
                .padStart(2, '0')}
              :{(remainingSeconds % 60).toString().padStart(2, '0')}
            </Text>

            <Text style={styles.waitDescription}>
              Bekleme süresi sonunda otomatik devam edilecek.
            </Text>
          </View>
        )}

        {/* BİLDİRİM FAZI */}
        {phase === 'notification' && (
          <NotificationStep
            message={step.bildirimMetni ?? ''}
            onNext={() => {
              if (pendingAnswerRef.current) {
                const answer = pendingAnswerRef.current;
                pendingAnswerRef.current = null;
                onNext(answer);
              } else {
                onStepComplete?.();
              }
            }}
          />
        )}

        {/* SORU FAZI: koyu overlay + alttan modal kart */}
        {phase === 'question' && (
          <SafeAreaView
            style={[StyleSheet.absoluteFill, styles.dim]}
            edges={['bottom']}
          >
            <View style={styles.sheet}>
              <Text style={styles.counter}>
                Soru {questionNo} / {totalQuestions}
              </Text>
              <ScrollView
                style={styles.sheetScroll}
                contentContainerStyle={styles.sheetContent}
                showsVerticalScrollIndicator={false}
              >
                <QuestionStep step={step} onAnswered={handleAnswered} />
              </ScrollView>
              {answered && (
                <Button
                  title={
                    questionNo === totalQuestions && !step.bildirimMetni?.trim()
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
  waitOverlay: {
    position: 'absolute',
    bottom: 45,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 6,
  },
  waitTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  waitTime: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  waitDescription: {
    color: '#D1D5DB',
    fontSize: 12,
    textAlign: 'center',
  },
});
