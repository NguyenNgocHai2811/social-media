import axiosClient from './axiosClient';

const authApi = {
    login: (credentials) => {
        const url = '/api/auth/login';
        return axiosClient.post(url, credentials);
    },
};

export default authApi;
