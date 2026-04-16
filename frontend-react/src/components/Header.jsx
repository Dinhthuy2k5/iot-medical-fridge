import React from 'react';
import { Activity, UserPlus, LogOut, User } from 'lucide-react';

export default function Header({ onOpenProfile, onOpenRegister, onLogout }) {
    const role = localStorage.getItem('user_role');
    const fullName = localStorage.getItem('user_fullName') || 'Người dùng';

    return (
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', color: '#1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Activity size={32} color="#0ea5e9" style={{ marginRight: '10px' }} />
                <h1>Bảng Điều Khiển Tủ Lạnh Y Tế</h1>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

                {/* Khối Profile */}
                <div
                    onClick={onOpenProfile}
                    style={{ display: 'flex', alignItems: 'center', gap: '15px', marginRight: '15px', borderRight: '2px solid #e2e8f0', paddingRight: '20px', cursor: 'pointer', transition: 'opacity 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = 0.7}
                    onMouseOut={(e) => e.currentTarget.style.opacity = 1}
                >
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '16px' }}>{fullName}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>
                            {role === 'ROLE_ADMIN' ? '👑 Quản trị viên' : '🩺 Y tá trực'}
                        </div>
                    </div>
                    <div style={{ backgroundColor: '#e2e8f0', padding: '10px', borderRadius: '50%' }}>
                        <User size={24} color="#475569" />
                    </div>
                </div>

                {/* Nút Tạo Tài Khoản (Dành cho Admin) */}
                {role === 'ROLE_ADMIN' && (
                    <button
                        onClick={onOpenRegister}
                        style={{ display: 'flex', alignItems: 'center', padding: '10px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        <UserPlus size={18} style={{ marginRight: '8px' }} />
                        Tạo tài khoản
                    </button>
                )}

                {/* Nút Đăng Xuất */}
                <button
                    onClick={() => {
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
    );
}