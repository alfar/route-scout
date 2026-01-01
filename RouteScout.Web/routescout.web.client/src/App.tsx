import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DispatchApp } from './DispatchApp';
import { TeamApp } from './TeamApp';
import ProjectsPage from './features/projects/pages/ProjectsPage';
import LandingPage from './features/common/pages/LandingPage';
import LoginPage from './features/common/pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useTranslation } from 'react-i18next';
import './App.css';

function App() {
    useTranslation();
    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <AuthProvider>
                        <LandingPage />
                    </AuthProvider>
                } />
                <Route path="/login" element={<LoginPage />} />
                {/* TeamApp is public - no authentication required */}
                <Route path="/teams/:id/*" element={<TeamApp />} />
                <Route
                    path="/projects"
                    element={
                        <AuthProvider>
                            <ProtectedRoute>
                                <ProjectsPage />
                            </ProtectedRoute>
                        </AuthProvider>
                    }
                />
                <Route
                    path="/projects/:projectId/*"
                    element={
                        <AuthProvider>
                            <ProtectedRoute>
                                <DispatchApp />
                            </ProtectedRoute>
                        </AuthProvider>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
