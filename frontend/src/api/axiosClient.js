import axios from 'axios';

const getApiUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return process.env.REACT_APP_API_URL;
    } else {
        return process.env.REACT_APP_API_URL_LAN;
    }
};

const axiosClient = axios.create({
    baseURL: getApiUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add the token to requests
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to handle responses
axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Here you can handle errors globally
        console.error('API call error:', error.response || error.message);
        // For example, you could trigger a notification
        // alert('An error occurred. Please try again.');
        return Promise.reject(error);
    }
);

export default axiosClient;
