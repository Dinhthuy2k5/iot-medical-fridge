import React, { useState } from 'react';
import axios from 'axios';
import { User, X } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
    const [editFullName, setEditFullName] = useState(localStorage.getItem('user_fullName') || '');
    const [editPassword, setEditPassword] = useState('');
    const [profileMessage, setProfileMessage] = useState('');

    if (!isOpen) return null;

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMessage('');

        try {
            await axios.put('http://localhost:8080/api/v1/users/profile', {
                fullName: editFullName,
                newPassword: editPassword
            });

            localStorage.setItem('user_fullName', editFullName);
            setProfileMessage('✅ Đã cập nhật cơ sở dữ liệu thành công!');

            setTimeout(() => {
                onClose();
                setProfileMessage('');
                setEditPassword('');
            }, 2000);

        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            setProfileMessage('❌ Lỗi: Hệ thống không thể cập nhật thông tin.');
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <X size={24} />
                </button>
                <h2 style={{ marginTop: 0, color: '#1e293b', display: 'flex', alignItems: 'center' }}>
                    <User size={24} style={{ marginRight: '10px', color: '#0ea5e9' }} /> Thông tin cá nhân
                </h2>

                {profileMessage && (
                    <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '6px', backgroundColor: '#d1fae5', color: '#047857', fontWeight: 'bold' }}>
                        {profileMessage}
                    </div>
                )}

                <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Họ và tên hiển thị</label>
                        <input type="text" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Đổi mật khẩu mới</label>
                        <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Để trống nếu không muốn đổi..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>

                    <button type="submit" style={{ marginTop: '10px', backgroundColor: '#0ea5e9', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Lưu thay đổi
                    </button>
                </form>
            </div>
        </div>
    );
}