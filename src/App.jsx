import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import BM from "./pages/BM";
import Home from "./pages/Home";
import ContactsPage from "./pages/ContactsPage";
import RemindersPage from "./pages/RemindersPage";
import NotesPage from "./pages/NotesPage";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import MailPage from "./pages/MailPage";
import DrivePage from "./pages/DrivePage";
import GalleryPage from "./pages/GalleryPage";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import HomeRedirector from "./components/HomeRedirector";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <ContactsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reminders"
          element={
            <ProtectedRoute>
              <RemindersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mail"
          element={
            <ProtectedRoute>
              <MailPage />
            </ProtectedRoute>
          }
        />
                <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <GalleryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/drive"
          element={
            <ProtectedRoute>
              <DrivePage />
            </ProtectedRoute>
          }
        />
        {/* Root path: Uses HomeRedirector to decide where to go based on auth status */}
        <Route path="/" element={<HomeRedirector />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
