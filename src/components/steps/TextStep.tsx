import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {TextStep as TextStepType} from '../../types/simulation';
import {colors, spacing} from '../../theme/colors';
import Card from '../ui/Card';

function InfoRow({label, value}: {label: string; value?: string}) {
  if (!value) {
    return null;
  }
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function TextStep({step}: {step: TextStepType}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{step.title}</Text>

      {step.patient && (
        <Card style={styles.patientCard}>
          <Text style={styles.patientName}>{step.patient.fullName}</Text>
          <InfoRow label="Protokol No" value={step.patient.protocolNo} />
          <InfoRow label="Tarih" value={step.patient.date} />
          <InfoRow label="Yaş" value={step.patient.age} />
          <InfoRow label="Cinsiyet" value={step.patient.gender} />
        </Card>
      )}

      <Card>
        <Text style={styles.body}>{step.body}</Text>
      </Card>
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
  patientCard: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
    gap: spacing.xs,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  rowLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  rowValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
});
