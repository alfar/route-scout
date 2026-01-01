import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DispatchApp } from './DispatchApp';
import { TeamApp } from './TeamApp';
import ProjectsPage from './features/projects/pages/ProjectsPage';
import AboutPage from './features/common/pages/AboutPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
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
                <Route path="/about" element={<AboutPage />} />
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
