import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DispatchApp } from './DispatchApp';
import TeamsPage from './features/teams/pages/TeamsPage';
import { TeamApp } from './TeamApp';
import { useTranslation } from 'react-i18next';
import './App.css';

function App() {
    useTranslation();
    return (
        <Router>
            <Routes>
                <Route path="/teams/:id/*" element={<TeamApp />} />
                <Route path="*" element={<DispatchApp />} />
            </Routes>
        </Router>
    );
}

export default App;
