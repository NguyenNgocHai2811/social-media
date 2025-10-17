import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Header = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found');
                return;
            }

            try {
                const res = await axios.get('http://localhost:3001/api/users/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUser(res.data);
            } catch (err) {
                setError('Failed to fetch user data');
                console.error(err);
            }
        };

        fetchUser();
    }, []);

    if (error) {
        return <header><div>Error: {error}</div></header>;
    }

    if (!user) {
        return <header><div>Loading...</div></header>;
    }

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc' }}>
            <div>
                <h2>ConnectF</h2>
            </div>
            <div>
                <span>{user.ten_hien_thi}</span>
                <img src={user.anh_dai_dien || 'default-avatar.png'} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', marginLeft: '1rem' }} />
            </div>
        </header>
    );
};

export default Header;