// src/layouts/PublicLayout.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './PublicLayout.css';

// --- SVG Icon Components ---
const InstagramIcon = (props) => (
    <svg {...props} xmlns="http://www.w.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const LinkedinIcon = (props) => (
    <svg {...props} xmlns="http://www.w.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);
const GlobeIcon = (props) => (
    <svg {...props} xmlns="http://www.w.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);
const MenuIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="7" y1="18" x2="17" y2="18"></line></svg>
);
const XIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const Header = ({ settings }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = [
    { name: 'Home', path: '/home' }, { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' }, { name: 'Visits', path: '/visits' },
    { name: 'Notices', path: '/notices' }, { name: 'Committee', path: '/committee' },
    { name: 'Reports', path: '/reports' }, { name: 'Gallery', path: '/gallery' },
    { name: 'Achievements', path: '/achievements' }, { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <a href="/home" className="header-logo-link">
          {settings.logoUrl && (
            <img src={settings.logoUrl} alt="IEI Chapter Logo" className="header-logo-img" />
          )}
          <span className="header-logo-text">IEI Student Chapter</span>
        </a>

        <nav className="header-nav-desktop">
          {navLinks.map(link => (
            <NavLink key={link.name} to={link.path} className="nav-link-desktop">
              {link.name}
              <span className="nav-link-underline"></span>
            </NavLink>
          ))}
        </nav>

        <button className="mobile-menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle navigation menu">
          {isMenuOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="mobile-menu">
          {navLinks.map(link => (
            <NavLink key={link.name} to={link.path} className="nav-link-mobile" onClick={() => setIsMenuOpen(false)}>
              {link.name}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

const Footer = ({ settings }) => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-grid">
        <div className="footer-about">
          <a href="/home" className="footer-logo-link">
            {settings.logoUrl && <img src={settings.logoUrl} alt="IEI Chapter Logo" className="footer-logo-img" />}
            <span className="footer-logo-text">IEI Student Chapter</span>
          </a>
          <p className="footer-mission">Fostering engineering innovation and professional growth at FCRIT.</p>
        </div>
        <div className="footer-links-section">
          <h3 className="footer-heading">Quick Links</h3>
          <nav className="footer-links-grid">
            <NavLink to="/events" className="footer-link">Events</NavLink>
            <NavLink to="/visits" className="footer-link">Visits</NavLink>
            <NavLink to="/notices" className="footer-link">Notices</NavLink>
            <NavLink to="/committee" className="footer-link">Committee</NavLink>
          </nav>
        </div>
        <div className="footer-social-section">
          <h3 className="footer-heading">Connect With Us</h3>
          <div className="footer-social-icons">
            {settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon"><InstagramIcon /></a>}
            {settings.linkedinUrl && <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon"><LinkedinIcon /></a>}
            {settings.collegeUrl && <a href={settings.collegeUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon"><GlobeIcon /></a>}
          </div>
        </div>
      </div>
      <div className="footer-copyright-section">
        <p>&copy; {new Date().getFullYear()} IEI Student Chapter, FCRIT. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
);

export default function PublicLayout() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      const settingsSnap = await getDoc(doc(db, 'settings', 'main'));
      if (settingsSnap.exists()) setSettings(settingsSnap.data());
    };
    fetchSettings();
  }, []);

  return (
    <div className="public-layout">
      <Header settings={settings} />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer settings={settings} />
    </div>
  );
}