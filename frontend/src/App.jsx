import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import axios from 'axios'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Plus,
  GraduationCap
} from 'lucide-react'

// Auth
import AuthProvider, { useAuth } from './context/AuthContext'

// Pages
import Dashboard from './pages/Dashboard'
import Curriculum from './pages/Curriculum'
import CourseDetail from './pages/CourseDetail'
import AddCourse from './pages/AddCourse'
import AddModule from './pages/AddModule'
import AddTopic from './pages/AddTopic'
import GeneratePaper from './pages/GeneratePaper'
import PaperPreview from './pages/PaperPreview'
import Questions from './pages/Questions'
import Login from './pages/Login'
import Register from './pages/Register'

// API Base URL
axios.defaults.baseURL = 'http://localhost:8000'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-[#fafafa] text-foreground font-sans selection:bg-black selection:text-white">
      {/* Sidebar - only show if user is logged in */}
      {user && (
        <aside className="w-64 border-r border-border flex flex-col bg-white">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tighter text-black">KTU-QGEN</h1>
            </div>

            <nav className="space-y-1">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
              <SidebarItem icon={BookOpen} label="Curriculum" to="/curriculum" />
              <SidebarItem icon={FileText} label="Question Bank" to="/questions" />
              <SidebarItem icon={Settings} label="Settings" to="/settings" />
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-border bg-[#fdfdfd]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold border border-border">
                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate leading-none">{user.name}</p>
                <p className="text-[11px] text-muted-foreground truncate mt-1 uppercase font-bold tracking-tighter italic">{user.role}</p>
              </div>
              <LogOut
                onClick={logout}
                className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              />
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/curriculum" element={<ProtectedRoute><Curriculum /></ProtectedRoute>} />
          <Route path="/curriculum/add" element={<ProtectedRoute><AddCourse /></ProtectedRoute>} />
          <Route path="/curriculum/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
          <Route path="/curriculum/:courseId/add-module" element={<ProtectedRoute><AddModule /></ProtectedRoute>} />
          <Route path="/curriculum/module/:moduleId/add-topic" element={<ProtectedRoute><AddTopic /></ProtectedRoute>} />
          <Route path="/questions" element={<ProtectedRoute><Questions /></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute><GeneratePaper /></ProtectedRoute>} />
          <Route path="/papers/:paperId" element={<ProtectedRoute><PaperPreview /></ProtectedRoute>} />

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

function SidebarItem({ icon: Icon, label, to }) {
  const location = useLocation()
  const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-all rounded-lg group ${active
        ? 'bg-black text-white shadow-lg shadow-black/10'
        : 'text-muted-foreground hover:bg-zinc-100 hover:text-foreground'
        }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'}`} />
      <span className="tracking-tight">{label}</span>
    </Link>
  )
}

export default App
