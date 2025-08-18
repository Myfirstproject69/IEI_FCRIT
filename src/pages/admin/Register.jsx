import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import './Register.css'; // Make sure to create and link this CSS file

// --- SVG Icons ---
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>;

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [registerCode, setRegisterCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
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

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const codesRef = collection(db, 'adminRegisterCodes'); 
            const q = query(codesRef, where('code', '==', registerCode));
            const codeSnapshot = await getDocs(q);

            if (codeSnapshot.empty) {
                throw new Error('Invalid Register Code.');
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'pendingAdmins', user.uid), {
                uid: user.uid, email: email, status: 'pending',
                role: 'admin', createdAt: serverTimestamp(),
            });

            setSuccess('Registration successful! Your account is now pending approval.');
            setEmail(''); setPassword(''); setRegisterCode('');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="background-shapes">
                <div className="shape shape1"></div>
                <div className="shape shape2"></div>
            </div>
            <div className="register-form-wrapper" ref={formRef}>
                <h2 className="form-title">Create Admin Account</h2>
                <form onSubmit={handleRegister} className="register-form">
                    <div className="input-group"><MailIcon /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required /></div>
                    <div className="input-group"><LockIcon /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min. 6 characters)" required /></div>
                    <div className="input-group"><KeyIcon /><input type="text" value={registerCode} onChange={(e) => setRegisterCode(e.target.value)} placeholder="Register Code" required /></div>
                    
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <button type="submit" disabled={loading} className="register-button">
                        {loading ? 'Processing...' : 'Register for Approval'}
                    </button>
                </form>
                <p className="login-link-text">
                    Already have an approved account?{' '}
                    <Link to="/login" className="login-link">Login Here</Link>
                </p>
                <p className="security-notice">
                    This registration is for authorized personnel only. Your account will undergo an approval process by a super administrator. Misuse of this portal will result in a permanent ban.
                </p>
            </div>
        </div>
    );
}