// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate01.firebaseapp.com",
  projectId: "mern-estate01",
  storageBucket: "mern-estate01.appspot.com",
  messagingSenderId: "401596791375",
  appId: "1:401596791375:web:3c63fcfdd35e41997c883a",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
