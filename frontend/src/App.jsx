import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import MyContests from './pages/Admin/MyContests';
import TaskPage from './pages/Participant/Task';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/my-contests" element={<MyContests />} />
        <Route path="/admin/contest/:id" element={<MyContests />} />
        <Route path="/task" element={<TaskPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
