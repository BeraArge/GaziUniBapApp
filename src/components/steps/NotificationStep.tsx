
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, spacing} from '../../theme/colors';
import Button from '../ui/Button';

type Props = {
  message: string;
  onNext: () => void;
};

export default function NotificationStep({
  message,
  onNext,
}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>i</Text>
        </View>

        <Text style={styles.title}>
          Bilgilendirme
        </Text>

        <Text style={styles.message}>
          {message}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Devam Et"
          onPress={onNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 17,
    lineHeight: 27,
    color: colors.text,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
});
