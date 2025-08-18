import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToCloudinary } from '../../utils/cloudinary';
import './ManageAchievements.css'; // Make sure to create and link this CSS file

// --- SVG Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

// --- Initial Form State ---
const initialFormState = {
    title: 'Award',
    date: '',
    description: '',
};

export default function ManageAchievements() {
    const [formState, setFormState] = useState(initialFormState);
    const [file, setFile] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);

    const achievementsCollectionRef = collection(db, 'achievements');

    const fetchAchievements = async () => {
        setLoading(true);
        const achievementsQuery = query(collection(db, 'achievements'), orderBy('createdAt', 'desc'));
        const data = await getDocs(achievementsQuery);
        setAchievements(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        setLoading(false);
    };

    useEffect(() => { fetchAchievements(); }, []);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.size > 1024 * 1024) { // 1MB limit
            showNotification('Image must be under 1MB.', 'error');
            setFile(null);
            e.target.value = null;
        } else {
            setFile(selectedFile);
        }
    };

    const resetForm = () => {
        setFormState(initialFormState);
        setFile(null);
        const fileInput = document.getElementById('achievement-file-input');
        if (fileInput) fileInput.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            showNotification('Please select a supporting image.', 'error');
            return;
        }
        setLoading(true);

        try {
            const fileUrl = await uploadToCloudinary(file);
            await addDoc(achievementsCollectionRef, {
                ...formState,
                fileUrl,
                createdAt: serverTimestamp(),
            });
            resetForm();
            fetchAchievements();
            setIsModalOpen(false);
            showNotification('Achievement added successfully!', 'success');
        } catch (err) {
            showNotification('Failed to add achievement.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setConfirmDelete(null);
        try {
            await deleteDoc(doc(db, 'achievements', id));
            fetchAchievements();
            showNotification('Achievement deleted successfully.', 'success');
        } catch (err) {
            showNotification('Failed to delete achievement.', 'error');
        }
    };

    return (
        <div className="admin-page-container">
            {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            {confirmDelete && (
                <div className="confirmation-modal-backdrop">
                    <div className="confirmation-modal">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this achievement?</p>
                        <div className="modal-actions">
                            <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="admin-header">
                <h2>Manage Achievements</h2>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <PlusIcon /> Add New Achievement
                </button>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit} className="achievement-form">
                            <div className="modal-header">
                                <h3>Add New Achievement</h3>
                                <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                            </div>
                            <div className="form-grid">
                                <div className="form-group"><label>Title / Type</label><select name="title" value={formState.title} onChange={(e) => setFormState({...formState, title: e.target.value})}><option>Award</option><option>Paper Presentation</option><option>Competition Win</option><option>Media Coverage</option></select></div>
                                <div className="form-group"><label>Date</label><input name="date" type="date" value={formState.date} onChange={(e) => setFormState({...formState, date: e.target.value})} required /></div>
                                <div className="form-group full-width"><label>Description</label><textarea name="description" value={formState.description} onChange={(e) => setFormState({...formState, description: e.target.value})} rows="3" required></textarea></div>
                                <div className="form-group full-width"><label>Upload Supporting File (Image, max 1MB)</label><input id="achievement-file-input" type="file" onChange={handleFileChange} accept="image/*" required /></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-content-area">
                <div className="achievement-list">
                    {loading && achievements.length === 0 ? <p>Loading achievements...</p> : achievements.map(item => (
                        <div key={item.id} className="achievement-list-item">
                            <img src={item.fileUrl} alt={item.title} className="item-thumbnail" />
                            <div className="item-details">
                                <p className="item-title">{item.title}</p>
                                <p className="item-subtitle">{item.date}</p>
                            </div>
                            <button onClick={() => setConfirmDelete(item.id)} className="delete-btn" title="Delete">
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}