import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Lock, User, AlertCircle } from 'lucide-react';

export default function Login({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Xóa lỗi cũ
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/login', {
                username,
                password
            });
            // Nếu đăng nhập thành công, gửi token lên cho App.jsx quản lý
            setToken(response.data.token);
        } catch (err) {
            setError('Tài khoản hoặc mật khẩu không chính xác!');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                    <Activity size={48} color="#0ea5e9" style={{ marginBottom: '10px' }} />
                    <h2 style={{ margin: 0, color: '#1e293b' }}>Hệ Thống Y Tế</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Đăng nhập để giám sát thiết bị</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                        <AlertCircle size={18} style={{ marginRight: '8px' }} />
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>Tài khoản</label>
                        <div style={{ position: 'relative' }}>
                            <User size={20} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                                placeholder="Nhập tên tài khoản..."
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>Mật khẩu</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                                placeholder="Nhập mật khẩu..."
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{ width: '100%', backgroundColor: '#0ea5e9', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.3s' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0284c7'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#0ea5e9'}
                    >
                        Đăng Nhập
                    </button>
                </form>
            </div>
        </div>
    );
}