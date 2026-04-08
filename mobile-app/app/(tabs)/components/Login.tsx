import axios from 'axios';
import { Activity, AlertCircle, Lock, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SERVER_IP = '192.168.31.105';
const API_BASE = `http://${SERVER_IP}:8080/api/v1`;

export default function Login({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE}/auth/login`, { username, password });
            setToken(response.data.token); // Truyền token lên App tổng
        } catch (err) {
            setError('Tài khoản hoặc mật khẩu không chính xác!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.card}>
                <View style={styles.logoContainer}>
                    <Activity color="#0ea5e9" size={50} />
                    <Text style={styles.title}>Hệ Thống Y Tế</Text>
                    <Text style={styles.subtitle}>Đăng nhập để giám sát thiết bị</Text>
                </View>

                {error ? (
                    <View style={styles.errorBox}>
                        <AlertCircle color="#b91c1c" size={20} style={{ marginRight: 8 }} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tài khoản</Text>
                    <View style={styles.inputContainer}>
                        <User color="#94a3b8" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập tên tài khoản..."
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mật khẩu</Text>
                    <View style={styles.inputContainer}>
                        <Lock color="#94a3b8" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập mật khẩu..."
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text style={styles.loginBtnText}>
                        {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', padding: 20 },
    card: { backgroundColor: 'white', padding: 25, borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
    logoContainer: { alignItems: 'center', marginBottom: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginTop: 10 },
    subtitle: { fontSize: 14, color: '#64748b', marginTop: 5 },
    errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 20 },
    errorText: { color: '#b91c1c', fontWeight: 'bold', flex: 1 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#f8fafc' },
    icon: { marginRight: 10 },
    input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#1e293b' },
    loginBtn: { backgroundColor: '#0ea5e9', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    loginBtnDisabled: { backgroundColor: '#7dd3fc' },
    loginBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});