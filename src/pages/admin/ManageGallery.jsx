import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToCloudinary } from '../../utils/cloudinary';
import './ManageGallery.css'; // Make sure to create and link this CSS file

// --- SVG Icons ---
const PlusIcon = () => <svg xmlns="http://www.w.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const StarIcon = ({ isFeatured }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isFeatured ? "#facc15" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

// --- Initial Form State ---
const initialFormState = { albumTitle: '', eventTag: 'Workshop', caption: '' };

export default function ManageGallery() {
    const [formState, setFormState] = useState(initialFormState);
    const [photoFiles, setPhotoFiles] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);

    const galleryCollectionRef = collection(db, 'gallery');

    const fetchAlbums = async () => {
        setLoading(true);
        const albumsQuery = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const data = await getDocs(albumsQuery);
        setAlbums(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        setLoading(false);
    };

    useEffect(() => { fetchAlbums(); }, []);

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
        setPhotoFiles([]);
        const fileInput = document.getElementById('photos-input');
        if (fileInput) fileInput.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (photoFiles.length === 0) {
            showNotification('Please select at least one photo.', 'error');
            return;
        }
        setLoading(true);

        try {
            const photoUploadPromises = Array.from(photoFiles).map(file => uploadToCloudinary(file));
            const photoUrls = await Promise.all(photoUploadPromises);

            await addDoc(galleryCollectionRef, {
                ...formState,
                photoUrls,
                featuredImageUrl: photoUrls[0],
                createdAt: serverTimestamp(),
            });

            resetForm();
            fetchAlbums();
            setIsModalOpen(false);
            showNotification('Album created successfully!', 'success');
        } catch (err) {
            showNotification('Failed to create album.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setConfirmDelete(null);
        try {
            await deleteDoc(doc(db, 'gallery', id));
            fetchAlbums();
            showNotification('Album deleted successfully.', 'success');
        } catch (err) {
            showNotification('Failed to delete album.', 'error');
        }
    };

    const setFeaturedImage = async (albumId, imageUrl) => {
        try {
            const albumDoc = doc(db, 'gallery', albumId);
            await updateDoc(albumDoc, { featuredImageUrl: imageUrl });
            fetchAlbums();
            showNotification('Featured image updated.', 'success');
        } catch (err) {
            showNotification('Failed to set featured image.', 'error');
        }
    };

    return (
        <div className="admin-page-container">
            {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            {confirmDelete && (
                <div className="confirmation-modal-backdrop">
                    <div className="confirmation-modal">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this entire album?</p>
                        <div className="modal-actions">
                            <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="admin-header">
                <h2>Manage Gallery</h2>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <PlusIcon /> Create New Album
                </button>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit} className="gallery-form">
                            <div className="modal-header"><h3>Create New Album</h3><button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button></div>
                            <div className="form-grid">
                                <div className="form-group"><label>Album Title</label><input name="albumTitle" type="text" value={formState.albumTitle} onChange={handleInputChange} required /></div>
                                <div className="form-group"><label>Event Tag</label><select name="eventTag" value={formState.eventTag} onChange={handleInputChange}><option>Workshop</option><option>Visit</option><option>Seminar</option><option>Competition</option><option>Celebration</option></select></div>
                                <div className="form-group full-width"><label>Caption (Optional)</label><input name="caption" type="text" value={formState.caption} onChange={handleInputChange} /></div>
                                <div className="form-group full-width"><label>Upload Photos (multiple allowed)</label><input id="photos-input" type="file" onChange={(e) => setPhotoFiles(e.target.files)} accept="image/*" multiple required /></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Uploading...' : 'Create Album'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-content-area">
                <div className="album-list">
                    {loading && albums.length === 0 ? <p>Loading albums...</p> : albums.map(album => (
                        <div key={album.id} className="album-card">
                            <div className="album-header">
                                <div className="album-info">
                                    <h4 className="album-title">{album.albumTitle}</h4>
                                    <p className="album-tag">{album.eventTag}</p>
                                </div>
                                <button onClick={() => setConfirmDelete(album.id)} className="delete-btn" title="Delete Album"><TrashIcon /></button>
                            </div>
                            <div className="album-photo-grid">
                                {album.photoUrls.map((url, index) => (
                                    <div key={index} className="photo-thumbnail-wrapper">
                                        <img src={url} alt={`Photo ${index + 1}`} className="photo-thumbnail" />
                                        <div className="photo-overlay">
                                            <button onClick={() => setFeaturedImage(album.id, url)} className="feature-btn" title="Set as Featured">
                                                <StarIcon isFeatured={url === album.featuredImageUrl} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}