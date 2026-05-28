import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAjWXlfdi6ZhfyCTA2cdPfnpSLdmdp6RC0",
  authDomain: "neurocient-b8405.firebaseapp.com",
  projectId: "neurocient-b8405",
  storageBucket: "neurocient-b8405.firebasestorage.app",
  messagingSenderId: "159699730401",
  appId: "1:159699730401:web:1c7695fa9c8874c6409ca0",
  measurementId: "G-TRZX15V4WJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
