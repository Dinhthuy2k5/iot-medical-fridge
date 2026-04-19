import axios from 'axios';
import { UserPlus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BASE = 'http://192.168.31.105:8080/api/v1';

export default function RegisterModal({ visible, onClose }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('ROLE_NURSE');
    const [message, setMessage] = useState('');

    const handleRegister = async () => {
        try {
            await axios.post(`${API_BASE}/auth/register`, { username, password, fullName, role });
            setMessage('✅ Tạo tài khoản thành công!');
            setTimeout(() => {
                onClose();
                setUsername(''); setPassword(''); setFullName(''); setRole('ROLE_NURSE'); setMessage('');
            }, 1500);
        } catch (error) {
            setMessage('❌ Lỗi: Tài khoản đã tồn tại!');
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBox}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}><X size={24} color="#64748b" /></TouchableOpacity>

                        <View style={styles.header}>
                            <UserPlus size={24} color="#10b981" style={{ marginRight: 10 }} />
                            <Text style={styles.title}>Thêm nhân sự</Text>
                        </View>

                        {message ? <Text style={styles.message}>{message}</Text> : null}

                        <Text style={styles.label}>Tên đăng nhập</Text>
                        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />

                        <Text style={styles.label}>Mật khẩu</Text>
                        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

                        <Text style={styles.label}>Họ và tên hiển thị</Text>
                        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

                        <Text style={styles.label}>Chức vụ</Text>
                        <View style={styles.roleContainer}>
                            <TouchableOpacity style={[styles.roleBtn, role === 'ROLE_NURSE' && styles.roleActive]} onPress={() => setRole('ROLE_NURSE')}>
                                <Text style={[styles.roleText, role === 'ROLE_NURSE' && styles.roleTextActive]}>Y Tá</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.roleBtn, role === 'ROLE_ADMIN' && styles.roleActive]} onPress={() => setRole('ROLE_ADMIN')}>
                                <Text style={[styles.roleText, role === 'ROLE_ADMIN' && styles.roleTextActive]}>Admin</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.submitBtn} onPress={handleRegister}>
                            <Text style={styles.submitText}>Xác nhận tạo</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalBox: { backgroundColor: 'white', padding: 25, borderRadius: 15, elevation: 10, maxHeight: '90%' },
    closeBtn: { position: 'absolute', top: 0, right: 0, zIndex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
    message: { color: '#047857', backgroundColor: '#d1fae5', padding: 10, borderRadius: 8, marginBottom: 15, fontWeight: 'bold' },
    label: { fontWeight: 'bold', color: '#475569', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, marginBottom: 15, backgroundColor: '#f8fafc' },
    roleContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    roleBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, alignItems: 'center' },
    roleActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
    roleText: { fontWeight: 'bold', color: '#64748b' },
    roleTextActive: { color: 'white' },
    submitBtn: { backgroundColor: '#0ea5e9', padding: 15, borderRadius: 8, alignItems: 'center' },
    submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});