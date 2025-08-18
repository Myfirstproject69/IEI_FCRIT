import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import './Gallery.css'; // Make sure to create and link this CSS file

// --- Modal Component for Image Gallery ---
const ImageModal = ({ imageUrl, onClose }) => (
    <div className="image-modal-backdrop" onClick={onClose}>
        <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={imageUrl} alt="Enlarged gallery" className="enlarged-image" />
            <button onClick={onClose} className="close-modal-btn">&times;</button>
        </div>
    </div>
);

// --- Album Component ---
const Album = ({ album, setModalImage }) => {
    const albumDate = album.createdAt?.toDate();
    const formattedDate = albumDate ? albumDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }) : 'Date not available';

    return (
        <section className="album-section">
            <h2 className="album-title">{album.albumTitle}</h2>
            <p className="album-date">{formattedDate}</p>
            <div className="photo-grid">
                {album.photoUrls.map((url, index) => (
                    <div key={index} className="photo-wrapper" onClick={() => setModalImage(url)}>
                        <img src={url} alt={`${album.albumTitle} photo ${index + 1}`} className="photo-thumbnail" />
                    </div>
                ))}
            </div>
        </section>
    );
};

// --- Skeleton Loader ---
const GallerySkeleton = () => (
    <div className="gallery-container">
        <header className="page-header">
            <div className="skeleton skeleton-title"></div>
        </header>
        <div className="album-section">
            <div className="skeleton skeleton-subtitle"></div>
            <div className="photo-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton skeleton-photo"></div>
                ))}
            </div>
        </div>
    </div>
);

export default function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const albumsQuery = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const albumsSnap = await getDocs(albumsQuery);
        setAlbums(albumsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching gallery albums:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  if (loading) return <GallerySkeleton />;

  return (
    <>
        <div className="gallery-container">
            <header className="page-header">
                <h1 className="page-title">Gallery</h1>
                <p className="page-subtitle">A visual journey through our events, visits, and achievements.</p>
            </header>
            <div className="albums-wrapper">
                {albums.map(album => (
                    <Album key={album.id} album={album} setModalImage={setModalImage} />
                ))}
            </div>
        </div>
        {modalImage && <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
    </>
  );
}