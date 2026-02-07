import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Route Guards
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { PrivateRoute } from './components/routes/PrivateRoute';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import ParticipantLayout from './components/layout/ParticipantLayout';

// Public pages
import Hero from './pages/public/Hero';
import Login from './pages/public/Login';

// Admin pages
import Dashboard from './pages/Admin/Dashboard';
import Participants from './pages/Admin/Participants';
import ParticipantProfile from './pages/Admin/Participants/Profile';
import Submissions from './pages/Admin/Participants/Submissions';
import Contests from './pages/Admin/Contests';
import ContestDetails from './pages/Admin/Contests/Details';
import ManageUsers from './pages/Admin/ManageUsers';
import Settings from './pages/Admin/Settings';

// Participant pages
import TaskPage from './pages/Participant/Task';
import ParticipantDashboard from './pages/Participant/Dashboard';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Hero />} />
                <Route
                    path="/login"
                    element={
                        <ProtectedRoute>
                            <Login />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes - Protected for admin and super_admin only */}
                <Route element={
                    <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                        <AdminLayout />
                    </PrivateRoute>
                }>
                    <Route path="/admin" element={<Dashboard />} />
                    <Route path="/admin/participants" element={<Participants />} />
                    <Route path="/admin/participants/:id" element={<ParticipantProfile />} />
                    <Route path="/admin/participants/:id/contest/:contestId" element={<Submissions />} />
                    <Route path="/admin/contests" element={<Contests />} />
                    <Route path="/admin/contests/:id" element={<ContestDetails />} />
                    <Route path="/admin/manage-users" element={<ManageUsers />} />
                    <Route path="/admin/settings" element={<Settings />} />

                    {/* Legacy/Redirects */}
                    <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
                    <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
                    <Route path="/admin/users" element={<Navigate to="/admin/participants" replace />} />
                </Route>

                {/* Participant Routes - Protected for player role only */}
                <Route element={
                    <PrivateRoute allowedRoles={['player']}>
                        <ParticipantLayout />
                    </PrivateRoute>
                }>
                    <Route path="/player" element={<ParticipantDashboard />} />
                </Route>

                {/* Task Page - Standalone without ParticipantLayout navbar */}
                <Route path="/contest/:id" element={
                    <PrivateRoute allowedRoles={['player']}>
                        <TaskPage />
                    </PrivateRoute>
                } />
                <Route path="/task" element={
                    <PrivateRoute allowedRoles={['player']}>
                        <TaskPage />
                    </PrivateRoute>
                } />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
