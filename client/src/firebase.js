// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBLXfGAiPPqZYYHSHjLfqefgV2FI9WHUc",
  authDomain: "employee-dashboard-bac9a.firebaseapp.com",
  databaseURL: "https://employee-dashboard-bac9a-default-rtdb.firebaseio.com",
  projectId: "employee-dashboard-bac9a",
  storageBucket: "employee-dashboard-bac9a.firebasestorage.app",
  messagingSenderId: "533437933598",
  appId: "1:533437933598:web:d74b3aaa339ee61f0f660f",
  measurementId: "G-8MM9K1SK0N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getDatabase(app);