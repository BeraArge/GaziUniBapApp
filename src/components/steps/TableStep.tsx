import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {TableStep as TableStepType} from '../../types/simulation';
import {colors, radius, spacing} from '../../theme/colors';
import Card from '../ui/Card';

// Sabit kolon genişlikleri — tablo yatay kaydırılabilir, böylece dar ekranda
// metin sıkışmaz. İlk kolon (genelde tarih/ad) biraz daha geniş.
const COL_WIDTH = 130;
const FIRST_COL_WIDTH = 150;

function colWidth(index: number) {
  return index === 0 ? FIRST_COL_WIDTH : COL_WIDTH;
}

export default function TableStep({step}: {step: TableStepType}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{step.title}</Text>

      <Card style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            {/* Başlık satırı */}
            <View style={[styles.row, styles.headerRow]}>
              {step.columns.map((col, i) => (
                <Text
                  key={i}
                  style={[styles.cell, styles.headerCell, {width: colWidth(i)}]}>
                  {col}
                </Text>
              ))}
            </View>
            {/* Veri satırları */}
            {step.rows.map((row, r) => (
              <View
                key={r}
                style={[styles.row, r % 2 === 1 && styles.stripedRow]}>
                {row.map((cell, c) => (
                  <Text
                    key={c}
                    style={[
                      styles.cell,
                      {width: colWidth(c)},
                      c === 0 && styles.firstCell,
                    ]}>
                    {cell}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </Card>

      {step.note ? <Text style={styles.note}>ℹ️  {step.note}</Text> : null}
      <Text style={styles.scrollHint}>← Tabloyu yana kaydırabilirsiniz →</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tableCard: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  headerRow: {
    backgroundColor: colors.primary,
  },
  stripedRow: {
    backgroundColor: colors.background,
  },
  cell: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  firstCell: {
    fontWeight: '700',
  },
  headerCell: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  note: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  scrollHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
