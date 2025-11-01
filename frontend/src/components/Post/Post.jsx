import React from 'react';
import {Link} from 'react-router-dom';
import heartIcon from '../../assets/images/heart.svg';
import commentIcon from '../../assets/images/comment.svg';
import ShareIcon from '../../assets/images/share.svg';
import defaultAvatar from '../../assets/images/default-avatar.jpg';

const Post = ({ post }) => {
    const { user, noi_dung, media, ngay_tao, so_luot_thich, so_luot_binh_luan } = post;

    const renderMedia = () => {
        if (!media || !media.duong_dan) return null;
        return <img src={media.duong_dan} alt="Post content" className="w-full block" />;
    };

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
                            <img src={heartIcon} alt="heart" className="w-5 h-5" />
                            <span>{so_luot_thich || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-6">
                            <img src={commentIcon} alt="comment" className="w-5 h-5" />
                            <span>{so_luot_binh_luan || 0}</span>
                        </div>
                    </div>
                </div>

            </div>
            <div className="p-4">
                {noi_dung && <p className="text-gray-700 leading-relaxed mb-4">{noi_dung}</p>}
            </div>



            <div className="border-t border-gray-200 flex justify-around py-1">
                <button className="flex-1 text-center py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-md transition-all">Like</button>
                <button className="flex-1 text-center py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-md transition-all">Comment</button>
                <button className="flex-1 text-center py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-md transition-all">Share</button>
            </div>

            <div className="border-t border-gray-200 p-3">
                <input type="text" placeholder="Viết bình luận..." className="w-full border-none rounded-full bg-gray-100 py-2 px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-blue-300" />
            </div>
        </div>
    );
};

export default Post;