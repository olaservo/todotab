import { ref, set, get } from 'firebase/database';
import { auth, db } from './firebaseConfig';

export const saveToFirebase = async (
  inputText: string, 
  setError: (error: string | null) => void
) => {
  if (!auth.currentUser) {
    setError("You must be logged in to save data.");
    return;
  }

  const userId = auth.currentUser.uid;
  try {
    await set(ref(db, `users/${userId}/missionLog`), inputText);
    setError(null);
    alert("Mission log saved successfully!");
  } catch (error) {
    setError("Error saving to database. Please try again.");
  }
};

export const loadFromFirebase = async (
  setError: (error: string | null) => void,
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
) => {
  if (!auth.currentUser) {
    setError("You must be logged in to load data.");
    return;
  }

  const userId = auth.currentUser.uid;
  try {
    const snapshot = await get(ref(db, `users/${userId}/missionLog`));
    if (snapshot.exists()) {
      handleInputChange({ target: { value: snapshot.val() } } as React.ChangeEvent<HTMLTextAreaElement>);
      setError(null);
    } else {
      setError("No saved mission log found.");
    }
  } catch (error) {
    setError("Error loading from database. Please try again.");
  }
};
