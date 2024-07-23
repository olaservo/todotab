import { ref, set, get } from 'firebase/database';
import { database } from './firebaseConfig'; // Make sure this import path is correct

export const saveToFirebase = async (userId: string, data: string) => {
  try {
    const todoRef = ref(database, `users/${userId}/todos`);
    await set(todoRef, data);
    return true;
  } catch (error) {
    console.error("Error saving data to Firebase:", error);
    throw error;
  }
};

export const loadFromFirebase = async (userId: string) => {
  try {
    const todoRef = ref(database, `users/${userId}/todos`);
    const snapshot = await get(todoRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error loading data from Firebase:", error);
    throw error;
  }
};