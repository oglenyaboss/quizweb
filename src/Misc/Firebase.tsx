// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBOt3UA1S7tvncRSHU2acJ4Td-dIUYJsQ4",
  authDomain: "quizweb-50605.firebaseapp.com",
  projectId: "quizweb-50605",
  storageBucket: "quizweb-50605.appspot.com",
  messagingSenderId: "453736037597",
  appId: "1:453736037597:web:70c8e5cc62c83fd7f2af34",
  measurementId: "G-QYFBQMTL60",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);
