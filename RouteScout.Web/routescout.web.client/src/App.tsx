import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DispatchApp } from './DispatchApp';
import { TeamApp } from './TeamApp';
import ProjectsPage from './features/projects/pages/ProjectsPage';
import AboutPage from './features/common/pages/AboutPage';
import { useTranslation } from 'react-i18next';
import './App.css';

function App() {
    useTranslation();
    return (
        <Router>
            <Routes>
                <Route path="/teams/:id/*" element={<TeamApp />} />
                <Route path="/" element={<ProjectsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/projects/:projectId/*" element={<DispatchApp />} />
                <Route path="*" element={<DispatchApp />} />
            </Routes>
        </Router>
    );
}

export default App;
