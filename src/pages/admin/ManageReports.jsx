import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToCloudinary } from '../../utils/cloudinary';
import './ManageReports.css'; // Make sure to create and link this CSS file

// --- SVG Icons ---
const PlusIcon = () => <svg xmlns="http://www.w.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const ArchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;

// --- Initial Form State ---
const initialFormState = {
    title: 'Annual Report',
    year: new Date().getFullYear().toString(),
    description: '',
};

export default function ManageReports() {
    const [formState, setFormState] = useState(initialFormState);
    const [reportFile, setReportFile] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);

    const reportsCollectionRef = collection(db, 'reports');

    const fetchReports = async () => {
        setLoading(true);
        const reportsQuery = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        const data = await getDocs(reportsQuery);
        setReports(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        setLoading(false);
    };

    useEffect(() => { fetchReports(); }, []);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 1024 * 1024) { // 1MB size limit
            showNotification('File must be under 1MB.', 'error');
            setReportFile(null);
            e.target.value = null;
        } else {
            setReportFile(file);
        }
    };

    const resetForm = () => {
        setFormState(initialFormState);
        setReportFile(null);
        const fileInput = document.getElementById('report-file-input');
        if (fileInput) fileInput.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reportFile) {
            showNotification('Please select a file to upload.', 'error');
            return;
        }
        setLoading(true);

        try {
            const fileUrl = await uploadToCloudinary(reportFile);
            await addDoc(reportsCollectionRef, {
                ...formState,
                fileUrl,
                status: 'Active',
                createdAt: serverTimestamp(),
            });
            resetForm();
            fetchReports();
            setIsModalOpen(false);
            showNotification('Report uploaded successfully!', 'success');
        } catch (err) {
            showNotification('Failed to upload report.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setConfirmDelete(null);
        try {
            await deleteDoc(doc(db, 'reports', id));
            fetchReports();
            showNotification('Report deleted successfully.', 'success');
        } catch (err) {
            showNotification('Failed to delete report.', 'error');
        }
    };

    const handleArchiveToggle = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Active' ? 'Archived' : 'Active';
            const reportDoc = doc(db, 'reports', id);
            await updateDoc(reportDoc, { status: newStatus });
            fetchReports();
            showNotification(`Report status updated to ${newStatus}.`, 'success');
        } catch (err) {
            showNotification('Failed to update status.', 'error');
        }
    };

    return (
        <div className="admin-page-container">
            {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            {confirmDelete && (
                <div className="confirmation-modal-backdrop">
                    <div className="confirmation-modal">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this report?</p>
                        <div className="modal-actions">
                            <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="admin-header">
                <h2>Manage Reports</h2>
                <button type="button" className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <PlusIcon /> Upload New Report
                </button>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit} className="report-form">
                            <div className="modal-header">
                                <h3>Upload New Report</h3>
                                <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                            </div>
                            <div className="form-grid">
                                <div className="form-group"><label>Report Title</label><select name="title" value={formState.title} onChange={(e) => setFormState({...formState, title: e.target.value})}><option>Annual Report</option><option>Activity Report</option><option>Financial Report</option><option>Minutes of Meeting (MoM)</option></select></div>
                                <div className="form-group"><label>Year</label><input name="year" type="number" value={formState.year} onChange={(e) => setFormState({...formState, year: e.target.value})} placeholder="e.g., 2025" required /></div>
                                <div className="form-group full-width"><label>Description</label><textarea name="description" value={formState.description} onChange={(e) => setFormState({...formState, description: e.target.value})} rows="3" required></textarea></div>
                                <div className="form-group full-width"><label>Upload File (Image only, max 1MB)</label><input id="report-file-input" type="file" onChange={handleFileChange} accept="image/*" required /></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-content-area">
                <div className="report-list">
                    {loading && reports.length === 0 ? <p>Loading reports...</p> : reports.map(report => (
                        <div key={report.id} className="report-list-item">
                            <img src={report.fileUrl} alt={report.title} className="item-thumbnail" />
                            <div className="item-details">
                                <p className="item-title">{report.title} - {report.year}</p>
                                <p className="item-subtitle">{report.description}</p>
                            </div>
                            <span className={`status-badge ${report.status?.toLowerCase()}`}>{report.status}</span>
                            <div className="item-actions">
                                <button onClick={() => handleArchiveToggle(report.id, report.status)} className="action-btn" title={report.status === 'Active' ? 'Archive' : 'Unarchive'}><ArchiveIcon /></button>
                                <button onClick={() => setConfirmDelete(report.id)} className="action-btn delete" title="Delete"><TrashIcon /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}