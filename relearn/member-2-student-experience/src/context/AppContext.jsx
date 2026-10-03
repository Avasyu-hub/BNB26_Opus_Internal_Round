import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [student, setStudent] = useState({
    id: 'student_1',
    name: 'Aarav Sharma',
    grade: 'Class 8',
    avatar: '👨‍🎓',
  });

  const [language, setLanguage] = useState('en'); // 'en', 'hi', 'bn'

  return (
    <AppContext.Provider value={{ student, setStudent, language, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
