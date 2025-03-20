import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD1hOhjU-csXHwoWRx3BQBl7NmWUcL-dDM",
    authDomain: "control-stock-v2.firebaseapp.com",
    projectId: "control-stock-v2",
    storageBucket: "control-stock-v2.firebasestorage.app",
    messagingSenderId: "899103445598",
    appId: "1:899103445598:web:d2d1261364fdef2c2bdacf"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
