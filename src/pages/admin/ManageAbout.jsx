import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import './ManageAbout.css'; // Make sure to create and link this CSS file

const initialContentState = {
    chapterHistory: '',
    objectives: '',
    vision: '',
    mission: '',
    departmentOverview: '',
};

export default function ManageAbout() {
    const [aboutContent, setAboutContent] = useState(initialContentState);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const aboutDocRef = doc(db, 'content', 'about');

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const docSnap = await getDoc(aboutDocRef);
            if (docSnap.exists()) {
                setAboutContent(docSnap.data());
            }
            setLoading(false);
        };
        fetchContent();
    }, []);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAboutContent(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await setDoc(aboutDocRef, {
                ...aboutContent,
                updatedAt: serverTimestamp(),
            }, { merge: true });
            showNotification('"About Us" content updated successfully!', 'success');
        } catch (err) {
            console.error(err);
            showNotification('Failed to update content.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page-container">
            {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            
            <div className="admin-header">
                <h2>Manage "About Us" Page</h2>
            </div>

            <div className="admin-content-area">
                <form onSubmit={handleSubmit} className="about-form">
                    <div className="form-section">
                        <h3 className="section-title">Chapter Details</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Chapter History</label>
                                <textarea name="chapterHistory" value={aboutContent.chapterHistory} onChange={handleInputChange} rows="5" />
                            </div>
                            <div className="form-group full-width">
                                <label>Objectives & Benefits</label>
                                <textarea name="objectives" value={aboutContent.objectives} onChange={handleInputChange} rows="5" />
                            </div>
                            <div className="form-group">
                                <label>Vision</label>
                                <textarea name="vision" value={aboutContent.vision} onChange={handleInputChange} rows="4" />
                            </div>
                            <div className="form-group">
                                <label>Mission</label>
                                <textarea name="mission" value={aboutContent.mission} onChange={handleInputChange} rows="4" />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Department Overview</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Department Overview</label>
                                <textarea name="departmentOverview" value={aboutContent.departmentOverview} onChange={handleInputChange} rows="5" />
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Content'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}