import React, {useEffect, useState} from 'react';
import {Alert, Image, StyleSheet, Text, View} from 'react-native';
import Button from '../../components/ui/Button';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import {useAuth} from '../../store/useAuth';
import {colors, spacing} from '../../theme/colors';
import {AuthScreenProps} from '../../navigation/types';

export default function LoginScreen({navigation}: AuthScreenProps<'Login'>) {
  const {login, loading, error} = useAuth();
  const [studentNo, setStudentNo] = useState('');
  const [password, setPassword] = useState('');

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
        <Image
          source={require('../../logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>GüvenSim</Text>
        <View style={styles.projectInfo}>
  <Text style={styles.projectLabel}>
    AKADEMİK ARAŞTIRMA UYGULAMASI
  </Text>

  <Text style={styles.subtitle}>
    Video Tabanlı Simülasyonun Hemşirelik
    Öğrencilerinin Hasta Güvenliği Yetkinliği
    Öz Değerlendirme ve Bilgi Düzeylerine Etkisi
  </Text>
</View>
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
        title="Şifremi Unuttum"
        variant="outline"
        onPress={() => navigation.navigate('ForgotPassword')}
      />
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
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
 projectInfo: {
  borderRadius: 14,
  paddingVertical: 16,
  paddingHorizontal: 18,
  marginTop: 12,
  gap: 8,
},

projectLabel: {
  fontSize: 10,
  fontWeight: '700',
  color: '#64748B',
  letterSpacing: 1.2,
  textAlign: 'center',
},

subtitle: {
  fontSize: 15,
  lineHeight: 20,
  color: colors.text,
  textAlign: 'center',
  fontWeight: '500',
},
});
