import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import Button from '../../components/ui/Button';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import {useAuth} from '../../store/useAuth';
import {colors, spacing} from '../../theme/colors';
import {AuthScreenProps} from '../../navigation/types';

export default function RegisterScreen({
  navigation,
}: AuthScreenProps<'Register'>) {
  const {register, loading, error} = useAuth();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [studentNo, setStudentNo] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  useEffect(() => {
    if (error) {
      Alert.alert('Kayıt başarısız', String(error));
    }
  }, [error]);

  const onSubmit = async () => {
    if (
      !name.trim() ||
      !surname.trim() ||
      !studentNo.trim() ||
      !phone.trim() ||
      !password
    ) {
      Alert.alert('Eksik bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Zayıf şifre', 'Şifre en az 4 karakter olmalı.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Şifre uyuşmuyor', 'Şifreler aynı olmalı.');
      return;
    }

    const result: any = await register({
      name,
      surname,
      ogrenciNo: studentNo,
      phone,
      password,
      passwordRepeat: confirm,
    });

    // Başarılı kayıt (ağ hatası yok ve isSuccess !== false) -> Giriş ekranına dön.
    if (
      result?.meta?.requestStatus === 'fulfilled' &&
      result.payload?.isSuccess !== false
    ) {
      Alert.alert('Kayıt başarılı', 'Artık öğrenci numaranızla giriş yapabilirsiniz.');
      navigation.navigate('Login');
    }
  };

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Yeni Hesap Oluştur</Text>
        <Text style={styles.subtitle}>
          Simülasyona başlamak için kayıt olun.
        </Text>
      </View>

      <TextField
        label="Ad"
        value={name}
        onChangeText={setName}
        placeholder="Esra"
      />
      <TextField
        label="Soyad"
        value={surname}
        onChangeText={setSurname}
        placeholder="Çabaş"
      />
      <TextField
        label="Öğrenci No"
        value={studentNo}
        onChangeText={setStudentNo}
        autoCapitalize="none"
        keyboardType="number-pad"
        placeholder="örn. 210101001"
      />
      <TextField
        label="Telefon"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="05XXXXXXXXX"
      />
      <TextField
        label="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />
      <TextField
        label="Şifre (Tekrar)"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        placeholder="••••••••"
      />

      <Button title="Kayıt Ol" onPress={onSubmit} loading={loading} />
      <Button
        title="Zaten hesabın var mı? Giriş Yap"
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
    marginBottom: spacing.md,
    gap: spacing.xs,
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
