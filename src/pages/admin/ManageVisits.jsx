import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToCloudinary } from '../../utils/cloudinary';
import './ManageVisits.css'; // Make sure to create and link this CSS file

// --- SVG Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

// --- Initial Form State ---
const initialFormState = {
    visitTitle: '', industryName: '', dateOfVisit: '',
    facultyIncharge: '', eligibility: '',
};

export default function ManageVisits() {
    const [formState, setFormState] = useState(initialFormState);
    const [reportFile, setReportFile] = useState(null);
    const [photoFiles, setPhotoFiles] = useState([]);
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);

    const visitsCollectionRef = collection(db, 'industrialVisits');

    const fetchVisits = async () => {
        setLoading(true);
        const visitsQuery = query(collection(db, 'industrialVisits'), orderBy('createdAt', 'desc'));
        const data = await getDocs(visitsQuery);
        setVisits(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        setLoading(false);
    };

    useEffect(() => { fetchVisits(); }, []);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleReportFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 1024 * 1024) { // 1MB size limit
            showNotification('Permission letter image must be under 1MB.', 'error');
            setReportFile(null);
            e.target.value = null;
        } else {
            setReportFile(file);
        }
    };

    const resetForm = () => {
        setFormState(initialFormState);
        setReportFile(null);
        setPhotoFiles([]);
        const reportInput = document.getElementById('report-file-input');
        const photosInput = document.getElementById('photos-file-input');
        if (reportInput) reportInput.value = null;
        if (photosInput) photosInput.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reportFile || photoFiles.length === 0) {
            showNotification('Please upload a permission letter and at least one photo.', 'error');
            return;
        }
        setLoading(true);

        try {
            const reportUrl = await uploadToCloudinary(reportFile);
            const photoUrls = await Promise.all(
                Array.from(photoFiles).map(file => uploadToCloudinary(file))
            );

            await addDoc(visitsCollectionRef, {
                ...formState,
                reportUrl,
                photoUrls,
                createdAt: serverTimestamp(),
            });

            resetForm();
            fetchVisits();
            setIsModalOpen(false);
            showNotification('Industrial Visit added successfully!', 'success');
        } catch (err) {
            showNotification('Failed to add visit. Please try again.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setConfirmDelete(null);
        try {
            await deleteDoc(doc(db, 'industrialVisits', id));
            fetchVisits();
            showNotification('Visit record deleted successfully.', 'success');
        } catch (err) {
            showNotification('Failed to delete visit record.', 'error');
            console.error(err);
        }
    };

    return (
        <div className="admin-page-container">
            {notification.show && (
                <div className={`notification ${notification.type}`}>{notification.message}</div>
            )}

            {confirmDelete && (
                <div className="confirmation-modal-backdrop">
                    <div className="confirmation-modal">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this visit record?</p>
                        <div className="modal-actions">
                            <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="admin-header">
                <h2>Manage Industrial Visits</h2>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <PlusIcon /> Add New Visit
                </button>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit} className="visit-form">
                            <div className="modal-header">
                                <h3>Add New Visit</h3>
                                <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                            </div>
                            
                            <div className="form-grid">
                                <div className="form-group"><label>Visit Title</label><input type="text" value={formState.visitTitle} onChange={(e) => setFormState({...formState, visitTitle: e.target.value})} required /></div>
                                <div className="form-group"><label>Industry Name & Location</label><input type="text" value={formState.industryName} onChange={(e) => setFormState({...formState, industryName: e.target.value})} required /></div>
                                <div className="form-group"><label>Date of Visit</label><input type="date" value={formState.dateOfVisit} onChange={(e) => setFormState({...formState, dateOfVisit: e.target.value})} required /></div>
                                <div className="form-group"><label>Faculty In-charge</label><input type="text" value={formState.facultyIncharge} onChange={(e) => setFormState({...formState, facultyIncharge: e.target.value})} required /></div>
                                <div className="form-group full-width"><label>Student Eligibility</label><input type="text" value={formState.eligibility} onChange={(e) => setFormState({...formState, eligibility: e.target.value})} placeholder="e.g., 3rd Year EE Students" required /></div>
                                <div className="form-group"><label>Upload Permission Letter (max 1MB)</label><input id="report-file-input" type="file" onChange={handleReportFileChange} accept="image/*" required /></div>
                                <div className="form-group"><label>Upload Photos (multiple)</label><input id="photos-file-input" type="file" onChange={(e) => setPhotoFiles(e.target.files)} accept="image/*" multiple required /></div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Uploading...' : 'Add Visit'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-content-area">
                <div className="visit-list">
                    {loading && visits.length === 0 ? <p>Loading visits...</p> : visits.map(visit => (
                        <div key={visit.id} className="visit-list-item">
                            <img src={visit.photoUrls?.[0]} alt={visit.visitTitle} className="item-thumbnail" />
                            <div className="item-details">
                                <p className="item-title">{visit.visitTitle}</p>
                                <p className="item-subtitle">{visit.industryName} | {visit.dateOfVisit}</p>
                            </div>
                            <button onClick={() => setConfirmDelete(visit.id)} className="delete-btn">
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}