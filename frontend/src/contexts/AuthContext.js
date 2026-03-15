// Commit on 2026-02-15
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChangedListener, 
  getUserDocument 
} from '../firebase/auth';
import LoadingSpinner from '../components/LoadingSpinner';

// Create the context
const AuthContext = createContext({
  currentUser: null,
  userDocument: null,
  isLoading: true,
  setCurrentUser: () => null,
  setUserDocument: () => null,
});

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDocument, setUserDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (user) => {
      if (user) {
        setCurrentUser(user);

        const userDoc = await getUserDocument(user);
        setUserDocument(userDoc);
      } else {
        setCurrentUser(null);
        setUserDocument(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userDocument,
    isLoading,
    setCurrentUser,
    setUserDocument,
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <LoadingSpinner message="Initializing..." /> : children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

// Commit on 2026-02-11 
// Commit on 2026-02-11 
// Commit on 2026-02-11 
// Commit on 2026-03-15 
// Commit on 2026-03-15 
// Commit on 2026-03-15 
