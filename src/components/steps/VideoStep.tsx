import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {VideoStep as VideoStepType} from '../../types/simulation';
import {colors, radius, spacing} from '../../theme/colors';
import Card from '../ui/Card';

/**
 * Video adımı. Şu an gerçek oynatıcı yerine bir placeholder gösterir; videoUrl
 * geldiğinde buraya react-native-video <Video /> bileşeni eklenebilir.
 * "Metni Oku" butonu öyküyü transcript olarak gösterir.
 */
export default function VideoStep({step}: {step: VideoStepType}) {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{step.title}</Text>

      {/* Video placeholder */}
      <View style={styles.player}>
        <Text style={styles.playIcon}>▶︎</Text>
        <Text style={styles.playerText}>Video Oynatıcı</Text>
        <Text style={styles.playerHint}>
          {step.videoUrl ? step.videoUrl : 'Demo — video yakında eklenecek'}
        </Text>
      </View>

      <Pressable
        onPress={() => setShowTranscript(v => !v)}
        style={({pressed}) => [styles.readBtn, pressed && styles.pressed]}>
        <Text style={styles.readBtnText}>
          {showTranscript ? '📕  Metni Gizle' : '📖  Metni Oku'}
        </Text>
      </Pressable>

      {showTranscript && (
        <Card>
          <Text style={styles.transcript}>{step.transcript}</Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  player: {
    backgroundColor: '#0B1F20',
    borderRadius: radius.lg,
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  playIcon: {
    fontSize: 44,
    color: colors.white,
  },
  playerText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  playerHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
  },
  pressed: {
    opacity: 0.7,
  },
  readBtnText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  transcript: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
});
