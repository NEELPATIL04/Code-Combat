import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import Hero from './pages/public/Hero';
import Login from './pages/public/Login';

// Admin pages
import Dashboard from './pages/Admin/Dashboard';
import Participants from './pages/Admin/Participants';
import ParticipantProfile from './pages/Admin/Participants/Profile';
import Submissions from './pages/Admin/Participants/Submissions';
import Contests from './pages/Admin/Contests';
import ManageUsers from './pages/Admin/ManageUsers';
import Settings from './pages/Admin/Settings';

// Participant pages
import TaskPage from './pages/Participant/Task';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Hero />} />
                <Route path="/login" element={<Login />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/participants" element={<Participants />} />
                <Route path="/admin/participants/:id" element={<ParticipantProfile />} />
                <Route path="/admin/participants/:id/contest/:contestId" element={<Submissions />} />
                <Route path="/admin/contests" element={<Contests />} />
                <Route path="/admin/manage-users" element={<ManageUsers />} />
                <Route path="/admin/settings" element={<Settings />} />

                {/* Legacy route redirects */}
                <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
                <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
                <Route path="/admin/users" element={<Navigate to="/admin/participants" replace />} />

                {/* Participant Routes */}
                <Route path="/task" element={<TaskPage />} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
