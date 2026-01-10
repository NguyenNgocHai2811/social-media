import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './EditProfileModal.css';
import defaultAvatar from '../../assets/images/default-avatar.jpg';

const EditProfileModal = ({ user, onClose, onProfileUpdate }) => {
    // State for user profile fields
    const [tenHienThi, setTenHienThi] = useState(user?.ten_hien_thi || '');
    const [gioiThieu, setGioiThieu] = useState(user?.gioi_thieu || '');
    const [songODau, setSongODau] = useState(user?.song_o_dau || '');
    const [tinhTrangQuanHe, setTinhTrangQuanHe] = useState(user?.tinh_trang_quan_he || '');
    
    // State for file handling
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.anh_dai_dien);
    const [coverPreview, setCoverPreview] = useState(user?.anh_bia);

    // State for submission status
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Refs for file inputs
    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    // Effect for avatar preview
    useEffect(() => {
        if (!avatarFile) {
            setAvatarPreview(user?.anh_dai_dien || defaultAvatar);
            return;
        }
        const objectUrl = URL.createObjectURL(avatarFile);
        setAvatarPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [avatarFile, user?.anh_dai_dien]);

    // Effect for cover photo preview
    useEffect(() => {
        if (!coverFile) {
            setCoverPreview(user?.anh_bia);
            return;
        }
        const objectUrl = URL.createObjectURL(coverFile);
        setCoverPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [coverFile, user?.anh_bia]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const formData = new FormData();
        // Append text fields if they have changed
        if (tenHienThi !== user.ten_hien_thi) formData.append('ten_hien_thi', tenHienThi);
        if (gioiThieu !== user.gioi_thieu) formData.append('gioi_thieu', gioiThieu);
        if (songODau !== user.song_o_dau) formData.append('song_o_dau', songODau);
        if (tinhTrangQuanHe !== user.tinh_trang_quan_he) formData.append('tinh_trang_quan_he', tinhTrangQuanHe);
        
        // Append files if they have been selected
        if (avatarFile) formData.append('avatar', avatarFile);
        if (coverFile) formData.append('anh_bia', coverFile);
        
        // If nothing has changed, just close the modal.
        if ([...formData.entries()].length === 0) {
            onClose();
            return;
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
            <div className="modal-content" /*onClick={e => e.stopPropagation()}*/>
                <div className="modal-header">
                    <h2>Chỉnh sửa trang cá nhân</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    {/* Cover Photo Upload */}
                    <div className="form-group">
                        <label>Ảnh bìa</label>
                        <div className="cover-photo-upload">
                            {coverPreview && <img src={coverPreview} alt="Cover Preview" className="cover-photo-preview" />}
                            <button type="button" onClick={() => coverInputRef.current.click()}>Chỉnh sửa</button>
                            <input
                                type="file"
                                accept="image/*"
                                ref={coverInputRef}
                                style={{ display: 'none' }}
                                onChange={(e) => setCoverFile(e.target.files[0])}
                            />
                        </div>
                    </div>
                    
                    {/* Avatar Upload */}
                    <div className="form-group">
                        <label>Ảnh đại diện</label>
                        <div className="avatar-upload">
                            <img src={avatarPreview} alt="Avatar Preview" className="avatar-preview" onClick={() => avatarInputRef.current.click()}/>
                            <input
                                type="file"
                                accept="image/*"
                                ref={avatarInputRef}
                                style={{ display: 'none' }}
                                onChange={(e) => setAvatarFile(e.target.files[0])}
                            />
                        </div>
                    </div>

                    {/* Text Inputs */}
                    <div className="form-group">
                        <label htmlFor="tenHienThi">Tên hiển thị</label>
                        <input id="tenHienThi" type="text" value={tenHienThi} onChange={(e) => setTenHienThi(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gioiThieu">Tiểu sử</label>
                        <textarea id="gioiThieu" value={gioiThieu} onChange={(e) => setGioiThieu(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="songODau">Sống tại</label>
                        <input id="songODau" type="text" value={songODau} onChange={(e) => setSongODau(e.target.value)} />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="tinhTrangQuanHe">Tình trạng quan hệ</label>
                        <input id="tinhTrangQuanHe" type="text" value={tinhTrangQuanHe} onChange={(e) => setTinhTrangQuanHe(e.target.value)} />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="form-actions">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="cancel-btn">
                            Hủy
                        </button>
                        <button type="submit" disabled={isSubmitting} className="save-btn">
                            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
