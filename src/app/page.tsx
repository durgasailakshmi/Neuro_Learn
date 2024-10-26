"use client";
import { useState } from 'react';
import Image from 'next/image';
import Modal from './Modal';
import CoursesList from './CoursesList';

export default function AuthPage() {
  const [formData, setFormData] = useState({
    accessToken: '',
    mail: '',
    campusId: '',
    name: '',
    password: '',
    verifyPassword: ''
  });
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      await handleLogin();
    } else {
      await handleSignup();
    }
  };

  const handleSignup = async () => {
    if (formData.password !== formData.verifyPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Send signup data to API route
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.mail,
          campusId: formData.campusId,
        }),
      });

      if (!response.ok) throw new Error('Failed to signup');
      
      setLoading(false);
      setModalContent({ title: 'Success', message: 'Signed up successfully!' });
      setShowModal(true);
    } catch (err) {
      setError('Failed to save user profile. Please try again.');
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const token = formData.accessToken || 'mockedAccessToken123';
    localStorage.setItem('accessToken', token);

    try {
      await uploadFilesToFirebase();
      setLoggedIn(true);
      setModalContent({ title: 'Success', message: 'Logged in and files uploaded successfully!' });
      setShowModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
    setLoading(false);
  };

  const uploadFilesToFirebase = async () => {
    setError(null);
    try {
      const response = await fetch('/api/download-file', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to upload files');
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ecaa00]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <Image
            src="/placeholder.svg"
            alt="Company Logo"
            width={120}
            height={120}
            className="rounded-full bg-[#ecaa00] p-2"
          />
        </div>
        <h2 className="text-2xl font-bold text-center text-black mb-6">{isLogin ? 'Login' : 'Signup'}</h2>
        {loggedIn ? (
          <CoursesList />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-black">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#ecaa00]"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="mail" className="block text-sm font-medium text-black">
                    Mail
                  </label>
                  <input
                    id="mail"
                    name="mail"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#ecaa00]"
                    value={formData.mail}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <label htmlFor="campusId" className="block text-sm font-medium text-black">
                Campus ID
              </label>
              <input
                id="campusId"
                name="campusId"
                type="text"
                required
                className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#ecaa00]"
                value={formData.campusId}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#ecaa00]"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="verifyPassword" className="block text-sm font-medium text-black">
                  Verify Password
                </label>
                <input
                  id="verifyPassword"
                  name="verifyPassword"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#ecaa00]"
                  value={formData.verifyPassword}
                  onChange={handleChange}
                />
              </div>
            )}
            {isLogin && (
              <div className="space-y-2">
                <label htmlFor="accessToken" className="block text-sm font-medium text-black">
                  Access Token (optional)
                </label>
                <input
                  id="accessToken"
                  name="accessToken"
                  type="text"
                  className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#ecaa00]"
                  value={formData.accessToken}
                  onChange={handleChange}
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-black text-[#ecaa00] py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ecaa00]"
              disabled={loading}
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Signup'}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
        )}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 w-full text-center text-sm text-blue-500 hover:underline"
        >
          {isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}
        </button>

        {/* Modal Popup */}
        {showModal && (
          <Modal 
            title={modalContent.title} 
            message={modalContent.message} 
            onClose={() => setShowModal(false)} 
          />
        )}
      </div>
    </div>
  );
}
