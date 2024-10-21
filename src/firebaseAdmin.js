import admin from 'firebase-admin';

// Path to your Firebase service account key file
const serviceAccount = require('./config/firebase-service-account-key.json');

// Check if the Firebase app has already been initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'neurolearn-c2597.appspot.com', // Replace with your Firebase Storage bucket URL
  });
}

// Access Firebase Storage bucket
const bucket = admin.storage().bucket();

export { bucket };
