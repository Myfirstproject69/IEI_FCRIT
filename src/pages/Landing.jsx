import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

// --- SVG Icons ---
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('.scroll-animate');
    sections.forEach(section => observer.observe(section));

    return () => sections.forEach(section => observer.unobserve(section));
  }, []);

  const createParticle = (x, y) => {
    const particle = document.createElement('div');
    particle.className = 'particle';
    document.body.appendChild(particle);
    const size = Math.floor(Math.random() * 20 + 5);
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = `hsl(${Math.random() * 90 + 200}, 70%, 60%)`;
    const destinationX = x + (Math.random() - 0.5) * 2 * 150;
    const destinationY = y + (Math.random() - 0.5) * 2 * 150;
    const animation = particle.animate([
      { transform: `translate(${x - (size / 2)}px, ${y - (size / 2)}px)`, opacity: 1 },
      { transform: `translate(${destinationX}px, ${destinationY}px)`, opacity: 0 }
    ], {
      duration: Math.random() * 1000 + 500,
      easing: 'cubic-bezier(0, .9, .57, 1)',
      delay: Math.random() * 200
    });
    animation.onfinish = () => particle.remove();
  };

  const handleLinkClick = (e, path) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    for (let i = 0; i < 30; i++) createParticle(x, y);
    setTimeout(() => navigate(path), 800);
  };

  return (
    <div className="landing-container">
      <div className="background-shapes">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </div>

      {/* --- Hero Section --- */}
      <section className="hero-section">
        <h1 className="landing-title">IEI Student Chapter</h1>
        <p className="landing-subtitle">FCRIT, Vashi</p>
        <button onClick={(e) => handleLinkClick(e, '/home')} className="landing-button">
          <span>Go on Site</span>
          <ArrowRightIcon />
        </button>
      </section>

      {/* --- About Section --- */}
      <section className="info-section scroll-animate">
        <div className="info-box">
            <h2>About The Institution of Engineers (India)</h2>
            <p>The IEI is the largest multi-disciplinary professional body for engineers in India, providing a global platform to share professional interests and foster technological advancement across 15 engineering disciplines.</p>
        </div>
        <div className="info-box">
            <h2>Our Electrical Engineering Department</h2>
            <p>The Electrical Engineering department at FCRIT is committed to nurturing the next generation of engineers through a blend of rigorous academic theory and hands-on practical experience, preparing them for the challenges of the modern industry.</p>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="features-section scroll-animate">
        <h2 className="section-heading">A Dynamic & Interactive Hub</h2>
        <div className="features-grid">
            <div className="feature-card"><div className="feature-icon"><CalendarIcon /></div><h3>Events & Workshops</h3><p>Stay updated with our latest technical and professional events.</p></div>
            <div className="feature-card"><div className="feature-icon"><ImageIcon /></div><h3>Gallery</h3><p>Explore moments from our industrial visits, workshops, and celebrations.</p></div>
            <div className="feature-card"><div className="feature-icon"><BellIcon /></div><h3>Live Notices</h3><p>Get real-time announcements and important updates from the chapter.</p></div>
        </div>
      </section>

      {/* --- Management & Credit Section --- */}
      <section className="info-section scroll-animate">
        <div className="info-box">
            <h2>Managed by Our Committee</h2>
            <p>This website is dynamically managed by our dedicated committee members through a secure admin panel, ensuring all information is timely, accurate, and relevant for our members.</p>
        </div>
        <div className="info-box">
            <h2>Developed By</h2>
            <p>This digital platform was designed and developed by <strong>Krishna Jaiswar</strong>, translating the chapter's vision into an interactive and engaging online experience.</p>
        </div>
      </section>

      {/* --- Footer & Disclaimer --- */}
      <footer className="landing-footer scroll-animate">
          <p><strong>Disclaimer:</strong> This is a student-run website for the IEI Student Chapter at FCRIT. While we strive for accuracy, the content is managed by students. If your browser flags this site, it may be due to the dynamic nature of our hosting. We assure you that our platform is secure and does not collect personal data without consent.</p>
      </footer>
    </div>
  );
}