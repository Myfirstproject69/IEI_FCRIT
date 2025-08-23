import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import './Visits.css'; // Make sure to create and link this CSS file

// --- SVG Icon Components ---
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const FileTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

// --- Modal Component for Image Gallery ---
const ImageModal = ({ imageUrl, onClose }) => (
    <div className="image-modal-backdrop" onClick={onClose}>
        <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={imageUrl} alt="Enlarged visit" className="enlarged-image" />
            <button onClick={onClose} className="close-modal-btn">&times;</button>
        </div>
    </div>
);

// --- Visit Card Component ---
const VisitCard = ({ visit }) => {
    const [modalImage, setModalImage] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <div className="visit-card">
                <div className="visit-card-header">
                    <img src={visit.photoUrls?.[0]} alt={visit.visitTitle} className="visit-header-image" />
                    <div className="header-overlay"></div>
                    <div className="header-text">
                        <p className="industry-name">{visit.industryName}</p>
                        <h3 className="visit-title">{visit.visitTitle}</h3>
                    </div>
                </div>
                <div className="visit-card-body">
                    <div className="visit-info-group">
                        <div className="visit-info-item"><CalendarIcon /><span>{visit.dateOfVisit}</span></div>
                    </div>
                    
                    <div className={`expanded-details ${isExpanded ? 'expanded' : ''}`}>
                        <div className="visit-info-item"><UserIcon /><span><strong>Faculty:</strong> {visit.facultyIncharge}</span></div>
                        <div className="visit-info-item"><CheckCircleIcon /><span><strong>Eligibility:</strong> {visit.eligibility}</span></div>
                    </div>

                    <div className="gallery-section">
                        <h4 className="gallery-title">Gallery</h4>
                        <div className="gallery-grid">
                            {visit.photoUrls?.slice(0, 3).map((url, index) => (
                                <img 
                                    key={index} 
                                    src={url} 
                                    alt={`Visit photo ${index + 1}`} 
                                    className="gallery-thumbnail"
                                    onClick={() => setModalImage(url)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="visit-card-footer">
                         <a href={visit.reportUrl} target="_blank" rel="noopener noreferrer" className="report-link">
                            <FileTextIcon />
                            View Letter
                        </a>
                        <button onClick={() => setIsExpanded(!isExpanded)} className="details-toggle-btn">
                            {isExpanded ? 'Show Less' : 'Show More'}
                        </button>
                    </div>
                </div>
            </div>
            {modalImage && <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
        </>
    );
};

// --- Skeleton Loader for Visits ---
const VisitCardSkeleton = () => (
    <div className="visit-card-skeleton">
        <div className="skeleton skeleton-header-image"></div>
        <div className="skeleton-content">
            <div className="skeleton skeleton-title-sm"></div>
            <div className="skeleton skeleton-text"></div>
        </div>
    </div>
);

export default function Visits() {
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [pastVisits, setPastVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const visitsQuery = query(collection(db, 'industrialVisits'), orderBy('dateOfVisit', 'desc'));
        const visitsSnap = await getDocs(visitsQuery);
        const allVisits = visitsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const now = new Date();
        now.setHours(0, 0, 0, 0); // Set to the beginning of the day for accurate comparison

        const upcoming = allVisits.filter(visit => new Date(visit.dateOfVisit) >= now);
        const past = allVisits.filter(visit => new Date(visit.dateOfVisit) < now);

        setUpcomingVisits(upcoming);
        setPastVisits(past);

      } catch (error) {
        console.error("Error fetching visits:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, []);

  if (loading) {
    return (
        <div className="visits-container">
            <header className="page-header">
                <h1 className="page-title">Industrial Visits & Field Trips</h1>
            </header>
            <div className="visits-grid">
                <VisitCardSkeleton />
                <VisitCardSkeleton />
                <VisitCardSkeleton />
            </div>
        </div>
    );
  }

  return (
    <div className="visits-container">
        <header className="page-header">
            <h1 className="page-title">Industrial Visits & Field Trips</h1>
            <p className="page-subtitle">Gaining practical exposure through on-site industrial experiences.</p>
        </header>

        <section className="visits-section">
            <h2 className="section-title">Upcoming Visits</h2>
            {upcomingVisits.length > 0 ? (
                <div className="visits-grid">
                    {upcomingVisits.map(visit => <VisitCard key={visit.id} visit={visit} />)}
                </div>
            ) : (
                <p className="empty-text">No upcoming visits scheduled at the moment.</p>
            )}
        </section>

        <section className="visits-section">
            <h2 className="section-title past">Past Visits</h2>
            {pastVisits.length > 0 ? (
                <div className="visits-grid">
                    {pastVisits.map(visit => <VisitCard key={visit.id} visit={visit} />)}
                </div>
            ) : (
                <p className="empty-text">No past visits have been recorded yet.</p>
            )}
        </section>
    </div>
  );
}