"use client";
import { useState } from 'react';
import CoursesList from './CoursesList';
import Modal from './Modal';
import './styles.css';

export default function AuthAndUploadPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [campusId, setCampusId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userData = { name, campusId, email, password };
    setModalContent({ title: 'Success', message: 'Signed up successfully!' });
    setShowModal(true);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = accessToken || 'mockedAccessToken123';
    localStorage.setItem('accessToken', token);
    await uploadFilesToFirebase();
    setLoggedIn(true);
  };

  const uploadFilesToFirebase = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/download-file', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to upload files');
      setModalContent({ title: 'Success', message: 'Files uploaded successfully!' });
      setShowModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {loggedIn ? (
        <CoursesList />
      ) : (
        <div className="auth-container">
          <h1 className="auth-title">{isLogin ? 'Login' : 'Signup'}</h1>
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="auth-form">
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </>
            )}
            <input
              type="text"
              placeholder="Campus ID"
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
            {isLogin && (
              <input
                type="text"
                placeholder="Access Token (optional)"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="input-field"
              />
            )}
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Signup'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </form>

          <button onClick={() => setIsLogin(!isLogin)} className="switch-button">
            {isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}
          </button>
        </div>
      )}

      {/* Modal Popup */}
      {showModal && (
        <Modal 
          title={modalContent.title} 
          message={modalContent.message} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}
