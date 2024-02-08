const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALS7TGmf8oFuU9XHi9stZ3vxsHdUq0aPQ",
  authDomain: "libratech-42a74.firebaseapp.com",
  projectId: "libratech-42a74",
  storageBucket: "libratech-42a74.appspot.com",
  messagingSenderId: "924171420578",
  appId: "1:924171420578:web:0d79df408bcbddf686a8fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = admin.firestore();

module.exports = db;