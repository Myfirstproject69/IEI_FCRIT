import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './Events.css'; // Make sure to create and link this CSS file

// --- SVG Icon Components ---
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
const UserCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
);
const DollarSignIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);
const AwardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88"></polyline></svg>
);
const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
);
// ** NEW REGISTER ICON **
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);


// --- Helper function to handle different date formats ---
const getSafeDate = (dateTimeValue) => {
    if (!dateTimeValue) return null;
    if (typeof dateTimeValue.toDate === 'function') {
        return dateTimeValue.toDate();
    }
    return new Date(dateTimeValue);
};

// --- Event Card Component ---
const EventCard = ({ event }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const eventDate = getSafeDate(event.dateTime);
    
    const formattedDate = eventDate ? eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
    const formattedTime = eventDate ? eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

    return (
        <div className="event-card">
            <div className="event-card-poster-wrapper">
                <img src={event.posterUrl} alt={event.title} className="event-card-poster" />
                <div className="poster-overlay"></div>
                <span className="event-type-badge">{event.type}</span>
            </div>
            <div className="event-card-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>
                
                <div className={`expanded-details ${isExpanded ? 'expanded' : ''}`}>
                    <div className="event-info-item"><CalendarIcon /><span>{formattedDate} at {formattedTime}</span></div>
                    <div className="event-info-item"><MapPinIcon /><span>{event.venue}</span></div>
                    <div className="event-info-item"><UserCheckIcon /><span><strong>Eligibility:</strong> {event.eligibility}</span></div>
                    <div className="event-info-item"><AwardIcon /><span><strong>Faculty:</strong> {event.facultyInCharge}</span></div>
                    {event.speaker && <div className="event-info-item"><MicIcon /><span><strong>Speaker:</strong> {event.speaker}</span></div>}
                    <div className="event-info-item"><DollarSignIcon /><span><strong>Fee:</strong> {event.feeType === 'Paid' ? `₹${event.feeAmount}` : 'Free'}</span></div>
                </div>

                <div className="event-card-footer">
                    {/* ** NEW REGISTER BUTTON ** */}
                    {event.registerLink && (
                        <a href={event.registerLink} target="_blank" rel="noopener noreferrer" className="register-btn">
                            <EditIcon />
                            Register Now
                        </a>
                    )}
                    <button onClick={() => setIsExpanded(!isExpanded)} className="details-toggle-btn">
                        {isExpanded ? 'Less' : 'More'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Skeleton Loader for Events ---
const EventCardSkeleton = () => (
    <div className="event-card-skeleton">
        <div className="skeleton skeleton-poster"></div>
        <div className="skeleton-content">
            <div className="skeleton skeleton-title-sm"></div>
            <div className="skeleton skeleton-text"></div>
        </div>
    </div>
);

export default function Events() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsSnap = await getDocs(collection(db, 'events'));
        const allEvents = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const now = new Date();
        const publishedAndCompleted = allEvents.filter(event => 
          event.status === 'Published' || event.status === 'Completed'
        );

        const upcoming = publishedAndCompleted.filter(event => getSafeDate(event.dateTime) >= now);
        const past = publishedAndCompleted.filter(event => getSafeDate(event.dateTime) < now);

        setUpcomingEvents(upcoming.sort((a, b) => getSafeDate(a.dateTime) - getSafeDate(b.dateTime)));
        setPastEvents(past.sort((a, b) => getSafeDate(b.dateTime) - getSafeDate(a.dateTime)));
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
        <div className="events-container">
            <header className="page-header">
                <h1 className="page-title">Events & Workshops</h1>
            </header>
            <div className="events-grid">
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
            </div>
        </div>
    );
  }

  return (
    <div className="events-container">
        <header className="page-header">
            <h1 className="page-title">Events & Workshops</h1>
            <p className="page-subtitle">Join us for our exciting lineup of technical and professional events.</p>
        </header>

        <section id="upcoming-events" className="events-section">
            <h2 className="section-title">Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
                <div className="events-grid">
                    {upcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
                </div>
            ) : (
                <p className="empty-text">No upcoming events scheduled at the moment. Please check back soon!</p>
            )}
        </section>

        <section id="past-events" className="events-section">
            <h2 className="section-title past">Past Events</h2>
            {pastEvents.length > 0 ? (
                <div className="events-grid">
                    {pastEvents.map(event => <EventCard key={event.id} event={event} />)}
                </div>
            ) : (
                <p className="empty-text">No past events to show.</p>
            )}
        </section>
    </div>
  );
}