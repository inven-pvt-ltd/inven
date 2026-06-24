/**
 * INVEN Portal - Firebase Configuration
 * Initialize Firebase and prepare for authentication
 * TODO: Replace with your Firebase project config
 */

// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// NOTE: In production, use environment variables for sensitive data
// Initialize Firebase when ready
if (typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// Export utilities for Firebase integration
window.FirebaseConfig = {
  config: firebaseConfig,
  initialized: typeof firebase !== 'undefined',
  auth: null,
  db: null,
  storage: null,

  // Initialize services when needed
  init() {
    if (this.initialized) {
      this.auth = firebase.auth();
      this.db = firebase.firestore();
      this.storage = firebase.storage();
      return true;
    }
    return false;
  }
};
