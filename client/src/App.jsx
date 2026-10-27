import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PageWrapper from './components/layout/PageWrapper';

// Guards
import ProtectedRoute from './guards/ProtectedRoute';
import RoleRoute from './guards/RoleRoute';

// Public Pages
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Helpline from './pages/Helpline';
import NotFound from './pages/NotFound';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import ERPicker from './pages/client/ERPicker';
import ChatRoom from './pages/client/ChatRoom';
import ChatHistory from './pages/client/ChatHistory';

// ER Pages
import ERDashboard from './pages/er/ERDashboard';
import ERChatRoom from './pages/er/ERChatRoom';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ReportDetail from './pages/admin/ReportDetail';
import ManageERs from './pages/admin/ManageERs';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-cream text-dark-brown selection:bg-butter selection:text-dark-brown">
            <Navbar />
            <PageWrapper className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/helpline" element={<Helpline />} />

                {/* Client Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <RoleRoute allowedRoles="client">
                      <ClientDashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/find-er"
                  element={
                    <RoleRoute allowedRoles="client">
                      <ERPicker />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/chat/:chatId"
                  element={
                    <ProtectedRoute>
                      <ChatRoom />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <RoleRoute allowedRoles="client">
                      <ChatHistory />
                    </RoleRoute>
                  }
                />

                {/* ER Routes */}
                <Route
                  path="/er/dashboard"
                  element={
                    <RoleRoute allowedRoles="er">
                      <ERDashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/er/chat/:chatId"
                  element={
                    <RoleRoute allowedRoles="er">
                      <ERChatRoom />
                    </RoleRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <RoleRoute allowedRoles="admin">
                      <AdminDashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/reports/:reportId"
                  element={
                    <RoleRoute allowedRoles="admin">
                      <ReportDetail />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/ers"
                  element={
                    <RoleRoute allowedRoles="admin">
                      <ManageERs />
                    </RoleRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageWrapper>
            <Footer />
          </div>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
