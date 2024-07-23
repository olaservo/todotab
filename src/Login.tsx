import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { 
  signInWithPopup,
  GoogleAuthProvider,
  User,
  AuthError 
} from 'firebase/auth';

interface LoginProps {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export default function Login({ setUser }: LoginProps) {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setUser(userCredential.user);
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };

  const handleAuthError = (error: AuthError) => {
    console.error("Authentication error:", error);
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        setError("Sign-in popup was closed before completing the process. Please try again.");
        break;
      case 'auth/cancelled-popup-request':
        setError("The sign-in process was cancelled. Please try again.");
        break;
      case 'auth/popup-blocked':
        setError("The sign-in popup was blocked by the browser. Please allow popups for this site and try again.");
        break;
      case 'auth/account-exists-with-different-credential':
        setError("An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.");
        break;
      default:
        setError("An error occurred during sign-in. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-md p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-300">Mission Control Access</h2>
        {error && (
          <div className="bg-red-900 border border-red-700 text-gray-200 px-4 py-3 rounded-lg mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <button 
          onClick={handleGoogleSignIn}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-300 flex items-center justify-center"
        >
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
          </svg>
          Sign in with Google
        </button>
        <p className="mt-6 text-center text-gray-400">
          Use your Google account to access the Mission Planner
        </p>
      </div>
    </div>
  );
}