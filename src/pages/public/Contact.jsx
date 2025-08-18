import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './Contact.css'; // Make sure to create and link this CSS file

// --- SVG Icon Components ---
const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const LinkedinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);
const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

// --- Contact Card Component ---
const ContactCard = ({ icon, title, url }) => {
    const cardRef = useRef(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e) => {
            const { left, top, width, height } = card.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;
            const rotateX = (y - height / 2) / (height / 2) * -8;
            const rotateY = (x - width / 2) / (width / 2) * 8;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        };

        const handleMouseLeave = () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <a href={url || '#'} target="_blank" rel="noopener noreferrer" className="contact-card" ref={cardRef}>
            <div className="card-icon">{icon}</div>
            <div className="card-text">
                <h3 className="card-title">{title}</h3>
                <p className="card-url">{url}</p>
            </div>
        </a>
    );
};

// --- Skeleton Loader ---
const ContactSkeleton = () => (
    <div className="contact-grid">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="contact-card-skeleton">
                <div className="skeleton skeleton-icon"></div>
                <div className="skeleton-text-group">
                    <div className="skeleton skeleton-title-sm"></div>
                    <div className="skeleton skeleton-text"></div>
                </div>
            </div>
        ))}
    </div>
);

export default function Contact() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching contact settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="contact-container">
        <header className="page-header">
            <h1 className="page-title">Contact Information</h1>
            <p className="page-subtitle">Connect with us through our official channels.</p>
        </header>

        {loading ? (
            <ContactSkeleton />
        ) : settings ? (
            <div className="contact-grid">
                <ContactCard icon={<InstagramIcon />} title="Instagram" url={settings.instagramUrl} />
                <ContactCard icon={<LinkedinIcon />} title="LinkedIn" url={settings.linkedinUrl} />
                <ContactCard icon={<GlobeIcon />} title="College Website" url={settings.collegeUrl} />
                <ContactCard icon={<GlobeIcon />} title="Our Website" url={settings.websiteUrl} />
            </div>
        ) : (
            <p className="empty-text">Contact information not available.</p>
        )}

        {/* --- Admin Panel Link --- */}
        <div className="admin-login-section">
            <Link to="/login" className="admin-login-btn">Admin Panel</Link>
        </div>
    </div>
  );
}