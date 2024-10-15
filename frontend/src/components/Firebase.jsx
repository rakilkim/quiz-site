// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth }  from "firebase/auth"
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCoyyCzjLv7sHqvpwtD6GB0Sd9X2xxTFZI",
  authDomain: "quiz-website-16da5.firebaseapp.com",
  projectId: "quiz-website-16da5",
  storageBucket: "quiz-website-16da5.appspot.com",
  messagingSenderId: "1708884840",
  appId: "1:1708884840:web:60c43ffb4b89ddd2630cdd",
  measurementId: "G-Z8XG1V1T31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);
export default app;