import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import heartIcon from '../../assets/images/heart.svg';
import commentIcon from '../../assets/images/comment.svg';
import defaultAvatar from '../../assets/images/default-avatar.jpg';
import CommentList from '../Comment/CommentList';
import axios from 'axios';
const Post = ({ post }) => {
    // like
    const [liked, setLiked] = useState(post.da_like);
    const [likeCount, setLikeCount] = useState(post.so_luot_like || 0);
    const [isLiking, setIsLiking] = useState(false);
    const API_BASE = process.env.REACT_APP_API_URL;
    const [showComments, setShowComments] = useState(false);
    const [countComment, setCountComment] = useState(post.so_luot_binh_luan || 0);
    const { user, noi_dung, media, ngay_tao, so_luot_thich } = post;
    const renderMedia = () => {
        if (!media || !media.duong_dan) return null;
        return <img src={media.duong_dan} alt="Post content" className="w-full block" />;
    };

    const toggleComments = () => {
        setShowComments(!showComments);
    }
    // Hàm callback để cập nhật số lượng bình luận từ CommentList
    const handleCommentCountChange = (newCount) => {
        setCountComment(newCount);
    };
    // sự kiện like 
    const handleLike = async () => {
        // 1. CHẶN SPAM: Nếu đang xử lý request trước đó thì dừng ngay, không cho bấm tiếp
        if (isLiking) return;

        setIsLiking(true); // Bắt đầu khóa nút

        try {
            const token = localStorage.getItem('token');
            // 3. Gọi API
            const res = await axios.post(
                `${API_BASE}/api/posts/${post.ma_bai_dang}/like`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setLiked(res.data.liked);
                setLikeCount(res.data.likeCount);
            }

        } catch (error) {
            console.log("Error like", error);
            // Nếu lỗi thì revert (trả lại trạng thái cũ)
            setLiked(!liked);
            setLikeCount(liked ? likeCount : likeCount); // Reset về cũ
        } finally {
            setIsLiking(false); // Mở khóa nút
        }
    }

    const isImageMedia = media && media.loai === 'anh' && media.duong_dan;
    const userName = user ? user.ten_hien_thi : 'Người dùng ẩn danh';
    const userAvatar = user && user.anh_dai_dien ? user.anh_dai_dien : defaultAvatar;

    return (
        <div className="bg-white rounded-lg shadow-md my-4 border border-gray-200">
            {isImageMedia && (
                <div className="border-t border-gray-200">
                    {renderMedia()}
                </div>
            )}
            <div className="flex items-center mb-4 justify-between">

                <div className="ml-3 flex mt-6 ">
                    <Link to={`/profile/${user?.ma_nguoi_dung}`}>
                        <img src={userAvatar} alt="user avatar" className="w-11 h-11 rounded-full object-cover" />
                    </Link>
                    <div className="pl-2">
                        <Link to={`/profile/${user?.ma_nguoi_dung}`}>
                            <span className="font-semibold text-base text-gray-800 hover:underline">{userName}</span>
                        </Link>
                        <span className="block text-sm text-gray-500">{new Date(ngay_tao).toLocaleString()}</span>
                    </div>
                </div>
                <div className="px-4 py-2 text-center">
                    <div className="flex justify-between items-center text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <img src={heartIcon} alt="like" className="w-5 h-5" />
                            <span >{likeCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-6">
                            <img src={commentIcon} alt="comment" className="w-5 h-5" />
                            <span>{countComment || 0}</span>
                        </div>
                    </div>
                </div>

            </div>
            <div className="p-4">
                {noi_dung && <p className="text-gray-700 leading-relaxed mb-4">{noi_dung}</p>}
            </div>
            <div className="border-t border-gray-200 flex justify-around py-1">
                <button
                    onClick={handleLike}
                    disabled={isLiking} // Disable nút khi đang like
                    className={`flex-1 flex items-center justify-center gap-2 text-center py-2 font-medium rounded-md transition-all 
                    ${liked ? 'text-red-500 bg-red-50' : 'text-gray-700 hover:bg-gray-100'}
                    ${isLiking ? 'opacity-50 cursor-not-allowed' : ''} 
                `}
                >
                    {liked ? "Liked" : "Like"}
                </button>
                <button onClick={toggleComments} className='flex-1 text-center py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-md transition-all'>Comment</button>
                <button className="flex-1 text-center py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-md transition-all">Share</button>
            </div>
            {showComments && (
                <div className="border-t border-gray-200">
                    <CommentList postId={post.ma_bai_dang}
                        onCommentCountChange={handleCommentCountChange}
                        initialCommentCount={countComment} />
                </div>
            )}
        </div>
    );
};

export default Post; 