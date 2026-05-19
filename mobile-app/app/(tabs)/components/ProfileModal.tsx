import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { User, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BASE = 'http://192.168.31.107:8080/api/v1';

export default function ProfileModal({ visible, onClose, initialFullName, onUpdateSuccess }) {
    const [editFullName, setEditFullName] = useState('');
    const [currentPassword, setCurrentPassword] = useState(''); // Thêm State cho mật khẩu cũ
    const [editPassword, setEditPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (visible) {
            setEditFullName(initialFullName);
            setCurrentPassword(''); // Reset ô nhập mật khẩu cũ
            setEditPassword('');
            setMessage('');
        }
    }, [visible, initialFullName]);

    const handleUpdate = async () => {
        try {
            // 1. Luôn gửi họ tên lên
            const payload = {
                fullName: editFullName
            };

            // 2. CHÌA KHÓA: Nếu người dùng có nhập mật khẩu mới, bắt buộc phải gửi kèm mật khẩu cũ
            if (editPassword.trim() !== '') {
                payload.currentPassword = currentPassword;
                payload.newPassword = editPassword;
            }

            await axios.put(`${API_BASE}/users/profile`, payload);
            await AsyncStorage.setItem('user_fullName', editFullName);
            setMessage('✅ Cập nhật thành công!');

            setTimeout(() => {
                onUpdateSuccess(editFullName);
                onClose();
            }, 1500);
        } catch (error) {
            // Bắt câu thông báo lỗi từ Spring Boot (Ví dụ: "Mật khẩu hiện tại không chính xác!")
            const errorMsg = error.response?.data?.message || error.response?.data || '❌ Cập nhật thất bại!';
            setMessage(`❌ ${typeof errorMsg === 'string' ? errorMsg : 'Lỗi hệ thống'}`);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBox}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}><X size={24} color="#64748b" /></TouchableOpacity>

                    <View style={styles.header}>
                        <User size={24} color="#0ea5e9" style={{ marginRight: 10 }} />
                        <Text style={styles.title}>Thông tin cá nhân</Text>
                    </View>

                    {message ? (
                        <Text style={[styles.message, message.includes('❌') && styles.errorMessage]}>
                            {message}
                        </Text>
                    ) : null}

                    <Text style={styles.label}>Họ và tên hiển thị</Text>
                    <TextInput style={styles.input} value={editFullName} onChangeText={setEditFullName} />

                    {/* BỔ SUNG Ô NHẬP MẬT KHẨU CŨ Ở ĐÂY */}
                    <Text style={styles.label}>Mật khẩu hiện tại</Text>
                    <TextInput
                        style={styles.input}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                        placeholder="Bắt buộc nhập nếu muốn đổi mật khẩu..."
                    />

                    <Text style={styles.label}>Đổi mật khẩu mới</Text>
                    <TextInput
                        style={styles.input}
                        value={editPassword}
                        onChangeText={setEditPassword}
                        secureTextEntry
                        placeholder="Để trống nếu không muốn đổi..."
                    />

                    <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate}>
                        <Text style={styles.submitText}>Lưu thay đổi</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalBox: { backgroundColor: 'white', padding: 25, borderRadius: 15, elevation: 10 },
    closeBtn: { position: 'absolute', top: 15, right: 15, zIndex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
    message: { color: '#047857', backgroundColor: '#d1fae5', padding: 10, borderRadius: 8, marginBottom: 15, fontWeight: 'bold' },
    errorMessage: { color: '#b91c1c', backgroundColor: '#fee2e2' }, // Đổi màu thông báo khi có lỗi
    label: { fontWeight: 'bold', color: '#475569', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: '#f8fafc' },
    submitBtn: { backgroundColor: '#0ea5e9', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});