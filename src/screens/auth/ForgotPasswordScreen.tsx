import React, {useState} from 'react';
import {Alert, Image, StyleSheet, Text, View} from 'react-native';
import Button from '../../components/ui/Button';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import {useAppDispatch} from '../../store/hooks';
import {forgotPassword} from '../../store/authSlice';
import {colors, spacing} from '../../theme/colors';
import {AuthScreenProps} from '../../navigation/types';

export default function ForgotPasswordScreen({
  navigation,
}: AuthScreenProps<'ForgotPassword'>) {
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const trimmed = phone.trim();
    if (!trimmed) {
      Alert.alert('Eksik bilgi', 'Lütfen telefon numaranızı girin.');
      return;
    }

    setLoading(true);
    try {
      const result: any = await dispatch(forgotPassword({phone: trimmed}));
      if (
        result?.meta?.requestStatus === 'fulfilled' &&
        result.payload?.isSuccess !== false
      ) {
        Alert.alert(
          'Talep alındı',
          result.payload?.message ??
            'Şifre sıfırlama bilgileri telefonunuza gönderildi.',
          [{text: 'Tamam', onPress: () => navigation.navigate('Login')}],
        );
      } else {
        const message =
          result.payload?.message ??
          (typeof result.payload === 'string'
            ? result.payload
            : 'İşlem başarısız. Lütfen tekrar deneyin.');
        Alert.alert('Hata', String(message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.header}>
        <Image
          source={require('../../logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Şifremi Unuttum</Text>
        <Text style={styles.subtitle}>
          Kayıtlı telefon numaranızı girin; şifre sıfırlama bilgilerini
          gönderelim.
        </Text>
      </View>

      <TextField
        label="Telefon"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="5XXXXXXXXX"
        maxLength={10}
      />

      <Button title="Gönder" onPress={onSubmit} loading={loading} />
      <Button
        title="Giriş ekranına dön"
        variant="outline"
        onPress={() => navigation.goBack()}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  logo: {
    width: 96,
    height: 96,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
