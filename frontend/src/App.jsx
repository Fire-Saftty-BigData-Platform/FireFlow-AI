import { useState } from 'react';
import RoleSelect from './pages/RoleSelect.jsx';
import CitizenDashboard from './pages/CitizenDashboard.jsx';
import FirefighterDashboard from './pages/FirefighterDashboard.jsx';
import ControlDashboard from './pages/ControlDashboard.jsx';

const dashboardByRole = {
  citizen: CitizenDashboard,
  firefighter: FirefighterDashboard,
  control: ControlDashboard,
};

export default function App() {
  const [role, setRole] = useState(null);
  const Dashboard = role ? dashboardByRole[role] : null;

  if (!Dashboard) {
    return <RoleSelect onSelectRole={setRole} />;
  }

  return <Dashboard onBack={() => setRole(null)} />;
}
