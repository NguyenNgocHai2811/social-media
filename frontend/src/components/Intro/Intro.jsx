import React from 'react';
import { FaHome, FaHeart } from 'react-icons/fa';
import './Intro.css';

const Intro = ({ user }) => {
    return (
        <div className="intro-container">
            <h2>Giới thiệu</h2>
            {user.gioi_thieu && <p className="bio">{user.gioi_thieu}</p>}
            <ul>
                {user.song_o_dau && (
                    <li>
                        <FaHome className="icon" />
                        <span>Sống tại <strong>{user.song_o_dau}</strong></span>
                    </li>
                )}
                {user.tinh_trang_quan_he && (
                    <li>
                        <FaHeart className="icon" />
                        <span> {user.tinh_trang_quan_he}</span>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default Intro;
