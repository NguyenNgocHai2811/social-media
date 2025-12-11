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
                
                // Nếu chưa có token, dùng dữ liệu test
                if (!token) {
                    console.log('No token found, using test data');
                    const testData = {
                        tongNguoiDung: 1250,
                        tongBaiDang: 3450,
                        tongLuotTuongTac: 12500,
                        nguoiDungMoi: 85
                    };
                    setStats(testData);
                    setInteractionData([
                        { name: 'Like', value: Math.floor(testData.tongLuotTuongTac * 0.6), color: '#FF6B6B' },
                        { name: 'Comment', value: Math.floor(testData.tongLuotTuongTac * 0.4), color: '#4ECDC4' }
                    ]);
                    setLoading(false);
                    return;
                }

                const isLocalhost = window.location.hostname === "localhost";
                const API_BASE = isLocalhost
                    ? process.env.REACT_APP_API_URL
                    : process.env.REACT_APP_API_URL_LAN;

                const response = await axios.get(`${API_BASE}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setStats(response.data.data);
                    // Dữ liệu tương tác (Like vs Comment)
                    setInteractionData([ 
                        { name: 'Like', value: Math.floor(response.data.data.tongLuotTuongTac * 0.6), color: '#FF6B6B' },
                        { name: 'Comment', value: Math.floor(response.data.data.tongLuotTuongTac * 0.4), color: '#4ECDC4' }
                    ]);
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

        // Dữ liệu tăng trưởng (giả lập)
        const generateGrowthData = () => {
            if (timeRange === 'month') {
                // Dữ liệu 30 ngày gần nhất
                const data = [];
                for (let i = 0; i < 30; i++) {
                    data.push({
                        name: `Ngày ${i + 1}`,
                        users: Math.floor(Math.random() * 50) + 20
                    });
                }
                setGrowthData(data);
            } else {
                // Dữ liệu 12 tháng
                const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
                const data = months.map((month) => ({
                    name: month,
                    users: Math.floor(Math.random() * 500) + 200
                }));
                setGrowthData(data);
            }
        };

        fetchStats();
        generateGrowthData();
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
                                <h2>Tăng Trưởng Người Dùng</h2>
                                <div className="time-range-selector">
                                    <button 
                                        className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
                                        onClick={() => setTimeRange('month')}
                                    >
                                        Tháng
                                    </button>
                                    <button 
                                        className={`time-btn ${timeRange === 'year' ? 'active' : ''}`}
                                        onClick={() => setTimeRange('year')}
                                    >
                                        Năm
                                    </button>
                                </div>
                            </div>
                            {growthData.length > 0 && (
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={growthData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis 
                                            dataKey="name" 
                                            tick={{ fontSize: 12 }}
                                            interval={timeRange === 'month' ? 4 : 0}
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
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={interactionData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}`}
                                            outerRadius={70}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {interactionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value) => `${value} lần`}
                                            contentStyle={{ 
                                                backgroundColor: '#fff',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px'
                                            }}
                                        />
                                        <Legend />
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
