// /api/signup.js
import { db } from '../../firebaseAdmin';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, email, password } = req.body; // Example fields; add others as needed

    try {
      const userRef = db.collection('users').doc(email);
      await userRef.set({
        username,
        email,
        password, // In a real app, hash passwords before storing them
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({ message: 'User signed up successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error creating user: ' + error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
