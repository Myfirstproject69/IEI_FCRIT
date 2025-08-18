import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './AboutUs.css'; // Make sure to create and link this CSS file

// --- SVG Icons for Visual Flair ---
const VisionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);
const MissionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
    </svg>
);
const InfoIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

// --- Skeleton Loader Component ---
const AboutUsSkeleton = () => (
    <div className="about-us-container">
        <div className="page-header">
            <div className="skeleton skeleton-title"></div>
        </div>
        <div className="content-section">
            <div className="skeleton skeleton-text skeleton-text-long"></div>
            <div className="skeleton skeleton-text skeleton-text-short"></div>
            <div className="skeleton skeleton-text skeleton-text-long"></div>
        </div>
        <div className="content-section">
            <div className="skeleton skeleton-text skeleton-text-long"></div>
            <div className="skeleton skeleton-text skeleton-text-short"></div>
        </div>
    </div>
);

export default function AboutUs() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const docRef = doc(db, 'content', 'about');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setContent(docSnap.data());
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  if (loading) return <AboutUsSkeleton />;

  if (!content) {
    return (
        <div className="empty-container">
            <InfoIcon />
            <h3 className="empty-title">Content Not Available</h3>
            <p className="empty-text">The information for this page could not be loaded.</p>
        </div>
    );
  }

  return (
    <div className="about-us-container">
        <header className="page-header">
            <h1 className="page-title">About Our Chapter</h1>
            <p className="page-subtitle">Our History, Mission, and Vision for the Future</p>
        </header>

        <section className="content-section">
            <h2 className="section-title">About the IEI Student Chapter</h2>
            <div className="prose-style">
                <p>{content.chapterHistory}</p>
                <h3>Objectives & Benefits</h3>
                <p>{content.objectives}</p>
                
                <div className="info-grid">
                    <div className="info-card">
                        <div className="info-card-header">
                            <VisionIcon />
                            <h4 className="info-card-title">Our Vision</h4>
                        </div>
                        <p>{content.vision}</p>
                    </div>
                    <div className="info-card">
                        <div className="info-card-header">
                            <MissionIcon />
                            <h4 className="info-card-title">Our Mission</h4>
                        </div>
                        <p>{content.mission}</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="content-section">
            <h2 className="section-title">About the Department</h2>
            <div className="prose-style">
                <p>{content.departmentOverview}</p>
            </div>
        </section>
    </div>
  );
}