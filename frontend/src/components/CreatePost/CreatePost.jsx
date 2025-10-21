import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreatePost.css';

const CreatePost = ({ onClose, onPostCreated }) => {
    const [noiDung, setNoiDung] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await axios.get('http://localhost:3001/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
            } catch (err) {
                console.error('Failed to fetch user data', err);
            }
        };
        fetchUser();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!noiDung && !image) {
            setError('Please add some content or an image to your post.');
            return;
        }

        const formData = new FormData();
        formData.append('noi_dung', noiDung);
        if (image) {
            formData.append('image', image);
        }

        const token = localStorage.getItem('token');

        try {
            const res = await axios.post('http://localhost:3001/api/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            onPostCreated(res.data);
            onClose();
        } catch (err) {
            setError('Failed to create post. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Tạo bài viết</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {user && (
                        <div className="user-info">
                            <img src={user.anh_dai_dien || 'default-avatar.png'} alt="avatar" className="user-avatar-post" />
                            <span>{user.ten_hien_thi}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <textarea
                            placeholder="Nhập nội dung"
                            value={noiDung}
                            onChange={(e) => setNoiDung(e.target.value)}
                        />
                        <div className="add-image-container">
                            <label htmlFor="image-upload" className="add-image-button">
                                ⊕ Chọn ảnh
                            </label>
                            <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} />
                        </div>
                        {preview && (
                            <div className="image-preview-container">
                                <h4>Ảnh đã chọn</h4>
                                <img src={preview} alt="Preview" className="image-preview" />
                            </div>
                        )}
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="submit-button">Đăng</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;