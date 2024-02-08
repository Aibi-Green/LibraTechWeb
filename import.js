// Imports
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

// JSON file paths
const jsonFiles = {
  'admin_t': './json/admin_t.json',
  'books_t': './json/books_t.json',
  'borrow_t': './json/borrow_t.json',
  'returned_t': './json/returned_t.json',
  'student_t': './json/student_t.json'
};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Import Data into Firestore
const importData = async () => {
  try {
    const db = admin.firestore();
    console.log('Firebase Initialized');

    // Loop through each JSON file
    for (const collectionName in jsonFiles) {
      if (jsonFiles.hasOwnProperty(collectionName)) {
        const jsonData = require(jsonFiles[collectionName]);

        // Loop through the data and add each document to Firestore
        for (const doc of jsonData) {
          await db.collection(collectionName).add(doc);
        }

        console.log(`Data from ${collectionName} imported successfully`);
      }
    }

    console.log('All Data Imported Successfully');
  } catch (error) {
    console.error('Error:', error);
  }
};

importData();
