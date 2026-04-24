import React, { useState } from 'react';
import axios from 'axios';
import { User, X } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
    const [editFullName, setEditFullName] = useState(localStorage.getItem('user_fullName') || '');
    // 💡 Thêm 2 state để quản lý mật khẩu cũ và mới
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [profileMessage, setProfileMessage] = useState('');

    if (!isOpen) return null;

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMessage('');

        // Nếu có nhập mật khẩu mới mà quên nhập mật khẩu cũ thì báo lỗi ngay ở Web
        if (newPassword && !currentPassword) {
            setProfileMessage('❌ Vui lòng nhập mật khẩu hiện tại để xác minh!');
            return;
        }

        try {
            await axios.put('http://localhost:8080/api/v1/users/profile', {
                fullName: editFullName,
                currentPassword: currentPassword, // Gửi thêm mật khẩu cũ
                newPassword: newPassword
            });

            localStorage.setItem('user_fullName', editFullName);
            setProfileMessage('✅ Cập nhật thông tin thành công!');

            setTimeout(() => {
                onClose();
                setProfileMessage('');
                setCurrentPassword('');
                setNewPassword('');
            }, 1500);

        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            // 💡 Bắt chính xác câu lỗi từ Spring Boot gửi sang
            if (error.response && error.response.status === 400) {
                setProfileMessage(`❌ Lỗi: ${error.response.data}`);
            } else {
                setProfileMessage('❌ Lỗi: Hệ thống không thể cập nhật thông tin.');
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
                    <User size={24} style={{ marginRight: '10px', color: '#0ea5e9' }} /> Thông tin cá nhân
                </h2>

                {profileMessage && (
                    <div style={{
                        padding: '10px', marginBottom: '15px', borderRadius: '6px', fontWeight: 'bold',
                        // Đổi màu thông báo tùy thuộc vào việc thành công (✅) hay thất bại (❌)
                        backgroundColor: profileMessage.includes('✅') ? '#d1fae5' : '#fee2e2',
                        color: profileMessage.includes('✅') ? '#047857' : '#b91c1c'
                    }}>
                        {profileMessage}
                    </div>
                )}

                <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Họ và tên hiển thị</label>
                        <input type="text" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>

                    {/* Vùng khu biệt dành cho việc đổi mật khẩu */}
                    <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569', fontSize: '14px' }}>Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Nhập mật khẩu cũ..."
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569', fontSize: '14px' }}>Mật khẩu mới</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Để trống nếu không đổi..."
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <button type="submit" style={{ marginTop: '10px', backgroundColor: '#0ea5e9', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Lưu thay đổi
                    </button>
                </form>
            </div>
        </div>
    );
}