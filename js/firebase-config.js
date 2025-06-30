// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJbVyY-2CirlCbq-YxM4ktFRGOxKe4qPk",
  authDomain: "akermansex-43440.firebaseapp.com",
  projectId: "akermansex-43440",
  storageBucket: "akermansex-43440.firebasestorage.app",
  messagingSenderId: "372092045700",
  appId: "1:372092045700:web:1d9ea0b608531a937775d1",
  measurementId: "G-2GB8DJZBY0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);