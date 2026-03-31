import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Thermometer, Activity } from 'lucide-react';
import './App.css'; // Mặc dù trống nhưng cứ import để sau này thêm style

function App() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [temperatureData, setTemperatureData] = useState([]);

  // Hàm 1: Chạy ngay khi mở web để lấy danh sách tủ lạnh
  useEffect(() => {
    fetchDevices();
  }, []);

  // Hàm 2: Chạy mỗi khi người dùng chọn một tủ lạnh khác nhau để lấy lịch sử nhiệt độ
  useEffect(() => {
    if (selectedDeviceId) {
      fetchTemperatureLogs(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  const fetchDevices = async () => {
    try {
      // Gọi API Spring Boot (nhớ đảm bảo Spring Boot đang chạy)
      const response = await axios.get('http://localhost:8080/api/v1/devices');
      setDevices(response.data);
      if (response.data.length > 0) {
        setSelectedDeviceId(response.data[0].id); // Mặc định chọn tủ lạnh đầu tiên
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thiết bị:", error);
    }
  };

  const fetchTemperatureLogs = async (deviceId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/temperatures/${deviceId}`);

      // Xử lý lại dữ liệu thời gian cho dễ đọc trên biểu đồ
      const formattedData = response.data.map(log => ({
        ...log,
        time: new Date(log.recordedAt).toLocaleTimeString(), // Lấy định dạng Giờ:Phút:Giây
      })).reverse(); // Đảo ngược mảng để vẽ từ cũ đến mới

      setTemperatureData(formattedData);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu nhiệt độ:", error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', color: '#2c3e50' }}>
        <Activity size={32} color="#3498db" style={{ marginRight: '10px' }} />
        <h1>Hệ Thống Giám Sát Tủ Lạnh Y Tế</h1>
      </header>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Chọn tủ lạnh cần xem:</label>
        <select
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
        >
          {devices.map(device => (
            <option key={device.id} value={device.id}>
              {device.name} ({device.id})
            </option>
          ))}
        </select>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', color: '#e74c3c' }}>
          <Thermometer size={24} style={{ marginRight: '8px' }} />
          Biểu đồ nhiệt độ thời gian thực
        </h3>

        {/* Khung vẽ biểu đồ Recharts */}
        <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip />
              <Legend />
              {/* Vẽ đường thẳng màu đỏ cho nhiệt độ */}
              <Line type="monotone" dataKey="temperature" name="Nhiệt độ (°C)" stroke="#e74c3c" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;