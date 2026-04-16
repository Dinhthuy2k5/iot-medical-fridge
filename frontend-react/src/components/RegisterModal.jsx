import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, X } from 'lucide-react';

export default function RegisterModal({ isOpen, onClose }) {
    const [regUsername, setRegUsername] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regFullName, setRegFullName] = useState('');
    const [regRole, setRegRole] = useState('ROLE_NURSE');
    const [regMessage, setRegMessage] = useState('');

    if (!isOpen) return null; // Nếu không được gọi mở thì tàng hình

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
            setRegUsername(''); setRegPassword(''); setRegFullName('');
            setTimeout(() => {
                onClose(); // Gọi hàm đóng Modal từ Dashboard truyền xuống
                setRegMessage('');
            }, 2000);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setRegMessage('❌ Lỗi: Bạn không có quyền Admin!');
            } else {
                setRegMessage('❌ Lỗi: Tài khoản đã tồn tại hoặc hệ thống gián đoạn.');
            }
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
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
    );
}