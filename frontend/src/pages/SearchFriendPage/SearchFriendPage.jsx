import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // Thêm useNavigate để chuyển trang
import axios from 'axios';
import Header from '../../components/Header/Header';       // Kiểm tra lại đường dẫn import
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'; // Kiểm tra lại đường dẫn import

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const navigate = useNavigate(); // Hook để chuyển trang

    // State lưu dữ liệu
    const [data, setData] = useState({ friends: [], strangers: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- STATE MỚI: Lưu trạng thái các user đã gửi lời mời ---
    // Dạng lưu trữ: { "userId_1": true, "userId_2": true }
    const [sentRequests, setSentRequests] = useState({});

    const token = localStorage.getItem('token');

    // Check localhost
    const API_BASE = window.location.hostname === "localhost"
        ? process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_LAN
        : process.env.REACT_APP_API_URL_LAN;

    useEffect(() => {
        if (!query) return;

        const fetchSearchResults = async () => {
            setIsLoading(true);
            setError(null);
            // Reset lại trạng thái gửi khi tìm kiếm mới
            setSentRequests({});

            try {
                const response = await axios.post(
                    `${API_BASE}/api/friends/search`,
                    { keyword: query },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                setData(response.data);
            } catch (err) {
                console.error("Lỗi tìm kiếm:", err);
                setError("Có lỗi xảy ra khi tìm kiếm.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [query, token, API_BASE]);

    // --- HÀM XỬ LÝ GỬI LỜI MỜI  ---
    const handleAddFriend = async (userId) => {
        // Đánh dấu userId này là đã gửi
        setSentRequests(prev => ({ ...prev, [userId]: true }));

        try {
            await axios.post(
                `${API_BASE}/api/friends/request/${userId}`,
                {},
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            console.log("Đã gửi lời mời thành công tới " + userId);

        } catch (err) {
            console.error("Lỗi gửi lời mời:", err);
            alert("Gửi lời mời thất bại: " + (err.response?.data?.message || err.message));

            // 2. Nếu lỗi, hoàn tác lại UI (cho nút sáng lại)
            setSentRequests(prev => {
                const newState = { ...prev };
                delete newState[userId];
                return newState;
            });
        }
    };

    // Hàm chuyển trang khi click vào user
    const goToProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };

    return (
        <div className="flex min-h-screen bg-[#f0f2f5]">
            <div className="fixed top-0 w-full z-50">
                <Header />
            </div>

            <div className="fixed top-[60px] left-0 h-full w-[360px] hidden md:block overflow-y-auto">
                <LeftSidebar />
            </div>

            <div className="flex-1 md:ml-[360px] mt-[80px] p-6 max-w-4xl">
                <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800">Kết quả tìm kiếm cho "{query}"</h2>
                </div>

                {isLoading && <div className="text-center py-10">Đang tải...</div>}
                {error && <div className="text-center py-10 text-red-500">{error}</div>}

                {!isLoading && !error && (
                    <>
                        {/* KHỐI BẠN BÈ */}
                        {data.friends && data.friends.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                                <h3 className="text-gray-600 font-semibold mb-3 text-sm uppercase tracking-wide">Bạn bè</h3>
                                <div className="space-y-4">
                                    {data.friends.map((user) => (
                                        <div
                                            key={user.ma_nguoi_dung}
                                            onClick={() => goToProfile(user.ma_nguoi_dung)}
                                            className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                                        >
                                            <img
                                                src={user.anh_dai_dien || 'https://via.placeholder.com/150'}
                                                alt={user.ten_hien_thi}
                                                className="w-20 h-20 rounded-full object-cover border border-gray-200"
                                            />
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900">{user.ten_hien_thi}</h4>
                                                <span className="text-sm text-gray-500 font-medium">Bạn bè</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* KHỐI NGƯỜI LẠ (XEM THÊM) */}
                        {data.strangers && data.strangers.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <h3 className="text-lg font-bold text-black mb-4">Xem thêm</h3>
                                <div className="space-y-2">
                                    {data.strangers.map((user) => {
                                        // Kiểm tra xem user này đã được bấm kết bạn chưa
                                        const isRequestSent = sentRequests[user.ma_nguoi_dung];

                                        return (
                                            <div key={user.ma_nguoi_dung} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
                                                <div
                                                    className="flex items-center gap-3 cursor-pointer"
                                                    onClick={() => goToProfile(user.ma_nguoi_dung)}
                                                >
                                                    <img
                                                        src={user.anh_dai_dien || 'https://via.placeholder.com/150'}
                                                        alt={user.ten_hien_thi}
                                                        className="w-14 h-14 rounded-full object-cover border border-gray-200"
                                                    />
                                                    <div>
                                                        <h4 className="text-[17px] font-semibold text-gray-900">{user.ten_hien_thi}</h4>
                                                        {user.song_o_dau && <p className="text-xs text-gray-500">{user.song_o_dau}</p>}
                                                    </div>
                                                </div>

                                                {/* Nút Thêm bạn bè */}
                                                <button
                                                    onClick={() => handleAddFriend(user.ma_nguoi_dung)}
                                                    disabled={isRequestSent} // Khóa nút nếu đã gửi
                                                    className={`
                                                        px-5 py-2 rounded-md text-sm font-semibold transition-colors
                                                        ${isRequestSent
                                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' // Style khi đã gửi
                                                            : 'bg-[#e7f3ff] hover:bg-[#d9ebff] text-[#0064d1]' // Style mặc định
                                                        }
                                                    `}
                                                >
                                                    {isRequestSent ? 'Đã gửi lời mời' : 'Thêm bạn bè'}
                                                </button>
                                                {/* ----------------------------- */}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* KHÔNG CÓ KẾT QUẢ */}
                        {(!data.friends?.length && !data.strangers?.length) && (
                            <div className="text-center py-10 text-gray-500">
                                Không tìm thấy kết quả nào.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchResults;