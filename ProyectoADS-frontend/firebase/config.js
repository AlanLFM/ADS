// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4ID5W0wOkQPs5No4BG_Xq0h8nKVxarvY",
  authDomain: "adsp-d9993.firebaseapp.com",
  projectId: "adsp-d9993",
  storageBucket: "adsp-d9993.firebasestorage.app",
  messagingSenderId: "449520873446",
  appId: "1:449520873446:web:a305f6ce4eff8e54677027",
  measurementId: "G-MBDZ7Q9QGR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider= new GoogleAuthProvider();
const analytics = getAnalytics(app);

export { app, auth, analytics, provider };