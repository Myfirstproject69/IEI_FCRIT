import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import './Notices.css'; // Make sure to create and link this CSS file

// --- SVG Icon Components ---
const PinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
);
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
const MegaphoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>
);


// --- Notice Card Component ---
const NoticeCard = ({ notice, isPinned }) => {
    const noticeDate = new Date(notice.startDate);
    const formattedDate = noticeDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className={`notice-card ${isPinned ? 'pinned' : ''}`}>
            {isPinned && <div className="pin-badge"><PinIcon /> Pinned</div>}
            <div className="notice-header">
                <h3 className="notice-title">{notice.title}</h3>
                <span className={`category-tag ${notice.category?.toLowerCase()}`}>{notice.category || 'General'}</span>
            </div>
            <p className="notice-date">Posted on: {formattedDate}</p>
            <p className="notice-content">{notice.content}</p>
            {notice.fileUrl && (
                <a href={notice.fileUrl} target="_blank" rel="noopener noreferrer" className="attachment-link">
                    <DownloadIcon />
                    View Attachment
                </a>
            )}
        </div>
    );
};

// --- Skeleton Loader ---
const NoticeSkeleton = () => (
    <div className="notice-card-skeleton">
        <div className="skeleton skeleton-title-md"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text-short"></div>
    </div>
);

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const noticesQuery = query(collection(db, 'notices'), orderBy('startDate', 'desc'));
        const noticesSnap = await getDocs(noticesQuery);
        const allNotices = noticesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const publicNotices = allNotices.filter(notice => notice.visibility === 'Public');
        setNotices(publicNotices);

      } catch (error) {
        console.error("Error fetching notices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const pinnedNotices = notices.filter(n => n.isPinned);
  const regularNotices = notices.filter(n => !n.isPinned);

  return (
    <div className="notices-container">
        <header className="page-header">
            <h1 className="page-title">Notices & Announcements</h1>
            <p className="page-subtitle">Stay updated with the latest information from our organization.</p>
        </header>

        {loading ? (
            <div className="timeline">
                <NoticeSkeleton />
                <NoticeSkeleton />
                <NoticeSkeleton />
            </div>
        ) : notices.length > 0 ? (
            <div className="timeline">
                {pinnedNotices.map(notice => <NoticeCard key={notice.id} notice={notice} isPinned={true} />)}
                {regularNotices.map(notice => <NoticeCard key={notice.id} notice={notice} isPinned={false} />)}
            </div>
        ) : (
            <div className="empty-state">
                <MegaphoneIcon />
                <h3 className="empty-title">No Announcements Yet</h3>
                <p className="empty-text">Please check back later for new updates.</p>
            </div>
        )}
    </div>
  );
}