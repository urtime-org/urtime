// Your Firebase config (you gave it!)
const firebaseConfig = {
  apiKey: "AIzaSyCvjjQ72eQ5Lb-AD4U8NlSaMCp4nMn2tZU",
  authDomain: "urtime-91b57.firebaseapp.com",
  projectId: "urtime-91b57",
  storageBucket: "urtime-91b57.firebasestorage.app",
  messagingSenderId: "749763378027",
  appId: "1:749763378027:web:a690b9ae38f7fa601b6a2e"
};

// Initialize
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Optional: auto-redirect to login.html if not logged in
auth.onAuthStateChanged(user => {
  if (!user && !location.href.includes("login.html")) {
    window.location.href = "login.html";
  }
});
