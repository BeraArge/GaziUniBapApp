import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {QuestionStep as QuestionStepType} from '../../types/simulation';
import {colors, radius, spacing} from '../../theme/colors';
import Card from '../ui/Card';

type Props = {
  step: QuestionStepType;
  /** Cevap verildiğinde doğru mu bilgisini üst ekrana iletir. */
  onAnswered: (isCorrect: boolean) => void;
};

export default function QuestionStep({step, onAnswered}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === step.correctIndex;

  const handleSelect = (index: number) => {
    if (answered) {
      return; // tek cevap hakkı
    }
    setSelected(index);
    onAnswered(index === step.correctIndex);
  };

  const optionStyle = (index: number) => {
    if (!answered) {
      return styles.option;
    }
    if (index === step.correctIndex) {
      return [styles.option, styles.correctOption];
    }
    if (index === selected) {
      return [styles.option, styles.wrongOption];
    }
    return [styles.option, styles.fadedOption];
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>SORU</Text>
      <Text style={styles.prompt}>{step.prompt}</Text>

      <View style={styles.options}>
        {step.options.map((opt, i) => (
          <Pressable
            key={i}
            onPress={() => handleSelect(i)}
            style={optionStyle(i)}
            disabled={answered}>
            <Text style={styles.optionText}>{opt}</Text>
            {answered && i === step.correctIndex && (
              <Text style={styles.mark}>✓</Text>
            )}
            {answered && i === selected && i !== step.correctIndex && (
              <Text style={styles.mark}>✕</Text>
            )}
          </Pressable>
        ))}
      </View>

      {answered && (
        <Card
          style={
            isCorrect ? styles.feedbackCorrect : styles.feedbackWrong
          }>
          <Text
            style={[
              styles.feedbackTitle,
              {color: isCorrect ? colors.success : colors.danger},
            ]}>
            {isCorrect ? '✓ Doğru!' : '✕ Yanlış'}
          </Text>
          {step.explanation ? (
            <Text style={styles.feedbackText}>{step.explanation}</Text>
          ) : null}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  prompt: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 26,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  correctOption: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  wrongOption: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
  },
  fadedOption: {
    opacity: 0.55,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  mark: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: spacing.sm,
  },
  feedbackCorrect: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
  },
  feedbackWrong: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  feedbackText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
});
