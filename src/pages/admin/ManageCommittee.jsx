import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToCloudinary } from '../../utils/cloudinary';
import './ManageCommittee.css'; // Make sure to create and link this CSS file

// --- SVG Icons ---
const PlusIcon = () => <svg xmlns="http://www.w.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const ToggleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="8 21 3 21 3 16"></polyline><line x1="20" y1="4" x2="3" y2="21"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;


// --- Initial Form State ---
const initialFormState = {
    name: '', role: 'Program Coordinator', contact: '',
    tenure: '', status: 'Active', priority: 10,
};

export default function ManageCommittee() {
    const [formState, setFormState] = useState(initialFormState);
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null); // ** NEW: State for editing **
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);

    const committeeCollectionRef = collection(db, 'committee');

    const fetchMembers = async () => {
        setLoading(true);
        const committeeQuery = query(collection(db, 'committee'), orderBy('priority', 'asc'));
        const data = await getDocs(committeeQuery);
        setMembers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        setLoading(false);
    };

    useEffect(() => { fetchMembers(); }, []);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const openModalForNew = () => {
        setEditingMember(null);
        setFormState(initialFormState);
        setIsModalOpen(true);
    };

    const openModalForEdit = (member) => {
        setEditingMember(member);
        setFormState(member);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMember(null);
        setFormState(initialFormState);
        setProfilePicFile(null);
        const fileInput = document.getElementById('profile-pic-input');
        if (fileInput) fileInput.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profilePicFile && !editingMember) {
            showNotification('A profile picture is required for new members.', 'error');
            return;
        }
        setLoading(true);

        try {
            let profilePicUrl = editingMember ? formState.profilePicUrl : '';
            if (profilePicFile) {
                profilePicUrl = await uploadToCloudinary(profilePicFile);
            }

            const memberData = {
                ...formState,
                priority: Number(formState.priority),
                profilePicUrl,
            };

            if (editingMember) {
                // Update existing member
                const memberDoc = doc(db, 'committee', editingMember.id);
                await updateDoc(memberDoc, memberData);
                showNotification('Member updated successfully!', 'success');
            } else {
                // Add new member
                await addDoc(committeeCollectionRef, {
                    ...memberData,
                    createdAt: serverTimestamp(),
                });
                showNotification('Committee member added successfully!', 'success');
            }
            
            fetchMembers();
            closeModal();
        } catch (err) {
            showNotification('Operation failed. Please try again.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setConfirmDelete(null);
        try {
            await deleteDoc(doc(db, 'committee', id));
            fetchMembers();
            showNotification('Member removed successfully.', 'success');
        } catch (err) {
            showNotification('Failed to remove member.', 'error');
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Active' ? 'Past Committee' : 'Active';
            const memberDoc = doc(db, 'committee', id);
            await updateDoc(memberDoc, { status: newStatus });
            fetchMembers();
            showNotification('Member status updated.', 'success');
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
                        <p>Are you sure you want to remove this member?</p>
                        <div className="modal-actions">
                            <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="admin-header">
                <h2>Manage Committee</h2>
                <button className="btn-primary" onClick={openModalForNew}>
                    <PlusIcon /> Add New Member
                </button>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit} className="committee-form">
                            <div className="modal-header">
                                <h3>{editingMember ? 'Edit Member' : 'Add New Member'}</h3>
                                <button type="button" className="close-btn" onClick={closeModal}>&times;</button>
                            </div>
                            <div className="form-grid">
                                <div className="form-group"><label>Full Name</label><input name="name" type="text" value={formState.name} onChange={handleInputChange} required /></div>
                                <div className="form-group"><label>Role</label><select name="role" value={formState.role} onChange={handleInputChange}><option>Chairperson</option><option>Vice Chairperson</option><option>Secretary</option><option>Treasurer</option><option>Program Coordinator</option><option>Editor</option><option>Staff Advisor/Faculty</option></select></div>
                                <div className="form-group"><label>Contact (Email/Phone)</label><input name="contact" type="text" value={formState.contact} onChange={handleInputChange} required /></div>
                                <div className="form-group"><label>Tenure</label><input name="tenure" type="text" value={formState.tenure} onChange={handleInputChange} placeholder="e.g., 2025-26" required /></div>
                                <div className="form-group"><label>Status</label><select name="status" value={formState.status} onChange={handleInputChange}><option>Active</option><option>Past Committee</option></select></div>
                                <div className="form-group"><label>Display Priority (1 is highest)</label><input name="priority" type="number" value={formState.priority} onChange={handleInputChange} required /></div>
                                <div className="form-group full-width"><label>Profile Picture</label><input id="profile-pic-input" type="file" onChange={(e) => setProfilePicFile(e.target.files[0])} accept="image/*" /></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Member'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-content-area">
                <div className="committee-member-grid">
                    {loading && members.length === 0 ? <p>Loading members...</p> : members.map(member => (
                        <div key={member.id} className="member-item-card">
                            <div className="priority-badge">{member.priority}</div>
                            <img src={member.profilePicUrl} alt={member.name} className="item-photo" />
                            <div className="item-details">
                                <p className="item-name">{member.name}</p>
                                <p className="item-role">{member.role}</p>
                                <span className={`status-badge ${member.status === 'Active' ? 'active' : 'past'}`}>{member.status}</span>
                            </div>
                            <div className="item-actions">
                                <button onClick={() => openModalForEdit(member)} className="action-btn edit" title="Edit"><EditIcon /></button>
                                <button onClick={() => handleStatusToggle(member.id, member.status)} className="action-btn" title="Toggle Status"><ToggleIcon /></button>
                                <button onClick={() => setConfirmDelete(member.id)} className="action-btn delete" title="Delete"><TrashIcon /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}