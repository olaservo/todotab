import { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import Login from './Login';
import TodoList from './TodoList';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Sign out error:", error));
  };

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-600">TODO App</h1>
        <div>
          <span className="mr-4">Welcome, {user.email}</span>
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </div>
      <TodoList userId={user.uid} />
    </div>
  );
}