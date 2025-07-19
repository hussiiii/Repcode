import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        // Your Firebase project's admin SDK configuration
        // Replace these with your actual config values
        projectId: "repcode-84a8f",
        clientEmail: "firebase-adminsdk-fbsvc@repcode-84a8f.iam.gserviceaccount.com",
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      // databaseURL: "https://your-database-url.firebaseio.com", // If you are using Firebase Realtime Database
    });
  } catch (error) {
    console.log('Firebase admin initialization error', error.stack);
  }
}
export default admin; 