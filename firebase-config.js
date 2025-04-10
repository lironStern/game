// תצטרכי להחליף את הערכים האלה עם הפרטים שתקבלי מקונסולת Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_ID",
    appId: "YOUR_APP_ID"
  };
  
  // אתחול Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();