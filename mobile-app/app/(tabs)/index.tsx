import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // 1. Lúc mới mở App: Chạy vào "Két sắt" tìm Token cũ
  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('jwt_token');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Lỗi đọc két sắt:", error);
      } finally {
        setIsCheckingToken(false);
      }
    };
    checkToken();
  }, []);

  // HÀM XỬ LÝ KHI ĐĂNG NHẬP THÀNH CÔNG
  const handleLoginSuccess = async (newToken: string) => {
    setToken(newToken);
    await AsyncStorage.setItem('jwt_token', newToken); // Cất vào két sắt ngay lập tức
  };

  // HÀM XỬ LÝ KHI BẤM ĐĂNG XUẤT
  const handleLogout = async () => {
    setToken(null);
    delete axios.defaults.headers.common['Authorization']; // Xóa thẻ khỏi Axios
    await AsyncStorage.removeItem('jwt_token'); // Vứt thẻ trong két đi
  };

  // Nếu App đang mải lục két sắt thì hiện vòng tròn xoay
  if (isCheckingToken) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  // Nếu chưa có thẻ -> Hiển thị form Đăng Nhập
  if (!token) {
    return <Login setToken={handleLoginSuccess} />;
  }

  // ĐIỂM MẤU CHỐT FIX LỖI 403 Ở ĐÂY:
  // Ép Axios phải cầm chắc thẻ Token rồi mới được phép gọi Dashboard
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  return <Dashboard onLogout={handleLogout} />;
}