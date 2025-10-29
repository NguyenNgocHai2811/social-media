import axiosClient from './axiosClient';

const userApi = {
    getProfile: (userId) => {
        const url = `/api/users/${userId}`;
        return axiosClient.get(url);
    },
    getMe: () => {
        const url = '/api/users/me';
        return axiosClient.get(url);
    },
    updateProfile: (userData) => {
        const url = '/api/users/me';
        return axiosClient.put(url, userData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default userApi;
