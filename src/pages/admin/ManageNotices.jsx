import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToCloudinary } from '../../utils/cloudinary';
import './ManageNotices.css'; // Make sure to create and link this CSS file

// --- SVG Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const PinIcon = ({ isPinned }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
);

// --- Initial Form State ---
const initialFormState = {
    title: '', content: '', category: 'General',
    startDate: '', endDate: '', visibility: 'Public',
};

export default function ManageNotices() {
    const [formState, setFormState] = useState(initialFormState);
    const [file, setFile] = useState(null);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);

    const noticesCollectionRef = collection(db, 'notices');

    const fetchNotices = async () => {
        setLoading(true);
        const noticesQuery = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
        const data = await getDocs(noticesQuery);
        setNotices(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        setLoading(false);
    };

    useEffect(() => { fetchNotices(); }, []);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormState(initialFormState);
        setFile(null);
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let fileUrl = '';

        try {
            if (file) {
                fileUrl = await uploadToCloudinary(file);
            }
            await addDoc(noticesCollectionRef, {
                ...formState,
                fileUrl,
                isPinned: false,
                createdAt: serverTimestamp(),
            });
            resetForm();
            fetchNotices();
            setIsModalOpen(false);
            showNotification('Notice added successfully!', 'success');
        } catch (err) {
            showNotification('Failed to add notice.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setConfirmDelete(null);
        try {
            await deleteDoc(doc(db, 'notices', id));
            fetchNotices();
            showNotification('Notice deleted successfully.', 'success');
        } catch (err) {
            showNotification('Failed to delete notice.', 'error');
        }
    };
    
    const handlePinToggle = async (id, currentPinStatus) => {
        try {
            const noticeDoc = doc(db, 'notices', id);
            await updateDoc(noticeDoc, { isPinned: !currentPinStatus });
            fetchNotices();
            showNotification(`Notice ${!currentPinStatus ? 'pinned' : 'unpinned'}.`, 'success');
        } catch (err) {
            showNotification('Failed to update pin status.', 'error');
        }
    };

    return (
        <div className="admin-page-container">
            {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            {confirmDelete && (
                <div className="confirmation-modal-backdrop">
                    <div className="confirmation-modal">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this notice?</p>
                        <div className="modal-actions">
                            <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="admin-header">
                <h2>Manage Notices</h2>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <PlusIcon /> Add New Notice
                </button>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit} className="notice-form">
                            <div className="modal-header">
                                <h3>Add New Notice</h3>
                                <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                            </div>
                            <div className="form-grid">
                                <div className="form-group full-width"><label>Notice Title</label><input name="title" type="text" value={formState.title} onChange={handleInputChange} required /></div>
                                <div className="form-group full-width"><label>Content</label><textarea name="content" value={formState.content} onChange={handleInputChange} rows="4" required></textarea></div>
                                <div className="form-group"><label>Category</label><select name="category" value={formState.category} onChange={handleInputChange}><option>General</option><option>Event</option><option>Committee Notice</option><option>Academic</option></select></div>
                                <div className="form-group"><label>Visibility</label><select name="visibility" value={formState.visibility} onChange={handleInputChange}><option>Public</option><option>Internal only</option></select></div>
                                <div className="form-group"><label>Start Date</label><input name="startDate" type="date" value={formState.startDate} onChange={handleInputChange} required /></div>
                                <div className="form-group"><label>End Date</label><input name="endDate" type="date" value={formState.endDate} onChange={handleInputChange} required /></div>
                                <div className="form-group full-width"><label>Upload File (Optional)</label><input id="file-input" type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,image/*" /></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Add Notice'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-content-area">
                <div className="notice-list">
                    {loading && notices.length === 0 ? <p>Loading notices...</p> : notices.map(notice => (
                        <div key={notice.id} className={`notice-list-item ${notice.isPinned ? 'pinned' : ''}`}>
                            <div className="item-details">
                                <p className="item-title">{notice.title}</p>
                                <p className="item-subtitle">{notice.category} | Visible: {notice.startDate} to {notice.endDate}</p>
                            </div>
                            <div className="item-actions">
                                <button onClick={() => handlePinToggle(notice.id, notice.isPinned)} className={`pin-btn ${notice.isPinned ? 'active' : ''}`} title={notice.isPinned ? 'Unpin' : 'Pin'}>
                                    <PinIcon isPinned={notice.isPinned} />
                                </button>
                                <button onClick={() => setConfirmDelete(notice.id)} className="delete-btn" title="Delete">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}