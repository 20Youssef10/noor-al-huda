import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GhostButton } from './ui';
import { theme } from '../lib/theme';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export function SelectSheet({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const currentLabel = useMemo(
    () => options.find((item) => item.value === value)?.label ?? label,
    [label, options, value]
  );

  return (
    <>
      <GhostButton label={`${label}: ${currentLabel}`} onPress={() => setVisible(true)} />
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.title}>{label}</Text>
            <ScrollView contentContainerStyle={styles.list}>
              {options.map((item) => (
                <Pressable
                  key={item.value}
                  accessibilityLabel={`اختر ${item.label}`}
                  style={[styles.option, item.value === value ? styles.optionActive : null]}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionTitle}>{item.label}</Text>
                  {item.description ? <Text style={styles.optionDescription}>{item.description}</Text> : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#17110B',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
  },
  title: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.display,
    fontSize: 28,
    textAlign: 'right',
  },
  list: {
    gap: 10,
    paddingTop: 12,
  },
  option: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.12)',
    backgroundColor: theme.colors.surface,
    gap: 4,
  },
  optionActive: {
    borderColor: theme.colors.goldLight,
    backgroundColor: 'rgba(201,168,76,0.14)',
  },
  optionTitle: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15,
    textAlign: 'right',
  },
  optionDescription: {
    color: theme.colors.creamMuted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'right',
  },
});
