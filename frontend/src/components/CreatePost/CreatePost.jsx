import React, { useState } from 'react';
import axios from 'axios';
import './CreatePost.css';

const CreatePost = ({ onClose, onPostCreated }) => {
    const [noiDung, setNoiDung] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!noiDung) {
            setError('Please enter some content for your post.');
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
            onPostCreated(res.data); // Callback to refresh the post list
            onClose(); // Close the modal
        } catch (err) {
            setError('Failed to create post. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>Create Post</h2>
                <form onSubmit={handleSubmit}>
                    <textarea
                        placeholder="What's on your mind?"
                        value={noiDung}
                        onChange={(e) => setNoiDung(e.target.value)}
                    />
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {preview && <img src={preview} alt="Preview" className="image-preview" />}
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit">Post</button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;