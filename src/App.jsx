// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Layouts and Pages
import PublicLayout from './layouts/PublicLayout';
import Landing from './pages/Landing';
import PublicHome from './pages/public/PublicHome';
import AboutUs from './pages/public/AboutUs';
import Events from './pages/public/Events';
import Visits from './pages/public/Visits';
import Notices from './pages/public/Notices';
import Committee from './pages/public/Committee';
import Reports from './pages/public/Reports';
import Gallery from './pages/public/Gallery';
import Achievements from './pages/public/Achievements';
import Contact from './pages/public/Contact';
import Register from './pages/admin/Register';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Site Entry Point */}
        <Route path="/" element={<Landing />} />

        {/* Public Pages (wrapped in the PublicLayout) */}
        <Route element={<PublicLayout />}>
          <Route path="/home" element={<PublicHome />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/events" element={<Events />} />
          <Route path="/visits" element={<Visits />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/committee" element={<Committee />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        
        {/* Admin Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Admin Dashboard Route */}
        <Route path="/admin/dashboard" element={<Dashboard />} />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}