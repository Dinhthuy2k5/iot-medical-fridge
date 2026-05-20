import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Thermometer, AlertTriangle, CheckCircle, Info, Download, LayoutGrid, Bell, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Import các component của bạn
import Header from './Header';
import RegisterModal from './RegisterModal';
import ProfileModal from './ProfileModal';

export default function Dashboard({ onLogout }) {
    // 1. Quản lý Modal & Sidebar
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Trạng thái mở/tắt thanh cảnh báo

    // 2. Quản lý dữ liệu IoT
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [temperatureData, setTemperatureData] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        fetchDevices();
    }, []);

    // 3. Gọi API y hệt như logic gốc của bạn
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
            if (response.data.length > 0) setSelectedDevice(response.data[0]);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách thiết bị:", error);
        }
    };

    const fetchTemperatureLogs = async (deviceId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/temperatures/${deviceId}`);
            const formattedData = response.data.map(log => {
                const dateObj = new Date(log.recordedAt);
                return {
                    ...log,
                    // Giữ lại 'time' ngắn gọn (chỉ Giờ:Phút) để Biểu đồ không bị rối mắt
                    time: dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    // THÊM MỚI: 'fullTime' chứa đầy đủ Ngày/Tháng/Năm Giờ:Phút:Giây để xuất file Báo cáo
                    fullTime: dateObj.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
                };
            }).reverse();
            setTemperatureData(formattedData);
        } catch (error) {
            console.error("Lỗi lấy nhiệt độ:", error);
        }
    };


    const fetchAlerts = async (deviceId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/alerts/${deviceId}/unresolved`);
            setAlerts(response.data);
            // Nếu có cảnh báo mới và sidebar đang đóng, có thể tự động mở lên (tùy ý bạn)
        } catch (error) {
            console.error("Lỗi lấy cảnh báo:", error);
        }
    };

    const handleResolveAlert = async (alertId) => {
        try {
            await axios.put(`http://localhost:8080/api/v1/alerts/${alertId}/resolve`);
            toast.success('Đã xác nhận xử lý sự cố!', {
                duration: 4000,
                position: 'top-center',
                style: { fontWeight: 'bold', padding: '16px', color: '#047857' },
                iconTheme: { primary: '#10b981', secondary: '#fff' }
            });
            fetchAlerts(selectedDevice.id);

            // Tự đóng sidebar nếu hết cảnh báo
            if (alerts.length <= 1) {
                setTimeout(() => setIsSidebarOpen(false), 1000);
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra, không thể tắt cảnh báo!');
            console.error("Lỗi tắt cảnh báo:", error);
        }
    };

    const handleExportCSV = () => {
        if (temperatureData.length === 0) {
            toast.error("Không có dữ liệu để xuất!");
            return;
        }

        // --- BƯỚC 1: XỬ LÝ DỮ LIỆU ĐỂ RÚT RA TRI THỨC (INSIGHTS) ---
        const temps = temperatureData.map(d => parseFloat(d.temperature));
        const maxTemp = Math.max(...temps);
        const minTemp = Math.min(...temps);
        const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);

        let dangerCount = 0;
        temperatureData.forEach(d => {
            if (d.temperature < selectedDevice.minTemp || d.temperature > selectedDevice.maxTemp) {
                dangerCount++;
            }
        });

        // --- BƯỚC 2: CHUẨN ĐOÁN HIỆU SUẤT TỦ LẠNH AI ---
        let diagnostic = "Tủ lạnh hoạt động tối ưu, đảm bảo tiêu chuẩn bảo quản Y tế.";
        if (dangerCount > 0) {
            diagnostic = `NGUY HIỂM: Tủ lạnh hoạt động không ổn định (${dangerCount} lần vượt ngưỡng an toàn). Đề nghị chuyển Vaccine sang tủ khác!`;
        } else if (maxTemp >= selectedDevice.maxTemp - 0.5) {
            diagnostic = "LƯU Ý BẢO TRÌ: Nhiệt độ thường xuyên duy trì ở mức cao. Dấu hiệu máy nén yếu, thiếu Gas hoặc hở gioăng cửa tủ.";
        } else if (minTemp <= selectedDevice.minTemp + 0.5) {
            diagnostic = "CẢNH BÁO ĐÓNG BĂNG: Tủ quá lạnh so với mức cần thiết. Cần điều chỉnh tăng nhiệt độ để tránh làm hỏng protein trong Vaccine.";
        }

        // --- BƯỚC 3: TẠO FILE CSV CHUẨN DOANH NGHIỆP CÓ HEADER BÁO CÁO ---
        // Sử dụng \ufeff (BOM) để Microsoft Excel hiển thị đúng tiếng Việt có dấu
        let csvContent = "\ufeffBÁO CÁO PHÂN TÍCH HIỆU SUẤT TỦ LẠNH Y TẾ\n";
        csvContent += `Thiết bị giám sát:,${selectedDevice.name} (ID: ${selectedDevice.id})\n`;
        csvContent += `Ngưỡng an toàn cài đặt:,${selectedDevice.minTemp}°C - ${selectedDevice.maxTemp}°C\n`;
        csvContent += `Thời gian xuất báo cáo:,${new Date().toLocaleString('vi-VN')}\n`;
        csvContent += `--------------------------------------------------------\n`;

        // Ghi phần Tri thức/Insight vào Excel
        csvContent += `[PHÂN TÍCH CHUYÊN SÂU]\n`;
        csvContent += `Nhiệt độ trung bình:,${avgTemp}°C\n`;
        csvContent += `Nhiệt độ cao nhất đo được:,${maxTemp}°C\n`;
        csvContent += `Nhiệt độ thấp nhất đo được:,${minTemp}°C\n`;
        csvContent += `Số lần vi phạm an toàn:,${dangerCount} lần\n`;
        csvContent += `CHẨN ĐOÁN HỆ THỐNG:,${diagnostic}\n`;
        csvContent += `--------------------------------------------------------\n`;

        // Ghi phần Dữ liệu thô chi tiết
        csvContent += `[NHẬT KÝ ĐO LƯỜNG CHI TIẾT]\n`;
        csvContent += "Thời gian đo (Ngày/Giờ),Nhiệt độ (°C),Đánh giá trạng thái\n";

        temperatureData.forEach(row => {
            const status = (row.temperature < selectedDevice.minTemp || row.temperature > selectedDevice.maxTemp) ? "VƯỢT NGƯỠNG" : "An toàn";
            // Sử dụng fullTime đã được format đầy đủ ngày tháng
            csvContent += `${row.fullTime},${row.temperature},${status}\n`;
        });

        // Tải xuống file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `BaoCao_PhanTich_${selectedDevice.id}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Đã xuất báo cáo phân tích thành công!", { icon: '📊' });
    };


    const latestData = temperatureData.length > 0 ? temperatureData[temperatureData.length - 1] : null;
    const isDanger = latestData && selectedDevice && (latestData.temperature < selectedDevice.minTemp || latestData.temperature > selectedDevice.maxTemp);

    const renderCustomDot = (props) => {
        const { cx, cy, payload } = props;
        const isOut = payload.temperature < selectedDevice.minTemp || payload.temperature > selectedDevice.maxTemp;
        return <circle cx={cx} cy={cy} r={4} stroke="white" strokeWidth={1.5} fill={isOut ? '#ef4444' : '#0ea5e9'} />;
    };

    // --- CÁC STYLE INLINE GIÚP CHẠY MƯỢT MÀ KHÔNG CẦN TAILWIND ---
    const styles = {
        container: { backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' },
        toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' },
        mainContent: { flex: 1, padding: '30px', overflowY: 'auto' },
        deviceGrid: { display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '20px' },
        deviceCard: (isSelected) => ({
            minWidth: '240px',
            backgroundColor: isSelected ? '#0ea5e9' : 'white',
            padding: '20px',
            borderRadius: '12px',
            cursor: 'pointer',
            border: isSelected ? 'none' : '1px solid #cbd5e1',
            boxShadow: isSelected ? '0 10px 15px -3px rgba(14, 165, 233, 0.4)' : '0 2px 4px rgba(0,0,0,0.05)',
            color: isSelected ? 'white' : '#334155',
            transition: 'all 0.2s'
        }),
        widgetContainer: { display: 'flex', gap: '25px', marginBottom: '30px' },
        widget: { flex: 1, backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
        dangerWidget: { flex: 1, backgroundColor: '#fef2f2', padding: '25px', borderRadius: '16px', border: '1px solid #fca5a5', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.1)' },
        safeWidget: { flex: 1, backgroundColor: '#ecfdf5', padding: '25px', borderRadius: '16px', border: '1px solid #6ee7b7', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1)' },
        sidebarOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 40 },
        sidebar: { position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh', backgroundColor: '#f8fafc', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', zIndex: 50, transition: 'transform 0.3s ease-in-out', transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)', display: 'flex', flexDirection: 'column' }
    };

    return (
        <div style={styles.container}>
            <Toaster />
            <Header onLogout={onLogout} onOpenProfile={() => setIsProfileOpen(true)} onOpenRegister={() => setIsRegisterOpen(true)} />
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />

            {/* THANH CÔNG CỤ (CHỨA NÚT MỞ CẢNH BÁO) */}
            <div style={styles.toolbar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
                    <LayoutGrid size={24} />
                    <h2 style={{ margin: 0, fontSize: '20px' }}>Trung Tâm Giám Sát Tủ Lạnh Y Tế</h2>
                </div>

                <button
                    onClick={() => setIsSidebarOpen(true)}
                    style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: alerts.length > 0 ? '#fee2e2' : '#f1f5f9', border: alerts.length > 0 ? '1px solid #fca5a5' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: alerts.length > 0 ? '#b91c1c' : '#475569' }}
                >
                    <Bell size={20} /> Cảnh báo sự cố
                    {alerts.length > 0 && (
                        <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '13px' }}>
                            {alerts.length}
                        </span>
                    )}
                </button>
            </div>

            {/* VÙNG NỘI DUNG CHÍNH */}
            <div style={styles.mainContent}>

                {/* LƯỚI THIẾT BỊ ĐẸP MẮT */}
                <div style={styles.deviceGrid}>
                    {devices.map(device => (
                        <div key={device.id} onClick={() => setSelectedDevice(device)} style={styles.deviceCard(selectedDevice?.id === device.id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px' }}>{device.name}</h3>
                                {/* Có thể thêm chấm đỏ ở đây nếu API thiết bị có trường trạng thái hỏng */}
                            </div>
                            <small style={{ opacity: 0.8 }}>ID: {device.id}</small>
                        </div>
                    ))}
                </div>

                {selectedDevice && latestData && (
                    <>
                        {/* WIDGET HIỂN THỊ TRẠNG THÁI */}
                        <div style={styles.widgetContainer}>
                            <div style={styles.widget}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                                    <Thermometer size={20} style={{ marginRight: '8px' }} /> Nhiệt độ hiện tại
                                </h4>
                                <div style={{ fontSize: '48px', fontWeight: '900', color: isDanger ? '#ef4444' : '#0ea5e9' }}>
                                    {latestData.temperature} <span style={{ fontSize: '24px', color: '#94a3b8' }}>°C</span>
                                </div>
                                <div style={{ marginTop: '10px', color: '#94a3b8', fontSize: '14px' }}>Cập nhật: {latestData.time}</div>
                            </div>

                            <div style={isDanger ? styles.dangerWidget : styles.safeWidget}>
                                <h4 style={{ margin: '0 0 15px 0', color: isDanger ? '#b91c1c' : '#047857', display: 'flex', alignItems: 'center' }}>
                                    <Info size={20} style={{ marginRight: '8px' }} /> Trạng thái hoạt động
                                </h4>
                                <div style={{ fontSize: '32px', fontWeight: '900', color: isDanger ? '#b91c1c' : '#047857' }}>
                                    {isDanger ? 'NGUY HIỂM' : 'AN TOÀN'}
                                </div>
                                <div style={{ marginTop: '15px', color: isDanger ? '#dc2626' : '#059669', fontWeight: 'bold' }}>
                                    Phạm vi cho phép: {selectedDevice.minTemp}°C đến {selectedDevice.maxTemp}°C
                                </div>
                            </div>
                        </div>

                        {/* BIỂU ĐỒ DIỆN TÍCH (AREA CHART) VÀ NÚT TẢI CSV */}
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '20px' }}>Lịch sử biến động: {selectedDevice.name}</h3>

                                <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    <Download size={18} /> Xuất Báo Cáo
                                </button>
                            </div>

                            <div style={{ width: '100%', height: '400px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={temperatureData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={isDanger ? "#ef4444" : "#0ea5e9"} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={isDanger ? "#ef4444" : "#0ea5e9"} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="time" tick={{ fontSize: 13, fill: '#64748b' }} axisLine={false} tickLine={false} minTickGap={30} />
                                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#64748b', fontSize: 13 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                        <ReferenceArea y1={selectedDevice.minTemp} y2={selectedDevice.maxTemp} fill="#10b981" fillOpacity={0.08} />
                                        <Area type="monotone" dataKey="temperature" name="Nhiệt độ (°C)" stroke={isDanger ? "#ef4444" : "#0ea5e9"} strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" activeDot={{ r: 8, fill: '#fff', stroke: isDanger ? '#ef4444' : '#0ea5e9', strokeWidth: 2 }} dot={renderCustomDot} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* SIDEBAR CẢNH BÁO SỰ CỐ (SẼ MỞ RA KHI BẤM NÚT) */}
            {isSidebarOpen && <div style={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)}></div>}

            <div style={styles.sidebar}>
                <div style={{ padding: '25px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertTriangle color="#ef4444" size={24} />
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>Yêu Cầu Xử Lý</h3>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '25px', flex: 1, overflowY: 'auto' }}>
                    {alerts.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '50px' }}>
                            <CheckCircle size={64} color="#a7f3d0" style={{ marginBottom: '15px' }} />
                            <h3 style={{ color: '#047857' }}>Hệ thống an toàn</h3>
                            <p>Tủ {selectedDevice?.name} không có sự cố.</p>
                        </div>
                    ) : (
                        alerts.map(alert => (
                            <div key={alert.id} style={{ backgroundColor: 'white', border: '1px solid #fca5a5', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.1)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '5px', height: '100%', backgroundColor: '#ef4444' }}></div>
                                <h4 style={{ margin: '0 0 10px 0', color: '#b91c1c', fontSize: '16px' }}>🚨 Cảnh báo khẩn cấp</h4>
                                <p style={{ margin: '0 0 20px 0', color: '#475569', lineHeight: '1.5' }}>{alert.message}</p>

                                <button
                                    onClick={() => handleResolveAlert(alert.id)}
                                    style={{ width: '100%', padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                                >
                                    <CheckCircle size={18} /> ĐÃ KIỂM TRA & XỬ LÝ
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}