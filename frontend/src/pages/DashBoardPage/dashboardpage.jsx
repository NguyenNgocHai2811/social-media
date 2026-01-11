import React, { useState, useEffect } from 'react';
import './dashboardpage.css';
import axios from 'axios';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [growthData, setGrowthData] = useState([]);
    const [interactionData, setInteractionData] = useState([]);
    const [timeRange, setTimeRange] = useState('month'); // 'month' hoặc 'year'

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const isLocalhost = window.location.hostname === "localhost";
                const API_BASE = isLocalhost
                        ? process.env.REACT_APP_API_URL
                        : process.env.REACT_APP_API_URL_LAN;
                

                const response = await axios.get(`${API_BASE}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    const data = response.data.data;
                    setStats({
                        tongNguoiDung: data.tongNguoiDung,
                        tongBaiDang: data.tongBaiDang,
                        nguoiDungMoi: data.nguoiDungMoi,
                        tongLuotTuongTac: data.interactionDetail.total,
                    });
                    // Dữ liệu tương tác (Like vs Comment)
                    setInteractionData([ 
                        { name: 'Lượt thích', value: data.interactionDetail.likes, color: '#FF6B6B' },
                        { name: 'Lượt comment', value: data.interactionDetail.comments, color: '#4ECDC4' }
                    ]);

                    if (data.growthChart && data.growthChart.length > 0) {
                    const realGrowthData = data.growthChart.map(item => ({
                        name: item.date, // Trục hoành là ngày
                        users: item.count // Trục tung là số lượng
                    }));
                    setGrowthData(realGrowthData);
                    } else {
                        // Nếu không có dữ liệu (ví dụ web mới tinh chưa có ai đk), để mảng rỗng
                        setGrowthData([]); 
                    }
                } else {
                    setError('Không thể lấy dữ liệu thống kê');
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
                setError('Lỗi khi tải dữ liệu. ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [timeRange]);

    return (
        <>
            <div className="dashboard-container">
                <main className="dashboard-content">
                    <div className="dashboard-header">
                        <h1>Dashboard Quản Lý</h1>
                        <p>Thống kê và quản lý hệ thống</p>
                    </div>

                    {loading && (
                        <div className="loading-message">
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="error-message">
                            <p>{error}</p>
                        </div>
                    )}

                    {stats && !loading && (
                        <div className="stats-grid">
                            {/* Thẻ thống kê tổng người dùng */}
                            <div className="stat-card">
                                <div className="stat-icon users">👥</div>
                                <div className="stat-info">
                                    <h3>Tổng Người Dùng</h3>
                                    <p className="stat-number">{stats.tongNguoiDung}</p>
                                    <span className="stat-label">người dùng</span>
                                </div>
                            </div>

                            {/* Thẻ thống kê tổng bài đăng */}
                            <div className="stat-card">
                                <div className="stat-icon posts">📝</div>
                                <div className="stat-info">
                                    <h3>Tổng Bài Đăng</h3>
                                    <p className="stat-number">{stats.tongBaiDang}</p>
                                    <span className="stat-label">bài đăng</span>
                                </div>
                            </div>

                            {/* Thẻ thống kê tương tác */}
                            <div className="stat-card">
                                <div className="stat-icon interactions">💬</div>
                                <div className="stat-info">
                                    <h3>Tổng Tương Tác</h3>
                                    <p className="stat-number">{stats.tongLuotTuongTac}</p>
                                    <span className="stat-label">lượt tương tác</span>
                                </div>
                            </div>

                            {/* Thẻ thống kê người dùng mới */}
                            <div className="stat-card">
                                <div className="stat-icon new-users">⭐</div>
                                <div className="stat-info">
                                    <h3>Người Dùng Mới (30 ngày)</h3>
                                    <p className="stat-number">{stats.nguoiDungMoi}</p>
                                    <span className="stat-label">người dùng mới</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Phần mở rộng cho các tính năng khác */}
                    <div className="dashboard-charts">
                        {/* Biểu đồ tăng trưởng người dùng */}
                        <section className="chart-section">
                            <div className="chart-header">
                                <h2>Tăng Trưởng Người Dùng (30 ngày gần nhất)</h2>
                               
                            </div>
                            {growthData.length > 0 && (
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={growthData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis 
                                            dataKey="name" 
                                            interval={0}
                                            tick={{ fontSize: 11 }}
                                            // angle={-45}
                                            height={60}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#fff',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px'
                                            }}
                                        />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="users" 
                                            stroke="#1976D2" 
                                            strokeWidth={3}
                                            dot={false}
                                            activeDot={{ r: 6 }}
                                            name="Người dùng mới"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </section>

                        {/* Biểu đồ phân loại tương tác */}
                        <section className="chart-section">
                            <div className="chart-header">
                                <h2>Phân Loại Tương Tác</h2>
                            </div>
                            {interactionData.length > 0 && (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                                        <Pie
                                            data={interactionData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true} // Giữ đường kẻ nối
                                            outerRadius={80} // Kích thước bánh vừa phải
                                            fill="#8884d8"
                                            dataKey="value"
                                            // Custom nội dung Label: Tên + Số lượng
                                            label={({ value }) => `${value}`}
                                        >
                                            {interactionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value) => `${value} lượt`}
                                            contentStyle={{ 
                                                backgroundColor: '#fff',
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                border: 'none'
                                            }}
                                        />
                                        {/* Đưa chú thích xuống dưới đáy để mở rộng chiều ngang cho biểu đồ */}
                                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
};

export default DashboardPage;
