import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';
import { z } from 'zod';

import { apiBaseUrl } from '../../lib/api';
import { stopSharedAudio } from '../../lib/audio';
import { theme } from '../../lib/theme';

const voiceSchema = z.object({
  transcript: z.string(),
  intent: z.string(),
  params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  confidence: z.number().optional(),
});

export function VoiceCommandButton() {
  const router = useRouter();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [transcript, setTranscript] = useState('');

  async function startRecording() {
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (permission.status !== 'granted') return;
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
      allowsRecording: true,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    });
    await recorder.prepareToRecordAsync();
    recorder.record({ forDuration: 8 });
  }

  async function stopRecording() {
    if (!recorderState.isRecording) return;
    await recorder.stop();
    const uri = recorder.uri;
    if (!uri) return;
    try {
      const blob = await (await fetch(uri)).blob();
      const form = new FormData();
      form.append('audio', blob, 'voice.m4a');
      const response = await fetch(`${apiBaseUrl}/api/voice/command`, { method: 'POST', body: form });
      const payload = voiceSchema.parse(await response.json());
      setTranscript(payload.transcript);
      await executeIntent(payload);
    } catch (error) {
      Alert.alert('تعذر تنفيذ الأمر الصوتي', error instanceof Error ? error.message : 'حدث خطأ أثناء معالجة الصوت.');
    }
  }

  async function executeIntent(intent: z.infer<typeof voiceSchema>) {
    switch (intent.intent) {
      case 'OPEN_SURAH':
        if (typeof intent.params.surah_number === 'number') router.push(`/quran/${intent.params.surah_number}`);
        break;
      case 'PRAYER_TIME':
        router.push('/(tabs)/prayer');
        break;
      case 'PLAY_RADIO':
        router.push('/(tabs)/radio');
        break;
      case 'STOP_AUDIO':
        await stopSharedAudio();
        break;
      case 'OPEN_AZKAR':
        router.push('/(tabs)/azkar');
        break;
      default:
        break;
    }
    Speech.speak(`تم تنفيذ الأمر: ${intent.intent}`, { language: 'ar' });
  }

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityLabel="زر الأوامر الصوتية"
        onLongPress={() => void startRecording()}
        onPressOut={() => void stopRecording()}
        style={[styles.button, recorderState.isRecording ? styles.buttonActive : null]}
      >
        <Text style={styles.buttonText}>{recorderState.isRecording ? '... استمع' : '🎤'}</Text>
      </Pressable>
      {transcript ? <Text style={styles.transcript}>{transcript}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'flex-end', gap: 8 },
  button: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.gold, alignItems: 'center', justifyContent: 'center' },
  buttonActive: { backgroundColor: theme.colors.emeraldLight },
  buttonText: { color: '#1B150F', fontFamily: theme.fonts.bodyBlack, fontSize: 18 },
  transcript: { color: theme.colors.creamFaint, fontFamily: theme.fonts.body, fontSize: 12, textAlign: 'right' },
});
