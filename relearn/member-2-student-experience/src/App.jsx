import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import QuestionSelection from './pages/QuestionSelection';
import CustomProblem from './pages/CustomProblem';
import PracticePage from './pages/PracticePage';
import ProfilePage from './pages/ProfilePage';
import TeacherPage from './pages/TeacherPage';
import EvaluationPage from './pages/EvaluationPage';
import DevErrorCard from './pages/dev/DevErrorCard';
import DevDiagnosis from './pages/dev/DevDiagnosis';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Landing />} />
            <Route path="practice" element={<QuestionSelection />} />
            <Route path="practice/custom" element={<CustomProblem />} />
            <Route path="practice/:questionId" element={<PracticePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="teacher" element={<TeacherPage />} />
            <Route path="evaluation" element={<EvaluationPage />} />
            {/* Dev verification routes */}
            <Route path="dev/error-card" element={<DevErrorCard />} />
            <Route path="dev/diagnosis" element={<DevDiagnosis />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}