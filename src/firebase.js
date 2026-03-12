import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDcKkixvmMO4f754rWS3Kw-2EuQSrvE6Yw",
    authDomain: "centsible-a2fbd.firebaseapp.com",
    projectId: "centsible-a2fbd",
    storageBucket: "centsible-a2fbd.firebasestorage.app",
    messagingSenderId: "73556705860",
    appId: "1:73556705860:web:6914b29be3e31dbcfab211",
    measurementId: "G-9EDZTMR3H5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);