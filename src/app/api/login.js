// /api/login.js
import { db } from '../../firebaseAdmin';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      const userRef = db.collection('users').doc(email);
      const doc = await userRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = doc.data();
      if (userData.password === password) {
        // Success (In a real app, implement secure session handling)
        res.status(200).json({ message: 'Login successful', user: userData });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error logging in: ' + error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
