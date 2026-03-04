import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDh2HXR1FOb0dweTEJ3YcI4frbOWb3Pqtc",
    authDomain: "itjunction-ea9ce.firebaseapp.com",
    projectId: "itjunction-ea9ce",
    storageBucket: "itjunction-ea9ce.firebasestorage.app",
    messagingSenderId: "427209307731",
    appId: "1:427209307731:web:aaa1fe299f68ea45b2b8a6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
