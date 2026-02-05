import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Route Guards
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { PrivateRoute } from './components/routes/PrivateRoute';

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
                <Route
                    path="/login"
                    element={
                        <ProtectedRoute>
                            <Login />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes - Protected for admin and super_admin only */}
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/participants"
                    element={
                        <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                            <Participants />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/participants/:id"
                    element={
                        <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                            <ParticipantProfile />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/participants/:id/contest/:contestId"
                    element={
                        <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                            <Submissions />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/contests"
                    element={
                        <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                            <Contests />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/manage-users"
                    element={
                        <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                            <ManageUsers />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/settings"
                    element={
                        <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                            <Settings />
                        </PrivateRoute>
                    }
                />

                {/* Legacy route redirects */}
                <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
                <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
                <Route path="/admin/users" element={<Navigate to="/admin/participants" replace />} />

                {/* Participant Routes - Protected for player role only */}
                <Route
                    path="/task"
                    element={
                        <PrivateRoute allowedRoles={['player']}>
                            <TaskPage />
                        </PrivateRoute>
                    }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
