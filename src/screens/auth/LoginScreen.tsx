import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import Button from '../../components/ui/Button';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import {useAuth} from '../../store/useAuth';
import {colors, spacing} from '../../theme/colors';
import {AuthScreenProps} from '../../navigation/types';

export default function LoginScreen({navigation}: AuthScreenProps<'Login'>) {
  const {login, loading, error} = useAuth();
  const [studentNo, setStudentNo] = useState('02192345896');
  const [password, setPassword] = useState('123123');

  // Hata state'e düştüğünde kullanıcıya göster. Başarıda token set olur ve
  // RootNavigator otomatik olarak ana akışa geçer.
  useEffect(() => {
    if (error) {
      Alert.alert('Giriş başarısız', String(error));
    }
  }, [error]);

  const onSubmit = () => {
    if (!studentNo.trim() || !password) {
      Alert.alert('Eksik bilgi', 'Lütfen öğrenci numaranızı ve şifrenizi girin.');
      return;
    }
    login({ogrenciNo: studentNo, password});
  };

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>🩺</Text>
        <Text style={styles.title}>Hemşirelik Simülasyonu</Text>
        <Text style={styles.subtitle}>
          Devam etmek için hesabınıza giriş yapın.
        </Text>
      </View>

      <TextField
        label="Öğrenci No"
        value={studentNo}
        onChangeText={setStudentNo}
        autoCapitalize="none"
        keyboardType="number-pad"
        placeholder="örn. 210101001"
      />
      <TextField
        label="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />

      <Button title="Giriş Yap" onPress={onSubmit} loading={loading} />
      <Button
        title="Hesabın yok mu? Kayıt Ol"
        variant="outline"
        onPress={() => navigation.navigate('Register')}
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
    textAlign: 'center',
  },
});
