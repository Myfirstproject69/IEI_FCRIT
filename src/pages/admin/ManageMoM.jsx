import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToCloudinary } from '../../utils/cloudinary';
import './ManageMoM.css'; // Make sure to create and link this CSS file

// --- SVG Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const ArchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
const DetailsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;

// --- Initial Form State ---
const initialFormState = {
    title: '', date: '', agenda: '', decisions: '',
};

// --- MoM List Item Component ---
const MoMListItem = ({ mom, onDelete, onArchiveToggle, onToggleExpand, isExpanded }) => {
    return (
        <div className={`mom-list-item ${isExpanded ? 'expanded' : ''}`}>
            <div className="item-main-row">
                {mom.fileUrl && <img src={mom.fileUrl} alt={mom.title} className="item-thumbnail" />}
                <div className="item-details">
                    <p className="item-title">{mom.title}</p>
                    <p className="item-subtitle">{mom.date}</p>
                </div>
                <span className={`status-badge ${mom.status?.toLowerCase()}`}>{mom.status}</span>
                <div className="item-actions">
                    <button onClick={() => onToggleExpand(mom.id)} className="action-btn" title={isExpanded ? 'Hide Details' : 'Show Details'}><DetailsIcon /></button>
                    <button onClick={() => onArchiveToggle(mom.id, mom.status)} className="action-btn" title={mom.status === 'Active' ? 'Archive' : 'Unarchive'}><ArchiveIcon /></button>
                    <button onClick={() => onDelete(mom.id)} className="action-btn delete" title="Delete"><TrashIcon /></button>
                </div>
            </div>
            <div className="expanded-details">
                <div className="detail-section">
                    <h4>Agenda</h4>
                    <p>{mom.agenda}</p>
                </div>
                <div className="detail-section">
                    <h4>Decisions</h4>
                    <p>{mom.decisions}</p>
                </div>
            </div>
        </div>
    );
};

export default function ManageMoM() {
    const [formState, setFormState] = useState(initialFormState);
    const [file, setFile] = useState(null);
    const [moms, setMoms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [expandedMomId, setExpandedMomId] = useState(null);

    const momCollectionRef = collection(db, 'moms');

    const fetchMoms = async () => {
        setLoading(true);
        const momQuery = query(collection(db, 'moms'), orderBy('createdAt', 'desc'));
        const data = await getDocs(momQuery);
        setMoms(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        setLoading(false);
    };

    useEffect(() => { fetchMoms(); }, []);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.size > 1024 * 1024) {
            showNotification('Image must be under 1MB.', 'error');
            setFile(null);
            e.target.value = null;
        } else {
            setFile(selectedFile);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormState(initialFormState);
        setFile(null);
        const fileInput = document.getElementById('mom-file-input');
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
            await addDoc(momCollectionRef, {
                ...formState,
                fileUrl,
                status: 'Active',
                createdAt: serverTimestamp(),
            });
            resetForm();
            fetchMoms();
            setIsModalOpen(false);
            showNotification('Minutes of Meeting saved successfully!', 'success');
        } catch (err) {
            showNotification('Failed to save MoM.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setConfirmDelete(null);
        try {
            await deleteDoc(doc(db, 'moms', id));
            fetchMoms();
            showNotification('Minutes deleted successfully.', 'success');
        } catch (err) {
            showNotification('Failed to delete minutes.', 'error');
        }
    };

    const handleArchiveToggle = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Active' ? 'Archived' : 'Active';
            await updateDoc(doc(db, 'moms', id), { status: newStatus });
            fetchMoms();
            showNotification(`Status updated to ${newStatus}.`, 'success');
        } catch (err) {
            showNotification('Failed to update status.', 'error');
        }
    };

    const handleToggleExpand = (id) => {
        setExpandedMomId(prevId => (prevId === id ? null : id));
    };

    return (
        <div className="admin-page-container">
            {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            {confirmDelete && (
                <div className="confirmation-modal-backdrop">
                    <div className="confirmation-modal">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete these minutes?</p>
                        <div className="modal-actions">
                            <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="admin-header">
                <h2>Manage Minutes of Meetings</h2>
                <button type="button" className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <PlusIcon /> Add New Minutes
                </button>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit} className="mom-form">
                            <div className="modal-header"><h3>Add New Meeting Minutes</h3><button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button></div>
                            <div className="form-grid">
                                <div className="form-group"><label>Meeting Title</label><input name="title" type="text" value={formState.title} onChange={handleInputChange} required /></div>
                                <div className="form-group"><label>Date</label><input name="date" type="date" value={formState.date} onChange={handleInputChange} required /></div>
                                <div className="form-group full-width"><label>Agenda Items</label><textarea name="agenda" value={formState.agenda} onChange={handleInputChange} rows="3" required></textarea></div>
                                <div className="form-group full-width"><label>Decisions Taken</label><textarea name="decisions" value={formState.decisions} onChange={handleInputChange} rows="3" required></textarea></div>
                                <div className="form-group full-width"><label>Upload Signed Copy (Optional Image, max 1MB)</label><input id="mom-file-input" type="file" onChange={handleFileChange} accept="image/*" /></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Minutes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-content-area">
                <div className="mom-list">
                    {loading && moms.length === 0 ? <p>Loading minutes...</p> : moms.map(mom => (
                         <MoMListItem
                            key={mom.id}
                            mom={mom}
                            onDelete={() => setConfirmDelete(mom.id)}
                            onArchiveToggle={handleArchiveToggle}
                            onToggleExpand={handleToggleExpand}
                            isExpanded={expandedMomId === mom.id}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}