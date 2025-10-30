import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useUserProfile = (userId) => {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProfileData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No authentication token found.');
            setIsLoading(false);
            return;
        }

        const isLocalhost = window.location.hostname === "localhost";
        const API_BASE = isLocalhost
            ? process.env.REACT_APP_API_URL
            : process.env.REACT_APP_API_URL_LAN;

        try {
            const response = await axios.get(`${API_BASE}/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileData(response.data);
        } catch (err) {
            setError('Failed to fetch profile data.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchProfileData();
        }
    }, [userId, fetchProfileData]);

    return { profileData, isLoading, error, setProfileData };
};

export default useUserProfile;
