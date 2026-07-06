/**
 * INVEN Portal - Firebase Configuration
 * Initialize Firebase and prepare portal services
 */

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSltiogLOTnQ4xoI5Yb7q0S_WT83Hc3qQ",
  authDomain: "inven-pvt-ltd.firebaseapp.com",
  projectId: "inven-pvt-ltd",
  storageBucket: "inven-pvt-ltd.firebasestorage.app",
  messagingSenderId: "248000388159",
  appId: "1:248000388159:web:68d7a56acc929dd007ec8a",
  measurementId: "G-05H2TBEFMY"
};

// Initialize Firebase when ready
if (typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(firebaseConfig);
    window.firebaseAuth = firebase.auth();
    window.firebaseDb = firebase.firestore();
    window.firebaseStorage = firebase.storage();
    window.signInWithEmailAndPassword = (auth, email, password) => auth.signInWithEmailAndPassword(email, password);
    window.doc = (_db, collectionName, docId) => ({ collectionName, docId });
    window.getDoc = async (ref) => {
      const snapshot = await window.firebaseDb.collection(ref.collectionName).doc(ref.docId).get();
      return {
        exists: () => snapshot.exists,
        data: () => snapshot.data()
      };
    };
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// Export utilities for Firebase integration
window.FirebaseConfig = {
  config: firebaseConfig,
  initialized: typeof firebase !== 'undefined',
  auth: window.firebaseAuth || null,
  db: window.firebaseDb || null,
  storage: window.firebaseStorage || null,

  // Initialize services when needed
  init() {
    if (this.initialized) {
      this.auth = window.firebaseAuth;
      this.db = window.firebaseDb;
      this.storage = window.firebaseStorage;
      return true;
    }
    return false;
  }
};
