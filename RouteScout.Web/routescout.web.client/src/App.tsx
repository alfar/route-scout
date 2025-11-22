import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DispatchApp } from './DispatchApp';
import { TeamApp } from './TeamApp';
import './App.css';

function App() {
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
