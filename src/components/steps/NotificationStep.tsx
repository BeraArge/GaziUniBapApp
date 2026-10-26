import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme/colors';
import Button from '../ui/Button';

type Props = {
  message: string;
  onNext: () => void;
  buttonTitle?: string;
  disabled?: boolean;
};

export default function NotificationStep({ message, onNext, buttonTitle = 'Devam Et', disabled = false }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>i</Text>
        </View>

        <Text style={styles.title}>Bilgilendirme</Text>

        <Text style={styles.message}>{message}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={buttonTitle} onPress={onNext} disabled={disabled} />
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
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
  scrollArea: {
    flex: 1,
  },
});
