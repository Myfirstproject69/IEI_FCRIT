import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import './Achievements.css'; // Make sure to create and link this CSS file

// --- SVG Icon Components ---
const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M9.17 9a3 3 0 0 0 5.66 0"/></svg>
);

// --- Achievement Card Component ---
const AchievementCard = ({ item, index }) => (
    <div className={`achievement-card ${index % 2 === 1 ? 'reversed' : ''}`}>
        <div className="achievement-image-wrapper">
            <img src={item.fileUrl} alt={item.title} className="achievement-image" />
        </div>
        <div className="achievement-details">
            <p className="achievement-date">{item.date}</p>
            <h3 className="achievement-title">{item.title}</h3>
            <p className="achievement-description">{item.description}</p>
        </div>
    </div>
);

// --- Skeleton Loader ---
const AchievementSkeleton = ({ index }) => (
    <div className={`achievement-card-skeleton ${index % 2 === 1 ? 'reversed' : ''}`}>
        <div className="skeleton skeleton-image"></div>
        <div className="skeleton-details">
            <div className="skeleton skeleton-text-sm"></div>
            <div className="skeleton skeleton-title-md"></div>
            <div className="skeleton skeleton-text"></div>
        </div>
    </div>
);

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const achievementsQuery = query(collection(db, 'achievements'), orderBy('date', 'desc'));
        const achievementsSnap = await getDocs(achievementsQuery);
        setAchievements(achievementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  return (
    <div className="achievements-container">
        <header className="page-header">
            <h1 className="page-title">Achievements & Publications</h1>
            <p className="page-subtitle">Celebrating the accomplishments and contributions of our members.</p>
        </header>

        <div className="achievements-list">
            {loading ? (
                <>
                    <AchievementSkeleton index={0} />
                    <AchievementSkeleton index={1} />
                </>
            ) : achievements.length > 0 ? (
                achievements.map((item, index) => <AchievementCard key={item.id} item={item} index={index} />)
            ) : (
                <div className="empty-state">
                    <TrophyIcon />
                    <h3 className="empty-title">No Achievements Yet</h3>
                    <p className="empty-text">Check back later to see the amazing accomplishments of our members.</p>
                </div>
            )}
        </div>
    </div>
  );
}