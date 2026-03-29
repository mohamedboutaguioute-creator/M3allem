import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Directory } from './pages/Directory';
import { Profile } from './pages/Profile';
import { ProfessionalProfile } from './pages/ProfessionalProfile';
import ProfileDemo from './pages/ProfileDemo';
import { Auth } from './pages/Auth';
import { Register } from './pages/Register';
import { CompleteProfile } from './pages/CompleteProfile';
import { AdminDashboard } from './pages/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div dir="rtl" className="flex flex-col min-h-screen bg-white font-sans selection:bg-[#F59E0B]/30 selection:text-[#1E3A8A]">
            <Routes>
              {/* Admin Routes - No Navbar/Footer */}
              <Route path="/admin/*" element={<AdminDashboard />} />
              
              {/* Public Routes */}
              <Route path="*" element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/directory" element={<Directory />} />
                      <Route path="/profile/:id" element={<Profile />} />
                      <Route path="/dashboard" element={<ProfessionalProfile />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/complete-profile" element={<CompleteProfile />} />
                      <Route path="/profile-demo" element={<ProfileDemo />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
