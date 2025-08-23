import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToCloudinary } from '../../utils/cloudinary';
import './ManageEvents.css';

// --- SVG Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

// --- Initial Form State ---
const initialFormState = {
    title: '', type: 'Workshop', date: '', eventTime: '', venue: '',
    eligibility: '', feeType: 'Free', feeAmount: '',
    description: '', facultyInCharge: '', status: 'Published',
    speaker: '',
};

export default function ManageEvents() {
    const [formState, setFormState] = useState(initialFormState);
    const [posterFile, setPosterFile] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const resetForm = () => {
        setFormState(initialFormState);
        setPosterFile(null);
        const fileInput = document.getElementById('poster-input');
        if (fileInput) fileInput.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!posterFile) {
            showNotification('Please select a poster/brochure.', 'error');
            return;
        }
        setLoading(true);

        try {
            const posterUrl = await uploadToCloudinary(posterFile);
            const dateTime = new Date(`${formState.date}T${formState.eventTime}`);
            
            await addDoc(eventsCollectionRef, {
                ...formState,
                dateTime: dateTime,
                feeAmount: formState.feeType === 'Paid' ? formState.feeAmount : '0',
                posterUrl,
                createdAt: serverTimestamp(),
            });
            resetForm();
            fetchEvents();
            setIsModalOpen(false);
            showNotification('Event added successfully!', 'success');
        } catch (err) {
            showNotification('Failed to add event.', 'error');
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

    // ** NEW HELPER FUNCTION TO FORMAT DATES SAFELY **
    const getSafeDate = (event) => {
        if (!event.dateTime) return 'No date specified';
        // Check if it's a Firestore Timestamp
        if (typeof event.dateTime.toDate === 'function') {
            return event.dateTime.toDate().toLocaleString();
        }
        // Otherwise, assume it's a string or number and try to parse it
        return new Date(event.dateTime).toLocaleString();
    };

    return (
        <div className="admin-page-container">
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

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
                <button type="button" className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <PlusIcon /> Add New Event
                </button>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit} className="event-form">
                            <div className="modal-header">
                                <h3>Add New Event</h3>
                                <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
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
                                <div className="form-group full-width"><label>Upload Poster/Brochure</label><input id="poster-input" type="file" onChange={(e)=>setPosterFile(e.target.files[0])} accept="image/*" required /></div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Add Event'}</button>
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
                                {/* ** THIS LINE IS NOW FIXED ** */}
                                <p className="item-date">{getSafeDate(event)}</p>
                            </div>
                            <button onClick={() => setConfirmDelete(event.id)} className="delete-btn">
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}