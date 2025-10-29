import axiosClient from './axiosClient';

const postApi = {
    getAll: () => {
        const url = '/api/posts';
        return axiosClient.get(url);
    },
    create: (postData) => {
        const url = '/api/posts';
        return axiosClient.post(url, postData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default postApi;
