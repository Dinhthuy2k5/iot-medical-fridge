import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  // Kiểm tra xem trong bộ nhớ trình duyệt có thẻ từ cũ không
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || '');

  // Cứ mỗi khi token thay đổi, hàm này sẽ chạy
  useEffect(() => {
    if (token) {
      // 1. Tự động đính kèm Token vào TẤT CẢ các API gọi bằng thư viện axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // 2. Lưu token vào bộ nhớ trình duyệt (để F5 không bị văng ra)
      localStorage.setItem('jwt_token', token);
    } else {
      // Nếu đăng xuất (token rỗng), gỡ thẻ từ ra khỏi axios và bộ nhớ
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('jwt_token');
    }
  }, [token]);

  // Nếu chưa có thẻ, hiển thị màn hình Đăng Nhập
  if (!token) {
    return <Login setToken={setToken} />;
  }

  // Nếu có thẻ rồi, hiển thị màn hình Dashboard
  return <Dashboard onLogout={() => setToken('')} />;
}

export default App;