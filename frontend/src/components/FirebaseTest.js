// Commit on 2026-02-10
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const FirebaseTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const testFirestore = async () => {
    if (!currentUser) {
      setTestResult('❌ No user logged in');
      return;
    }

    setLoading(true);
    setTestResult('🧪 Testing Firestore connection...');

    try {
      // Test writing to Firestore
      const testDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(testDocRef, {
        testField: 'Hello Firestore!',
        timestamp: new Date(),
        userId: currentUser.uid
      }, { merge: true });

      setTestResult('✅ Write successful! Testing read...');

      // Test reading from Firestore
      const testDocSnap = await getDoc(testDocRef);
      if (testDocSnap.exists()) {
        const data = testDocSnap.data();
        setTestResult(`✅ Firestore connection working!\n\nData: ${JSON.stringify(data, null, 2)}`);
      } else {
        setTestResult('⚠️ Document was written but not found on read');
      }
    } catch (error) {
      console.error('Firestore test error:', error);
      setTestResult(`❌ Firestore Error:\n\nCode: ${error.code}\nMessage: ${error.message}\n\n🔧 Fix: Update Firestore Security Rules in Firebase Console`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
        <h3>🔐 Firebase Test</h3>
        <p>Please log in to test Firebase connection</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>🔥 Firebase Connection Test</h3>
      <p><strong>User:</strong> {currentUser.email}</p>
      <p><strong>UID:</strong> {currentUser.uid}</p>
      
      <button 
        onClick={testFirestore}
        disabled={loading}
        style={{ 
          padding: '10px 15px', 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Firestore'}
      </button>

      {testResult && (
        <pre style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          border: '1px solid #ddd',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          fontSize: '12px'
        }}>
          {testResult}
        </pre>
      )}
    </div>
  );
};

export default FirebaseTest;

// Commit on 2026-03-17 
// Commit on 2026-03-17 
// Commit on 2026-03-17 
// Commit on 2026-02-07 
// Commit on 2026-02-07 
