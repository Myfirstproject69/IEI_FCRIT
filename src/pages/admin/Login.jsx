import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import './Login.css'; // Make sure to create and link this CSS file

// --- SVG Icons ---
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const formRef = useRef(null);

    useEffect(() => {
        const form = formRef.current;
        if (!form) return;

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const moveX = (clientX - innerWidth / 2) / (innerWidth / 2) * -5;
            const moveY = (clientY - innerHeight / 2) / (innerHeight / 2) * -5;
            form.style.transform = `perspective(1000px) rotateX(${moveY}deg) rotateY(${moveX}deg)`;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const adminDocRef = doc(db, 'admins', user.uid);
            const adminDocSnap = await getDoc(adminDocRef);

            if (adminDocSnap.exists()) {
                navigate('/admin/dashboard');
            } else {
                await auth.signOut();
                throw new Error('Your account is not approved. Please contact an administrator.');
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="background-shapes">
                <div className="shape shape1"></div>
                <div className="shape shape2"></div>
            </div>
            <div className="login-form-wrapper" ref={formRef}>
                <h2 className="form-title">Admin Portal</h2>
                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <MailIcon />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                    </div>
                    <div className="input-group">
                        <LockIcon />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" disabled={loading} className="login-button">
                        {loading ? 'Verifying...' : 'Login'}
                    </button>
                </form>
                <p className="register-link-text">
                    Need an account?{' '}
                    <Link to="/register" className="register-link">
                        Register for Approval
                    </Link>
                </p>
                <p className="security-notice">
                    This is a restricted area for authorized personnel only. All activities are monitored.
                </p>
            </div>
        </div>
    );
}