import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";

export function initializeFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyApcUVgvBWTEqlKCINOFnRkttZbJ2EjMXY",
        authDomain: "spartaminiproject.firebaseapp.com",
        databaseURL: "https://spartaminiproject-default-rtdb.firebaseio.com",
        projectId: "spartaminiproject",
        storageBucket: "spartaminiproject.appspot.com",
        messagingSenderId: "973891752316",
        appId: "1:973891752316:web:e03f9c7bc4bc11ab9954f9",
        measurementId: "G-0WF3E033D3"
    };
    
    // Initialize Firebase
    return initializeApp(firebaseConfig);
}
        
        
