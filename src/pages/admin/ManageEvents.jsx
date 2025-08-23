import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToCloudinary } from '../../utils/cloudinary';
import './ManageEvents.css';

// --- SVG Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;


// --- Initial Form State ---
const initialFormState = {
    title: '', type: 'Workshop', date: '', eventTime: '', venue: '',
    eligibility: '', feeType: 'Free', feeAmount: '',
    description: '', facultyInCharge: '', status: 'Published',
    speaker: '', registerLink: '',
};

export default function ManageEvents() {
    const [formState, setFormState] = useState(initialFormState);
    const [posterFile, setPosterFile] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);

    const eventsCollectionRef = collection(db, 'events');

    const fetchEvents = async () => {
        setLoading(true);
        const eventsQuery = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
        const data = await getDocs(eventsQuery);
        setEvents(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        setLoading(false);
    };

    useEffect(() => { fetchEvents(); }, []);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const openModalForNew = () => {
        setEditingEvent(null);
        setFormState(initialFormState);
        setIsModalOpen(true);
    };

    const openModalForEdit = (event) => {
        const eventDate = event.dateTime?.toDate();
        const date = eventDate ? eventDate.toISOString().split('T')[0] : '';
        const eventTime = eventDate ? eventDate.toTimeString().substring(0, 5) : '';
        
        setEditingEvent(event);
        setFormState({ ...event, date, eventTime });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
        setFormState(initialFormState);
        setPosterFile(null);
        const fileInput = document.getElementById('poster-input');
        if (fileInput) fileInput.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!posterFile && !editingEvent) {
            showNotification('Please select a poster for the new event.', 'error');
            return;
        }
        setLoading(true);

        try {
            let posterUrl = editingEvent ? formState.posterUrl : '';
            if (posterFile) {
                posterUrl = await uploadToCloudinary(posterFile);
            }

            const dateTime = new Date(`${formState.date}T${formState.eventTime}`);
            const eventData = {
                ...formState,
                dateTime,
                posterUrl,
                feeAmount: formState.feeType === 'Paid' ? formState.feeAmount : '0',
            };

            if (editingEvent) {
                const eventDoc = doc(db, 'events', editingEvent.id);
                await updateDoc(eventDoc, eventData);
                showNotification('Event updated successfully!', 'success');
            } else {
                await addDoc(eventsCollectionRef, {
                    ...eventData,
                    createdAt: serverTimestamp(),
                });
                showNotification('Event added successfully!', 'success');
            }
            
            fetchEvents();
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
            await deleteDoc(doc(db, 'events', id));
            fetchEvents();
            showNotification('Event deleted successfully.', 'success');
        } catch (err) {
            showNotification('Failed to delete event.', 'error');
            console.error(err);
        }
    };

    const getSafeDate = (event) => {
        if (!event.dateTime) return 'No date specified';
        if (typeof event.dateTime.toDate === 'function') {
            return event.dateTime.toDate().toLocaleString();
        }
        return new Date(event.dateTime).toLocaleString();
    };

    return (
        <div className="admin-page-container">
            {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            {confirmDelete && (
                <div className="confirmation-modal-backdrop">
                    <div className="confirmation-modal">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this event?</p>
                        <div className="modal-actions">
                            <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="admin-header">
                <h2>Manage Events & Workshops</h2>
                <button type="button" className="btn-primary" onClick={openModalForNew}>
                    <PlusIcon /> Add New Event
                </button>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit} className="event-form">
                            <div className="modal-header">
                                <h3>{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
                                <button type="button" className="close-btn" onClick={closeModal}>&times;</button>
                            </div>
                            <div className="form-grid">
                                <div className="form-group"><label>Event Title</label><input name="title" value={formState.title} onChange={handleInputChange} type="text" required /></div>
                                <div className="form-group"><label>Type</label><select name="type" value={formState.type} onChange={handleInputChange}><option>Workshop</option><option>Seminar</option><option>Guest Lecture</option><option>Visit</option><option>Competition</option><option>Webinar</option></select></div>
                                <div className="form-group"><label>Date</label><input name="date" value={formState.date} onChange={handleInputChange} type="date" required /></div>
                                <div className="form-group"><label>Time</label><input name="eventTime" value={formState.eventTime} onChange={handleInputChange} type="time" required /></div>
                                <div className="form-group"><label>Venue</label><input name="venue" value={formState.venue} onChange={handleInputChange} type="text" placeholder="e.g., Online or Seminar Hall" required /></div>
                                <div className="form-group"><label>Eligibility</label><input name="eligibility" value={formState.eligibility} onChange={handleInputChange} placeholder="e.g., All branches, EE only" required /></div>
                                <div className="form-group"><label>Fees</label><div className="fee-options"><label><input type="radio" name="feeType" value="Free" checked={formState.feeType==='Free'} onChange={handleInputChange}/> Free</label><label><input type="radio" name="feeType" value="Paid" checked={formState.feeType==='Paid'} onChange={handleInputChange}/> Paid</label></div>{formState.feeType==='Paid' && <input name="feeAmount" value={formState.feeAmount} onChange={handleInputChange} type="number" placeholder="Enter amount" required />}</div>
                                <div className="form-group full-width"><label>Description (Agenda, Outcomes)</label><textarea name="description" value={formState.description} onChange={handleInputChange} required></textarea></div>
                                <div className="form-group"><label>Faculty/Committee In-charge</label><input name="facultyInCharge" value={formState.facultyInCharge} onChange={handleInputChange} type="text" required /></div>
                                <div className="form-group"><label>Speaker (if any)</label><input name="speaker" value={formState.speaker} onChange={handleInputChange} type="text" /></div>
                                <div className="form-group"><label>Status</label><select name="status" value={formState.status} onChange={handleInputChange}><option>Published</option><option>Draft</option><option>Completed</option><option>Archived</option></select></div>
                                <div className="form-group"><label>Register Link (Google Form, etc.)</label><input name="registerLink" value={formState.registerLink} onChange={handleInputChange} type="url" /></div>
                                <div className="form-group full-width"><label>Upload Poster/Brochure</label><input id="poster-input" type="file" onChange={(e)=>setPosterFile(e.target.files[0])} accept="image/*" required={!editingEvent} /></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Event'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-content-area">
                <div className="event-list">
                    {loading && events.length === 0 ? <p>Loading events...</p> : events.map(event => (
                        <div key={event.id} className="event-list-item">
                            <img src={event.posterUrl} alt={event.title} className="item-poster" />
                            <div className="item-details">
                                <p className="item-title">{event.title} <span className={`status-badge ${event.status?.toLowerCase()}`}>{event.status}</span></p>
                                <p className="item-date">{getSafeDate(event)}</p>
                            </div>
                            <div className="item-actions">
                                <button onClick={() => openModalForEdit(event)} className="action-btn edit" title="Edit"><EditIcon /></button>
                                <button onClick={() => setConfirmDelete(event.id)} className="action-btn delete" title="Delete"><TrashIcon /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}