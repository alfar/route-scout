import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import PaymentsPage from './features/payments/pages/PaymentsPage';
import AboutPage from './features/common/pages/AboutPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import AddressWashingPage from './features/address-washing/pages/AddressWashingPage';
import RouteManagementPage from './features/routes/pages/RouteManagementPage';
import TeamsPage from './features/teams/pages/TeamsPage';

export function DispatchApp() {
  return (
    <div className="App">
      <nav className="bg-blue-600 p-4 flex gap-4">
        <Link className="text-white font-semibold hover:underline" to="/">Home</Link>
        <Link className="text-white font-semibold hover:underline" to="/payments">Payments</Link>
        <Link className="text-white font-semibold hover:underline" to="/address-washing">Address Washing</Link>
        <Link className="text-white font-semibold hover:underline" to="/routes">Route Management</Link>
        <Link className="text-white font-semibold hover:underline" to="/teams">Teams</Link>
        <Link className="text-white font-semibold hover:underline" to="/about">About</Link>
      </nav>
      <main className="p-8">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/address-washing" element={<AddressWashingPage />} />
          <Route path="/routes" element={<RouteManagementPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </div>
  );
}
