import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import './ManageAdmins.css'; // Make sure to create and link this CSS file

// --- SVG Icons ---
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

export default function ManageAdmins() {
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [approvedAdmins, setApprovedAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [confirmDisable, setConfirmDisable] = useState(null);

    const fetchAllAdmins = async () => {
        setLoading(true);
        const pendingSnapshot = await getDocs(collection(db, 'pendingAdmins'));
        setPendingAdmins(pendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const approvedSnapshot = await getDocs(collection(db, 'admins'));
        setApprovedAdmins(approvedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
    };

    useEffect(() => { fetchAllAdmins(); }, []);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleApprove = async (admin) => {
        try {
            await setDoc(doc(db, 'admins', admin.uid), {
                uid: admin.uid,
                email: admin.email,
                role: 'admin',
                approvedAt: serverTimestamp(),
            });
            await deleteDoc(doc(db, 'pendingAdmins', admin.id));
            fetchAllAdmins();
            showNotification('Admin approved successfully!', 'success');
        } catch (err) {
            showNotification('Failed to approve admin.', 'error');
        }
    };

    const handleRoleChange = async (adminId, newRole) => {
        try {
            await updateDoc(doc(db, 'admins', adminId), { role: newRole });
            fetchAllAdmins();
            showNotification('Admin role updated.', 'success');
        } catch (err) {
            showNotification('Failed to update role.', 'error');
        }
    };

    const handleDisable = async (adminId) => {
        setConfirmDisable(null);
        try {
            await deleteDoc(doc(db, 'admins', adminId));
            fetchAllAdmins();
            showNotification('Admin access has been disabled.', 'success');
        } catch (err) {
            showNotification('Failed to disable admin.', 'error');
        }
    };

    return (
        <div className="admin-page-container">
            {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            {confirmDisable && (
                <div className="confirmation-modal-backdrop">
                    <div className="confirmation-modal">
                        <h3>Confirm Disable</h3>
                        <p>Disabling this admin will remove their access. Are you sure?</p>
                        <div className="modal-actions">
                            <button onClick={() => setConfirmDisable(null)} className="btn-secondary">Cancel</button>
                            <button onClick={() => handleDisable(confirmDisable)} className="btn-danger">Disable</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-header">
                <h2>Admin & Role Management</h2>
            </div>

            <div className="admin-content-area">
                <div className="admin-section">
                    <h3 className="section-title">Pending Approval</h3>
                    <div className="admin-list">
                        {loading && pendingAdmins.length === 0 ? <p>Loading...</p> : pendingAdmins.length === 0 ? (
                            <p className="empty-text">No pending admin requests.</p>
                        ) : (
                            pendingAdmins.map(admin => (
                                <div key={admin.id} className="admin-list-item">
                                    <span className="admin-email">{admin.email}</span>
                                    <button onClick={() => handleApprove(admin)} className="btn-approve">
                                        <CheckIcon /> Approve
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="admin-section">
                    <h3 className="section-title">Approved Admins</h3>
                    <div className="admin-list">
                        {approvedAdmins.map(admin => (
                            <div key={admin.id} className="admin-list-item">
                                <span className="admin-email">{admin.email}</span>
                                <div className="admin-actions">
                                    <select 
                                        value={admin.role}
                                        onChange={(e) => handleRoleChange(admin.id, e.target.value)}
                                        disabled={admin.email === auth.currentUser.email}
                                        className="role-select"
                                    >
                                        <option value="superadmin">Super Admin</option>
                                        <option value="admin">Admin</option>
                                        <option value="eventAdmin">Event Admin</option>
                                        <option value="contentAdmin">Content Admin</option>
                                        <option value="readOnly">Read-Only</option>
                                    </select>
                                    <button 
                                        onClick={() => setConfirmDisable(admin.id)}
                                        disabled={admin.email === auth.currentUser.email}
                                        className="btn-disable"
                                    >
                                        Disable
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}