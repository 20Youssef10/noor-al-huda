import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA0Q7SFUTkvj8iyzCM2aYk0lDwuxuMNXDE',
  appId: '1:1024474386791:web:afa7b5df1cde4bfd2adfc2',
  projectId: 'noor-al-huda-260326',
  authDomain: 'noor-al-huda-260326.firebaseapp.com',
  messagingSenderId: '1024474386791',
  storageBucket: 'noor-al-huda-260326.firebasestorage.app',
};

const app = initializeApp(firebaseConfig, `integration-${Date.now()}`);
const auth = getAuth(app);
const db = getFirestore(app);
const email = `integration+${Date.now()}@example.invalid`;
const password = 'NoorAlHuda123!';

try {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  await sendEmailVerification(user);
  await sendPasswordResetEmail(auth, email);

  const userRef = doc(db, 'users', user.uid);
  const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', '2:255');

  await setDoc(
    userRef,
    {
      settings: {
        location: { label: 'القاهرة', latitude: 30.0444, longitude: 31.2357 },
        calculationMethod: 'egyptian',
        reciter: 'Mishary Rashid Alafasy',
        notificationsEnabled: true,
      },
    },
    { merge: true }
  );

  await setDoc(bookmarkRef, {
    surahId: 2,
    surahName: 'البقرة',
    ayahNumber: 255,
    createdAt: new Date().toISOString(),
  });

  const userSnap = await getDoc(userRef);
  const bookmarkSnap = await getDoc(bookmarkRef);

  console.log(
    JSON.stringify({
      createdUser: user.uid,
      settingsWrite: userSnap.exists(),
      bookmarkWrite: bookmarkSnap.exists(),
      emailVerificationRequested: true,
      passwordResetRequested: true,
    })
  );

  await deleteDoc(bookmarkRef);
  await deleteDoc(userRef);
  await deleteUser(user);
  await signOut(auth);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
