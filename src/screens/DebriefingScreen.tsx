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
Az önce tamamladığınız video tabanlı interaktif simülasyon, sizlerin hasta güvenliği ile ilgili sahneleri izleyerek, hasta güvenliği yetkinliklerinizi geliştirmek amacıyla hazırlanmıştır. Şimdi başlayacağımız çözümleme oturumu, bu sürecin en önemli ve en öğretici aşamasıdır.

Bu oturumda amacımız; kim neyi doğru ya da yanlış yaptığını bulmak değil, yaşanan durumları birlikte düşünmek, anlamlandırmak ve gerçek klinik uygulamalara nasıl daha güvenli şekilde aktarabileceğimizi tartışmaktır. Burada yapılacak paylaşımlar notlandırma amacıyla kullanılmayacaktır. Her görüş ve deneyim, öğrenme sürecinin değerli bir parçasıdır.

Simülasyon sırasında karşılaştığınız olaylar; ilaç uygulamaları, kan transfüzyonu, kayıt süreçleri, hasta izlemi, ekip içi iletişim ve hata bildirimleri gibi gerçek klinik ortamlarda sıklıkla karşılaşılan hasta güvenliği durumlarını yansıtmaktadır. Bu nedenle, hissettiğiniz kararsızlıklar, zorlanmalar ya da fark ettiğiniz eksiklikler son derece doğaldır.

Çözümleme oturumu boyunca sizlerden beklediğimiz düşüncelerinizi açıkça ifade etmenizdir. Şimdi, simülasyon sürecine birlikte geri dönerek deneyimlerimizi paylaşmaya başlayabiliriz.`;

type Phase = {
  asama: string; // API'ye gönderilecek aşama adı
  label: string;
  title: string;
  questions: string[];
};

const PHASES: Phase[] = [
  {
    asama: 'Aşama 1',
    label: '1. AŞAMA',
    title: 'Tepki (Duygusal Farkındalık)',
    questions: [
      'Simülasyon sürecinde kendinizi nasıl hissettiniz?',
      'En çok zorlandığınız ya da sizi düşündüren sahne hangisiydi?',
      '“Burada Merve Hemşire’nin yerinde olsaydım nasıl yaklaşırdım?” diye düşündüğünüz anlar oldu mu?',
    ],
  },
  {
    asama: 'Aşama 2',
    label: '2. AŞAMA',
    title: 'Analiz (Bilişsel ve Klinik Çözümleme)',
    questions: [
      'Bu senaryoda hasta güvenliğini en çok tehdit eden durum sizce neydi?',
      'Hata ya da eksiklik fark edildiğinde hemşirenin yaklaşımı hasta güvenliği kültürüyle uyumlu muydu?',
      'Bu durumun hasta açısından kısa ve uzun vadede ne tür sonuçlara yol açabileceğini düşünüyorsunuz? Eğer fark edilmeseydi süreç nasıl ilerleyebilirdi?',
    ],
  },
  {
    asama: 'Aşama 3',
    label: '3. AŞAMA',
    title: 'Özetleme',
    questions: [
      'Bu simülasyondan sonra klinik uygulamada neyi farklı yapacağınızı düşünüyorsunuz?',
      'Hasta güvenliğini desteklemek için bireysel olarak ve ekip düzeyinde neler yapılabilir?',
      'Bu simülasyon, hasta güvenliğine bakış açınızda nasıl bir farkındalık yarattı?',
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
                  {i + 1}. {q}
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
