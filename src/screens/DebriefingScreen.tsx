import React, {useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ScreenContainer from '../components/ui/ScreenContainer';
import TextField from '../components/ui/TextField';
import {MainScreenProps} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {submitCozumlemeCevap} from '../store/questionsSlice';
import {useAuth} from '../store/useAuth';
import {colors, spacing} from '../theme/colors';

const INTRO = `Sevgili öğrenciler,

Simülasyon sırasında karşılaştığınız olaylar; ilaç güvenliği, kan transfüzyonu güvenliği, enfeksiyonların önlenmesi, hasta düşmelerinin önlenmesi, hasta değerlendirmeleri, güvenli hasta devri, ekip içi iletişim, kayıt süreçleri ve hataların bildirilmesi gibi gerçek klinik uygulamalarda sıklıkla karşılaşılan hasta güvenliği durumlarını yansıtmaktadır. Şimdi yaşadığınız bu deneyimleri ekrana gelecek soruları yanıtlayarak bizimle paylaşabilirsiniz.`;

const CLOSING = `Sevgili öğrenciler,

Video tabanlı simülasyon uygulaması tamamlanmıştır. Bir sonraki aşamada, simülasyon deneyimlerinizi değerlendireceğiniz yüz yüze çözümleme oturumuna geçilecektir.

Teşekkür ederiz.

Araştırma Ekibi.`;

type Phase = {
  asama: string; // API'ye gönderilecek aşama adı
  label: string;
  title: string;
  questions: string[];
};

const PHASES: Phase[] = [
  {
    asama: 'Tanımlama',
    label: '1. AŞAMA',
    title: 'Tanımlama Aşaması',
    questions: [
      'İzlediğiniz simülasyon senaryosunda dikkatinizi çeken olay veya durumu kısaca belirtiniz.',
    ],
  },
  {
    asama: 'Reaksiyon',
    label: '2. AŞAMA',
    title: 'Reaksiyon Aşaması',
    questions: [
      'Simülasyon senaryosunu izlerken neler hissettiniz?',
    ],
  },
];

export default function DebriefingScreen({
  navigation,
}: MainScreenProps<'Debriefing'>) {
  const {logout} = useAuth();
  const dispatch = useAppDispatch();
  const {submitting} = useAppSelector(s => s.questions);

  // Cevaplar "phaseIndex-questionIndex" anahtarıyla saklanır.
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savedPhases, setSavedPhases] = useState<Record<number, boolean>>({});
  const [activePhase, setActivePhase] = useState<number | null>(null);

  const setAnswer = (key: string, value: string) =>
    setAnswers(prev => ({...prev, [key]: value}));

  const submitPhase = async (phaseIndex: number) => {
    const phase = PHASES[phaseIndex];
    const soruCevap = phase.questions.map((soru, i) => ({
      soru,
      cevap: (answers[`${phaseIndex}-${i}`] ?? '').trim(),
    }));

    if (soruCevap.some(sc => !sc.cevap)) {
      Alert.alert(
        'Eksik cevap',
        'Lütfen bu aşamadaki tüm soruları yanıtlayın.',
      );
      return;
    }

    setActivePhase(phaseIndex);
    const result: any = await dispatch(
      submitCozumlemeCevap({asama: phase.asama, soruCevap}),
    );
    setActivePhase(null);

    if (result?.meta?.requestStatus === 'fulfilled') {
      setSavedPhases(prev => ({...prev, [phaseIndex]: true}));
      Alert.alert('Kaydedildi', `${phase.title} cevaplarınız kaydedildi.`);
    } else {
      Alert.alert(
        'Kaydedilemedi',
        String(result?.payload ?? 'Bir hata oluştu, lütfen tekrar deneyin.'),
      );
    }
  };

  return (
    <ScreenContainer
      contentStyle={styles.content}
      footer={<Button title="Çıkış Yap" onPress={logout} />}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🤝</Text>
        <Text style={styles.title}>Çözümleme Oturumu</Text>
        <Text style={styles.subtitle}>Debriefing</Text>
      </View>

      <Card>
        <Text style={styles.body}>{INTRO}</Text>
      </Card>

      {PHASES.map((phase, phaseIndex) => {
        const saved = savedPhases[phaseIndex];
        const busy = submitting && activePhase === phaseIndex;
        return (
          <Card key={phase.asama} style={styles.phaseCard}>
            <Text style={styles.phaseLabel}>{phase.label}</Text>
            <Text style={styles.phaseTitle}>{phase.title}</Text>
            {phase.questions.map((q, i) => (
              <View key={i} style={styles.questionBlock}>
                <Text style={styles.questionText}>
                  {phaseIndex + 1}. {q}
                </Text>
                <TextField
                  value={answers[`${phaseIndex}-${i}`] ?? ''}
                  onChangeText={t => setAnswer(`${phaseIndex}-${i}`, t)}
                  placeholder="Cevabınızı yazın…"
                  multiline
                  editable={!saved}
                />
              </View>
            ))}
            <Button
              title={saved ? 'Kaydedildi ✓' : 'Aşamayı Kaydet'}
              onPress={() => submitPhase(phaseIndex)}
              loading={busy}
              disabled={saved}
            />
          </Card>
        );
      })}

      {PHASES.every((_, index) => savedPhases[index]) && (
        <Card>
          <Text style={styles.body}>{CLOSING}</Text>
        </Card>
      )}

      <Button
        title="Sonuçlara Dön"
        variant="outline"
        onPress={() => navigation.goBack()}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
  },
  body: {
    fontSize: 16,
    lineHeight: 25,
    color: colors.text,
  },
  phaseCard: {
    gap: spacing.md,
  },
  phaseLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  questionBlock: {
    gap: spacing.xs,
  },
  questionText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    fontWeight: '500',
  },
});
