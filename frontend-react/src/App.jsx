import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Thermometer, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import './App.css';

function App() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [temperatureData, setTemperatureData] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Lấy danh sách thiết bị lúc mới mở web
  useEffect(() => {
    fetchDevices();
  }, []);

  // Tính năng số 1: AUTO-REFRESH (Tự động cập nhật mỗi 5 giây)
  useEffect(() => {
    if (selectedDevice) {
      // Gọi ngay lần đầu
      fetchTemperatureLogs(selectedDevice.id);
      fetchAlerts(selectedDevice.id);

      // Cài đặt đồng hồ lặp lại
      const interval = setInterval(() => {
        fetchTemperatureLogs(selectedDevice.id);
        fetchAlerts(selectedDevice.id);
      }, 5000); // 5000 mili-giây = 5 giây

      // Dọn dẹp đồng hồ khi chuyển đổi thiết bị khác
      return () => clearInterval(interval);
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/devices');
      setDevices(response.data);
      if (response.data.length > 0) {
        setSelectedDevice(response.data[0]); // Lưu toàn bộ Object thiết bị để lấy min/max temp
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
        time: new Date(log.recordedAt).toLocaleTimeString('vi-VN'), // Rút gọn lại thành giờ phút cho đẹp biểu đồ
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

  // Tính toán dữ liệu cho "Thẻ trạng thái" (Widget)
  const latestData = temperatureData.length > 0 ? temperatureData[temperatureData.length - 1] : null;
  const isDanger = latestData && selectedDevice &&
    (latestData.temperature < selectedDevice.minTemp || latestData.temperature > selectedDevice.maxTemp);

  // Tính năng tùy chỉnh màu của chấm tròn (Custom Dot)
  const renderCustomDot = (props) => {
    const { cx, cy, payload } = props;
    const isOut = payload.temperature < selectedDevice.minTemp || payload.temperature > selectedDevice.maxTemp;
    return (
      <circle cx={cx} cy={cy} r={6} stroke="white" strokeWidth={2} fill={isOut ? '#ef4444' : '#10b981'} />
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', color: '#1e293b' }}>
        <Activity size={32} color="#0ea5e9" style={{ marginRight: '10px' }} />
        <h1>Bảng Điều Khiển Tủ Lạnh Y Tế</h1>
      </header>

      {/* Thanh công cụ */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <label style={{ fontWeight: 'bold', marginRight: '10px', color: '#475569' }}>Chọn tủ giám sát:</label>
          <select
            value={selectedDevice?.id || ''}
            onChange={handleDeviceChange}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: 'bold' }}
          >
            {devices.map(device => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TÍNH NĂNG MỚI 2: Các thẻ Widget thông tin nhanh */}
      {selectedDevice && latestData && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          {/* Thẻ nhiệt độ hiện tại */}
          <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#64748b', display: 'flex', alignItems: 'center' }}>
              <Thermometer size={18} style={{ marginRight: '5px' }} /> Nhiệt độ hiện tại
            </h4>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: isDanger ? '#ef4444' : '#10b981' }}>
              {latestData.temperature} °C
            </div>
            <small style={{ color: '#94a3b8' }}>Cập nhật lúc: {latestData.time}</small>
          </div>

          {/* Thẻ đánh giá trạng thái */}
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

      {/* Cảnh báo chưa xử lý */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          {alerts.map(alert => (
            <div key={alert.id} style={{
              backgroundColor: '#fee2e2', borderLeft: '6px solid #ef4444',
              padding: '15px 20px', borderRadius: '8px', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <AlertTriangle color="#ef4444" size={28} style={{ marginRight: '15px' }} />
                <div>
                  <h3 style={{ margin: 0, color: '#b91c1c' }}>YÊU CẦU KIỂM TRA TỦ LẠNH</h3>
                  <p style={{ margin: '5px 0 0 0', color: '#7f1d1d', fontSize: '15px' }}>{alert.message}</p>
                  <small style={{ color: '#991b1b', fontWeight: 'bold' }}>Phát hiện lúc: {new Date(alert.createdAt).toLocaleString('vi-VN')}</small>
                </div>
              </div>
              <button
                onClick={() => handleResolveAlert(alert.id)}
                style={{
                  backgroundColor: '#ef4444', color: 'white', border: 'none',
                  padding: '12px 20px', borderRadius: '6px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '14px',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                <CheckCircle size={20} style={{ marginRight: '8px' }} />
                ĐÃ XỬ LÝ SỰ CỐ
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Biểu đồ */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#334155', display: 'flex', alignItems: 'center' }}>
          Lịch sử biến động nhiệt độ
        </h3>

        <div style={{ width: '100%', height: '450px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={temperatureData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="top" height={36} />

              {/* TÍNH NĂNG MỚI 3: Vùng nền màu xanh lá (Safe Zone) */}
              {selectedDevice && (
                <ReferenceArea
                  y1={selectedDevice.minTemp}
                  y2={selectedDevice.maxTemp}
                  fill="#d1fae5" // Màu xanh nhạt
                  fillOpacity={0.5}
                />
              )}

              <Line
                type="monotone"
                dataKey="temperature"
                name="Nhiệt độ đo được (°C)"
                stroke="#94a3b8" // Đường kẻ có màu trung tính
                strokeWidth={3}
                dot={renderCustomDot} // Các chấm tròn đổi màu tự động
                activeDot={{ r: 8, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;