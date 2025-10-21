import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditProfileModal.css';

const EditProfileModal = ({ user, onClose, onProfileUpdate }) => {
    const [tenHienThi, setTenHienThi] = useState(user.ten_hien_thi);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(user.anh_dai_dien);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!selectedFile) {
            setPreview(user.anh_dai_dien);
            return;
        }
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile, user.anh_dai_dien]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('ten_hien_thi', tenHienThi);
        if (selectedFile) {
            formData.append('avatar', selectedFile);
        }

        const token = localStorage.getItem('token');

        try {
            const res = await axios.put('http://localhost:3001/api/users/me', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            onProfileUpdate(res.data);
            onClose();
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Edit Profile</h2>
                <form onSubmit={handleSubmit}>
                    <div className="avatar-upload">
                        <label htmlFor="avatar-input">
                            <img src={preview} alt="Preview" className="avatar-preview" />
                        </label>
                        <input
                            id="avatar-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tenHienThi">Display Name</label>
                        <input
                            id="tenHienThi"
                            type="text"
                            value={tenHienThi}
                            onChange={(e) => setTenHienThi(e.target.value)}
                        />
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}

                    <div className="form-actions">
                        <button type="button" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
