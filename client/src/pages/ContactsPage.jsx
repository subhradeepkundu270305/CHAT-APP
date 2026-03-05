import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ContactsPage = () => {
    const navigate = useNavigate();

    // Redirect to the new home page which now handles chat
    useEffect(() => {
        navigate('/', { replace: true });
    }, [navigate]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white/50">
            <p>Redirecting to chat...</p>
        </div>
    );
};

export default ContactsPage;
