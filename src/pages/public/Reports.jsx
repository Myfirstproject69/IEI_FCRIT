import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import './Reports.css'; // Make sure to create and link this CSS file

// --- SVG Icon Components ---
const DownloadIcon = () => (
    <svg xmlns="http://www.w.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
const FileTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);

// --- Report Row Component ---
const ReportRow = ({ report }) => (
    <div className="report-row">
        <div className="report-info">
            <h3 className="report-title">{report.title} - {report.year}</h3>
            <p className="report-description">{report.description}</p>
        </div>
        <a href={report.fileUrl} target="_blank" rel="noopener noreferrer" className="view-report-btn">
            <DownloadIcon />
            <span>View</span>
        </a>
    </div>
);

// --- Skeleton Loader ---
const ReportSkeleton = () => (
    <div className="report-row-skeleton">
        <div className="skeleton-info">
            <div className="skeleton skeleton-title-sm"></div>
            <div className="skeleton skeleton-text"></div>
        </div>
        <div className="skeleton skeleton-button"></div>
    </div>
);

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsQuery = query(
          collection(db, 'reports'),
          orderBy('year', 'desc')
        );
        const reportsSnap = await getDocs(reportsQuery);
        const allReports = reportsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const activeReports = allReports.filter(report => report.status === 'Active');
        setReports(activeReports);

      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="reports-container">
        <header className="page-header">
            <h1 className="page-title">Reports & Submissions</h1>
            <p className="page-subtitle">Official documents and yearly reports from our chapter.</p>
        </header>

        <div className="reports-list">
            {loading ? (
                <>
                    <ReportSkeleton />
                    <ReportSkeleton />
                    <ReportSkeleton />
                </>
            ) : reports.length > 0 ? (
                reports.map(report => <ReportRow key={report.id} report={report} />)
            ) : (
                <div className="empty-state">
                    <FileTextIcon />
                    <h3 className="empty-title">No Reports Published</h3>
                    <p className="empty-text">There are currently no reports available to view.</p>
                </div>
            )}
        </div>
    </div>
  );
}