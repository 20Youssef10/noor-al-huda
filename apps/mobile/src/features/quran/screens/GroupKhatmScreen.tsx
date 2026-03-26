import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { addDoc, arrayUnion, collection, doc, getDocs, increment, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';

import { db, getCurrentUser } from '../../../lib/firebase';
import { storage } from '../../../lib/mmkv';
import { theme } from '../../../lib/theme';
import { Page, GhostButton, PrimaryButton, SectionHeader, SurfaceCard } from '../../../components/ui';

function getDeviceIdentity() {
  const existing = storage.getString('anonymous_device_id');
  if (existing) return existing;
  const created = `device-${Math.random().toString(36).slice(2, 10)}`;
  storage.set('anonymous_device_id', created);
  return created;
}

function buildInviteCode() {
  return `NOOR${Math.floor(10 + Math.random() * 89)}`;
}

export function GroupKhatmScreen() {
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [joinedGroupId, setJoinedGroupId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ name: string; total_pages_done: number; invite_code: string } | null>(null);

  useEffect(() => {
    if (!db || !joinedGroupId) return;
    return onSnapshot(doc(db, 'khatm_progress', joinedGroupId), (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setProgress((current) => ({
          name: current?.name ?? 'ختمة جماعية',
          invite_code: current?.invite_code ?? inviteCode,
          total_pages_done: Number(data.total_pages_done ?? 0),
        }));
      }
    });
  }, [inviteCode, joinedGroupId]);

  async function createGroup() {
    if (!db || !groupName.trim()) return;
    const identity = getCurrentUser()?.uid ?? getDeviceIdentity();
    const code = buildInviteCode();
    const groupRef = await addDoc(collection(db, 'khatm_groups'), {
      name: groupName,
      created_by: identity,
      created_at: serverTimestamp(),
      member_count: 1,
      status: 'active',
      invite_code: code,
      pages_per_member: 604,
    });

    await setDoc(doc(db, 'khatm_members', `${groupRef.id}__${identity}`), {
      user_id: identity,
      display_name: getCurrentUser()?.displayName ?? 'عضو نور الهدى',
      assigned_pages: Array.from({ length: 604 }, (_, index) => index + 1),
      completed_pages: [],
      joined_at: serverTimestamp(),
    });

    await setDoc(doc(db, 'khatm_progress', groupRef.id), {
      total_pages_done: 0,
      last_updated: serverTimestamp(),
    });

    setInviteCode(code);
    setJoinedGroupId(groupRef.id);
    setProgress({ name: groupName, total_pages_done: 0, invite_code: code });
  }

  async function joinGroup() {
    if (!db || !inviteCode.trim()) return;
    const identity = getCurrentUser()?.uid ?? getDeviceIdentity();
    const snapshot = await getDocs(query(collection(db, 'khatm_groups'), where('invite_code', '==', inviteCode.trim().toUpperCase())));
    const target = snapshot.docs[0];
    if (!target) {
      Alert.alert('تعذر الانضمام', 'لم يتم العثور على مجموعة بهذا الرمز.');
      return;
    }

    await setDoc(doc(db, 'khatm_members', `${target.id}__${identity}`), {
      user_id: identity,
      display_name: getCurrentUser()?.displayName ?? 'عضو نور الهدى',
      assigned_pages: Array.from({ length: 50 }, (_, index) => index + 1),
      completed_pages: [],
      joined_at: serverTimestamp(),
    }, { merge: true });

    await updateDoc(doc(db, 'khatm_groups', target.id), {
      member_count: increment(1),
    });

    setJoinedGroupId(target.id);
    setProgress({
      name: String(target.data().name ?? 'ختمة جماعية'),
      total_pages_done: 0,
      invite_code: inviteCode.trim().toUpperCase(),
    });
  }

  async function markPageDone(page: number) {
    if (!db || !joinedGroupId) return;
    const identity = getCurrentUser()?.uid ?? getDeviceIdentity();
    await updateDoc(doc(db, 'khatm_members', `${joinedGroupId}__${identity}`), {
      completed_pages: arrayUnion(page),
    });
    await updateDoc(doc(db, 'khatm_progress', joinedGroupId), {
      total_pages_done: increment(1),
      last_updated: serverTimestamp(),
    });
  }

  const percent = useMemo(() => Math.round(((progress?.total_pages_done ?? 0) / 604) * 100), [progress]);

  return (
    <Page>
      <SectionHeader title="الختمة الجماعية" subtitle="تقاسم صفحات المصحف ومتابعة الإنجاز لحظياً" />
      <SurfaceCard accent="emerald">
        <TextInput value={groupName} onChangeText={setGroupName} placeholder="اسم المجموعة" placeholderTextColor={theme.colors.creamFaint} style={styles.input} textAlign="right" />
        <PrimaryButton label="إنشاء مجموعة" onPress={() => void createGroup()} tone="emerald" disabled={!groupName.trim()} />
      </SurfaceCard>
      <SurfaceCard>
        <TextInput value={inviteCode} onChangeText={setInviteCode} placeholder="رمز الدعوة" placeholderTextColor={theme.colors.creamFaint} style={styles.input} textAlign="center" autoCapitalize="characters" />
        <GhostButton label="الانضمام بالرمز" onPress={() => void joinGroup()} />
      </SurfaceCard>
      {progress ? (
        <SurfaceCard accent="blue">
          <Text style={styles.title}>{progress.name}</Text>
          <Text style={styles.subtitle}>الإنجاز: {progress.total_pages_done} / 604 · {percent}%</Text>
          <FlatList
            data={Array.from({ length: 20 }, (_, index) => index + 1)}
            horizontal
            inverted
            keyExtractor={(item) => String(item)}
            contentContainerStyle={styles.pagesRow}
            renderItem={({ item }) => <GhostButton label={`ص ${item}`} onPress={() => void markPageDone(item)} />}
          />
        </SurfaceCard>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  input: { borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceStrong, color: theme.colors.cream, padding: 14, fontFamily: theme.fonts.body },
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 24, textAlign: 'right' },
  subtitle: { color: theme.colors.creamMuted, fontFamily: theme.fonts.body, fontSize: 14, textAlign: 'right' },
  pagesRow: { gap: 8 },
});
