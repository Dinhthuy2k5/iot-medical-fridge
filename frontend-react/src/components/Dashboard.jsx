import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Thermometer, Activity, AlertTriangle, CheckCircle, Info, LogOut, UserPlus, X, User } from 'lucide-react';

export default function Dashboard({ onLogout }) {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [temperatureData, setTemperatureData] = useState([]);
    const [alerts, setAlerts] = useState([]);

    // --- 💡 STATE MỚI CHO TÍNH NĂNG TẠO TÀI KHOẢN ---
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [regUsername, setRegUsername] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regFullName, setRegFullName] = useState('');
    const [regRole, setRegRole] = useState('ROLE_NURSE');
    const [regMessage, setRegMessage] = useState('');

    useEffect(() => {
        fetchDevices();
    }, []);

    useEffect(() => {
        if (selectedDevice) {
            fetchTemperatureLogs(selectedDevice.id);
            fetchAlerts(selectedDevice.id);

            const interval = setInterval(() => {
                fetchTemperatureLogs(selectedDevice.id);
                fetchAlerts(selectedDevice.id);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [selectedDevice]);

    const fetchDevices = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/devices');
            setDevices(response.data);
            if (response.data.length > 0) {
                setSelectedDevice(response.data[0]);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách thiết bị:", error);
        }
    };

    const fetchTemperatureLogs = async (deviceId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/temperatures/${deviceId}`);
            const formattedData = response.data.map(log => ({
                ...log,
                time: new Date(log.recordedAt).toLocaleTimeString('vi-VN'),
            })).reverse();
            setTemperatureData(formattedData);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu nhiệt độ:", error);
        }
    };

    const fetchAlerts = async (deviceId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/alerts/${deviceId}/unresolved`);
            setAlerts(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy cảnh báo:", error);
        }
    };

    const handleResolveAlert = async (alertId) => {
        try {
            await axios.put(`http://localhost:8080/api/v1/alerts/${alertId}/resolve`);
            alert("✅ Đã xác nhận xử lý sự cố!");
            fetchAlerts(selectedDevice.id);
        } catch (error) {
            console.error("Lỗi khi tắt cảnh báo:", error);
        }
    };

    const handleDeviceChange = (e) => {
        const targetId = e.target.value;
        const device = devices.find(d => d.id === targetId);
        setSelectedDevice(device);
    };

    // --- 💡 HÀM XỬ LÝ GỌI API ĐĂNG KÝ TÀI KHOẢN ---
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setRegMessage('');
        try {
            await axios.post('http://localhost:8080/api/v1/auth/register', {
                username: regUsername,
                password: regPassword,
                fullName: regFullName,
                role: regRole
            });
            setRegMessage('✅ Tạo tài khoản thành công!');
            // Xóa form sau khi tạo thành công
            setRegUsername(''); setRegPassword(''); setRegFullName('');
            setTimeout(() => {
                setIsRegisterOpen(false);
                setRegMessage('');
            }, 2000);
        } catch (error) {
            // Bắt lỗi 403 nếu y tá cố tình gọi API này
            if (error.response && error.response.status === 403) {
                setRegMessage('❌ Lỗi: Bạn không có quyền Admin!');
            } else {
                setRegMessage('❌ Lỗi: Tài khoản đã tồn tại hoặc hệ thống gián đoạn.');
            }
        }
    };

    const latestData = temperatureData.length > 0 ? temperatureData[temperatureData.length - 1] : null;
    const isDanger = latestData && selectedDevice &&
        (latestData.temperature < selectedDevice.minTemp || latestData.temperature > selectedDevice.maxTemp);

    const renderCustomDot = (props) => {
        const { cx, cy, payload } = props;
        const isOut = payload.temperature < selectedDevice.minTemp || payload.temperature > selectedDevice.maxTemp;
        return (
            <circle cx={cx} cy={cy} r={6} stroke="white" strokeWidth={2} fill={isOut ? '#ef4444' : '#10b981'} />
        );
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f1f5f9', minHeight: '100vh', position: 'relative' }}>

            {/* HEADER */}
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', color: '#1e293b' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Activity size={32} color="#0ea5e9" style={{ marginRight: '10px' }} />
                    <h1>Bảng Điều Khiển Tủ Lạnh Y Tế</h1>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

                    {/* KHU VỰC THÔNG TIN CÁ NHÂN (PROFILE) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginRight: '15px', borderRight: '2px solid #e2e8f0', paddingRight: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '16px' }}>
                                {localStorage.getItem('user_fullName') || 'Người dùng'}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>
                                {localStorage.getItem('user_role') === 'ROLE_ADMIN' ? '👑 Quản trị viên' : '🩺 Y tá trực'}
                            </div>
                        </div>
                        <div style={{ backgroundColor: '#e2e8f0', padding: '10px', borderRadius: '50%' }}>
                            <User size={24} color="#475569" />
                        </div>
                    </div>

                    {/* NÚT MỞ FORM ĐĂNG KÝ (CHỈ HIỂN THỊ KHI LÀ ROLE_ADMIN) */}
                    {localStorage.getItem('user_role') === 'ROLE_ADMIN' && (
                        <button
                            onClick={() => setIsRegisterOpen(true)}
                            style={{ display: 'flex', alignItems: 'center', padding: '10px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            <UserPlus size={18} style={{ marginRight: '8px' }} />
                            Tạo tài khoản
                        </button>
                    )}

                    {/* NÚT ĐĂNG XUẤT */}
                    <button
                        onClick={() => {
                            // Dọn dẹp thông tin khi đăng xuất
                            localStorage.removeItem('user_fullName');
                            localStorage.removeItem('user_role');
                            onLogout();
                        }}
                        style={{ display: 'flex', alignItems: 'center', padding: '10px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        <LogOut size={18} style={{ marginRight: '8px' }} />
                        Đăng xuất
                    </button>
                </div>
            </header>

            {/* --- 💡 MODAL ĐĂNG KÝ TÀI KHOẢN (Chỉ hiện khi isRegisterOpen = true) --- */}
            {isRegisterOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <button onClick={() => setIsRegisterOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <X size={24} />
                        </button>
                        <h2 style={{ marginTop: 0, color: '#1e293b', display: 'flex', alignItems: 'center' }}>
                            <UserPlus size={24} style={{ marginRight: '10px', color: '#10b981' }} /> Thêm nhân sự mới
                        </h2>

                        {regMessage && (
                            <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '6px', backgroundColor: regMessage.includes('✅') ? '#d1fae5' : '#fee2e2', color: regMessage.includes('✅') ? '#047857' : '#b91c1c', fontWeight: 'bold' }}>
                                {regMessage}
                            </div>
                        )}

                        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Tên đăng nhập</label>
                                <input type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Mật khẩu</label>
                                <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Họ và tên hiển thị</label>
                                <input type="text" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Chức vụ</label>
                                <select value={regRole} onChange={(e) => setRegRole(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                                    <option value="ROLE_NURSE">Y tá (ROLE_NURSE)</option>
                                    <option value="ROLE_ADMIN">Quản trị viên (ROLE_ADMIN)</option>
                                </select>
                            </div>
                            <button type="submit" style={{ marginTop: '10px', backgroundColor: '#0ea5e9', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Xác nhận tạo
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* THANH CÔNG CỤ CHỌN THIẾT BỊ */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div>
                    <label style={{ fontWeight: 'bold', marginRight: '10px', color: '#475569' }}>Chọn tủ giám sát:</label>
                    <select value={selectedDevice?.id || ''} onChange={handleDeviceChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: 'bold' }}>
                        {devices.map(device => (
                            <option key={device.id} value={device.id}>{device.name} ({device.id})</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* WIDGET TRẠNG THÁI */}
            {selectedDevice && latestData && (
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                            <Thermometer size={18} style={{ marginRight: '5px' }} /> Nhiệt độ hiện tại
                        </h4>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: isDanger ? '#ef4444' : '#10b981' }}>
                            {latestData.temperature} °C
                        </div>
                        <small style={{ color: '#94a3b8' }}>Cập nhật lúc: {latestData.time}</small>
                    </div>

                    <div style={{ flex: 1, backgroundColor: isDanger ? '#fef2f2' : '#ecfdf5', padding: '20px', borderRadius: '12px', border: `1px solid ${isDanger ? '#fca5a5' : '#6ee7b7'}` }}>
                        <h4 style={{ margin: '0 0 10px 0', color: isDanger ? '#b91c1c' : '#047857', display: 'flex', alignItems: 'center' }}>
                            <Info size={18} style={{ marginRight: '5px' }} /> Trạng thái hoạt động
                        </h4>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: isDanger ? '#b91c1c' : '#047857' }}>
                            {isDanger ? '⚠️ CẢNH BÁO NGUY HIỂM' : '✅ BÌNH THƯỜNG'}
                        </div>
                        <small style={{ color: isDanger ? '#dc2626' : '#059669' }}>Ngưỡng an toàn: {selectedDevice.minTemp}°C - {selectedDevice.maxTemp}°C</small>
                    </div>
                </div>
            )}

            {/* CẢNH BÁO */}
            {alerts.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    {alerts.map(alert => (
                        <div key={alert.id} style={{ backgroundColor: '#fee2e2', borderLeft: '6px solid #ef4444', padding: '15px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <AlertTriangle color="#ef4444" size={28} style={{ marginRight: '15px' }} />
                                <div>
                                    <h3 style={{ margin: 0, color: '#b91c1c' }}>YÊU CẦU KIỂM TRA TỦ LẠNH</h3>
                                    <p style={{ margin: '5px 0 0 0', color: '#7f1d1d', fontSize: '15px' }}>{alert.message}</p>
                                    <small style={{ color: '#991b1b', fontWeight: 'bold' }}>Phát hiện lúc: {new Date(alert.createdAt).toLocaleString('vi-VN')}</small>
                                </div>
                            </div>
                            <button onClick={() => handleResolveAlert(alert.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                                <CheckCircle size={20} style={{ marginRight: '8px' }} />
                                ĐÃ XỬ LÝ SỰ CỐ
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* BIỂU ĐỒ */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#334155', display: 'flex', alignItems: 'center' }}>Lịch sử biến động nhiệt độ</h3>
                <div style={{ width: '100%', height: '450px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={temperatureData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                            <Legend verticalAlign="top" height={36} />
                            {selectedDevice && <ReferenceArea y1={selectedDevice.minTemp} y2={selectedDevice.maxTemp} fill="#d1fae5" fillOpacity={0.5} />}
                            <Line type="monotone" dataKey="temperature" name="Nhiệt độ đo được (°C)" stroke="#94a3b8" strokeWidth={3} dot={renderCustomDot} activeDot={{ r: 8, fill: '#3b82f6' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}