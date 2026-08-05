import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDb06kvUn9pQLnVbllcGNsVogZdqlMjpY8",
  authDomain: "kavithai-abd10.firebaseapp.com",
  projectId: "kavithai-abd10",
  storageBucket: "kavithai-abd10.firebasestorage.app",
  messagingSenderId: "280697919716",
  appId: "1:280697919716:web:287f76534033f8005b74f1",
};

console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Querying Firestore collection 'poems' with status and orderBy...");
try {
  const q = query(collection(db, 'poems'), where('status', '==', 'published'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  console.log(`Success! Found ${snap.size} poems.`);
} catch (err) {
  console.error("Error:", err.message);
}
process.exit(0);
