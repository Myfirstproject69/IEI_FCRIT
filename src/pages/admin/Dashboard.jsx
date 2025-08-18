import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import './Dashboard.css';

// Import feature components
import ManageEvents from './ManageEvents';
import ManageVisits from './ManageVisits';
import ManageNotices from './ManageNotices';
import ManageCommittee from './ManageCommittee';
import ManageReports from './ManageReports';
import ManageGallery from './ManageGallery';
import ManageAchievements from './ManageAchievements';
import ManageMoM from './ManageMoM';
import ManageSettings from './ManageSettings';
import ManageAdmins from './ManageAdmins';
import ManageAbout from './ManageAbout';

// --- SVG Icons ---
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('events');
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const adminDocRef = doc(db, 'admins', currentUser.uid);
                const adminDocSnap = await getDoc(adminDocRef);
                if (adminDocSnap.exists()) {
                    setUser(currentUser);
                    setUserRole(adminDocSnap.data().role);
                } else {
                    await signOut(auth);
                    navigate('/login');
                }
            } else {
                navigate('/login');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => await signOut(auth);

    if (loading) {
        return <div className="loading-container">Authenticating...</div>;
    }

    const navItems = [
        { id: 'events', label: 'Events' },
        { id: 'visits', label: 'Visits' },
        { id: 'notices', label: 'Notices' },
        { id: 'committee', label: 'Committee' },
        { id: 'reports', label: 'Reports' },
        { id: 'gallery', label: 'Gallery' },
        { id: 'achievements', label: 'Achievements' },
        { id: 'mom', label: 'MoM' },
        { id: 'about', label: 'About Page' },
        { id: 'settings', label: 'Site Settings' },
    ];

    const superAdminItem = { id: 'adminManagement', label: 'Admin Management' };

    const renderContent = () => {
        switch (activeTab) {
            case 'events': return <ManageEvents />;
            case 'visits': return <ManageVisits />;
            case 'notices': return <ManageNotices />;
            case 'committee': return <ManageCommittee />;
            case 'reports': return <ManageReports />;
            case 'gallery': return <ManageGallery />;
            case 'achievements': return <ManageAchievements />;
            case 'mom': return <ManageMoM />;
            case 'settings': return <ManageSettings />;
            case 'about': return <ManageAbout />;
            case 'adminManagement': 
                return userRole === 'superadmin' ? <ManageAdmins /> : <p className="access-denied">Access Denied. Super admin privileges required.</p>;
            default: return <ManageEvents />;
        }
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1 className="sidebar-title">Admin Panel</h1>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button 
                            key={item.id}
                            className={`nav-button ${activeTab === item.id ? 'active' : ''}`} 
                            onClick={() => setActiveTab(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                    {userRole === 'superadmin' && (
                        <button 
                            className={`nav-button super-admin ${activeTab === superAdminItem.id ? 'active' : ''}`} 
                            onClick={() => setActiveTab(superAdminItem.id)}
                        >
                            {superAdminItem.label}
                        </button>
                    )}
                </nav>
                <div className="sidebar-footer">
                    <div className="user-info">
                        <p className="user-email">{user?.email}</p>
                        <p className="user-role">{userRole}</p>
                    </div>
                    <button onClick={handleLogout} className="logout-button">
                        <LogoutIcon />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <main className="main-content-wrapper">
                {renderContent()}
            </main>
        </div>
    );
}