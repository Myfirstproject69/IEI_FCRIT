import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToCloudinary } from '../../utils/cloudinary';
import './ManageSettings.css'; // Make sure to create and link this CSS file

// --- Initial Form State ---
const initialSettings = {
    instagramUrl: '', linkedinUrl: '', websiteUrl: '', collegeUrl: '', logoUrl: '',
};

export default function ManageSettings() {
    const [settings, setSettings] = useState(initialSettings);
    const [logoFile, setLogoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const settingsDocRef = doc(db, 'settings', 'main');

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const docSnap = await getDoc(settingsDocRef);
            if (docSnap.exists()) {
                setSettings(docSnap.data());
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 1024 * 1024) { // 1MB limit
            showNotification('Logo image must be under 1MB.', 'error');
            setLogoFile(null);
            e.target.value = null;
        } else {
            setLogoFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let newLogoUrl = settings.logoUrl;
            if (logoFile) {
                newLogoUrl = await uploadToCloudinary(logoFile);
            }

            const updatedSettings = {
                ...settings,
                logoUrl: newLogoUrl,
                updatedAt: serverTimestamp(),
            };
            
            await setDoc(settingsDocRef, updatedSettings, { merge: true });
            
            setSettings(updatedSettings);
            showNotification('Settings updated successfully!', 'success');
        } catch (err) {
            showNotification('Failed to update settings.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page-container">
            {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            
            <div className="admin-header">
                <h2>Manage Site Settings</h2>
            </div>

            <div className="admin-content-area">
                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="form-section">
                        <h3 className="section-title">Social & External Links</h3>
                        <div className="form-grid">
                            <div className="form-group"><label>Instagram URL</label><input name="instagramUrl" type="url" value={settings.instagramUrl} onChange={handleInputChange} /></div>
                            <div className="form-group"><label>LinkedIn URL</label><input name="linkedinUrl" type="url" value={settings.linkedinUrl} onChange={handleInputChange} /></div>
                            <div className="form-group"><label>Main Website URL</label><input name="websiteUrl" type="url" value={settings.websiteUrl} onChange={handleInputChange} /></div>
                            <div className="form-group"><label>College Website URL</label><input name="collegeUrl" type="url" value={settings.collegeUrl} onChange={handleInputChange} /></div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Branding</h3>
                        <div className="form-group">
                            <label>Chapter Logo (max 1MB)</label>
                            <div className="logo-upload-area">
                                {settings.logoUrl && <img src={settings.logoUrl} alt="Current Logo" className="logo-preview" />}
                                <input type="file" onChange={handleFileChange} accept="image/*" />
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}