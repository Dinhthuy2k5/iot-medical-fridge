import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { User, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BASE = 'http://192.168.31.105:8080/api/v1';

export default function ProfileModal({ visible, onClose, initialFullName, onUpdateSuccess }) {
    const [editFullName, setEditFullName] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (visible) {
            setEditFullName(initialFullName);
            setEditPassword('');
            setMessage('');
        }
    }, [visible, initialFullName]);

    const handleUpdate = async () => {
        try {
            await axios.put(`${API_BASE}/users/profile`, {
                fullName: editFullName,
                newPassword: editPassword
            });
            await AsyncStorage.setItem('user_fullName', editFullName);
            setMessage('✅ Cập nhật thành công!');

            setTimeout(() => {
                onUpdateSuccess(editFullName); // Cập nhật lại UI ở Dashboard
                onClose();
            }, 1500);
        } catch (error) {
            setMessage('❌ Cập nhật thất bại!');
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

                    {message ? <Text style={styles.message}>{message}</Text> : null}

                    <Text style={styles.label}>Họ và tên hiển thị</Text>
                    <TextInput style={styles.input} value={editFullName} onChangeText={setEditFullName} />

                    <Text style={styles.label}>Đổi mật khẩu mới</Text>
                    <TextInput style={styles.input} value={editPassword} onChangeText={setEditPassword} secureTextEntry placeholder="Để trống nếu giữ nguyên..." />

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
    label: { fontWeight: 'bold', color: '#475569', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: '#f8fafc' },
    submitBtn: { backgroundColor: '#0ea5e9', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});