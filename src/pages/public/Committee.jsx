import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import './Committee.css'; // Make sure to link the updated CSS file

// --- SVG Icon Components ---
const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);

// --- Member Card Component ---
const MemberCard = ({ member }) => {
    const [showContact, setShowContact] = useState(false);

    return (
        <div className="member-card">
            <div className="card-background-glow"></div>
            <div className="card-content">
                <div className="profile-image-wrapper">
                    <img src={member.profilePicUrl} alt={member.name} className="profile-image" />
                </div>
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-tenure">{member.tenure}</p>
                
                <div className={`contact-info ${showContact ? 'visible' : ''}`}>
                    <MailIcon />
                    <span>{member.contact}</span>
                </div>

                <button onClick={() => setShowContact(!showContact)} className="contact-toggle-btn">
                    {showContact ? 'Hide Contact' : 'Show Contact'}
                </button>
            </div>
        </div>
    );
};

// --- Skeleton Loader ---
const CommitteeSkeleton = () => (
    <div className="committee-grid">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="member-card-skeleton">
                <div className="skeleton skeleton-img"></div>
                <div className="skeleton skeleton-title-sm"></div>
                <div className="skeleton skeleton-text"></div>
            </div>
        ))}
    </div>
);

export default function Committee() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersQuery = query(collection(db, 'committee'), where('status', '==', 'Active'));
        const membersSnap = await getDocs(membersQuery);
        const activeMembers = membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMembers(activeMembers.sort((a, b) => a.priority - b.priority));
      } catch (error) {
        console.error("Error fetching committee members:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
    <div className="committee-container">
        <header className="page-header">
            <h1 className="page-title">Our Committee</h1>
            <p className="page-subtitle">Meet the dedicated team leading our chapter.</p>
        </header>
        
        {loading ? (
            <CommitteeSkeleton />
        ) : (
            <div className="committee-grid">
                {members.map(member => <MemberCard key={member.id} member={member} />)}
            </div>
        )}
    </div>
  );
}