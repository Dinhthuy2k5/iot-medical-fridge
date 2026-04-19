import { Activity, LogOut, User, UserPlus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Header({ fullName, role, onOpenProfile, onOpenRegister, onLogout }) {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.topRow}>
                <Activity color="#0ea5e9" size={28} />
                <Text style={styles.headerTitle}>Giám Sát Tủ Y Tế</Text>
            </View>

            <View style={styles.bottomRow}>
                {/* Khối Profile có thể bấm được */}
                <TouchableOpacity style={styles.profileBox} onPress={onOpenProfile}>
                    <View style={styles.profileTextContainer}>
                        <Text style={styles.fullName}>{fullName}</Text>
                        <Text style={styles.roleText}>
                            {role === 'ROLE_ADMIN' ? '👑 Quản trị viên' : '🩺 Y tá trực'}
                        </Text>
                    </View>
                    <View style={styles.avatar}>
                        <User size={20} color="#475569" />
                    </View>
                </TouchableOpacity>

                {/* Cụm nút bấm */}
                <View style={styles.actionButtons}>
                    {role === 'ROLE_ADMIN' && (
                        <TouchableOpacity style={styles.btnRegister} onPress={onOpenRegister}>
                            <UserPlus size={18} color="white" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.btnLogout} onPress={onLogout}>
                        <LogOut size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: { marginBottom: 20 },
    topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginLeft: 10 },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    profileBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 10, borderRadius: 12, elevation: 2, flex: 1, marginRight: 10 },
    profileTextContainer: { alignItems: 'flex-end', flex: 1, marginRight: 10 },
    fullName: { fontWeight: 'bold', color: '#1e293b', fontSize: 14 },
    roleText: { fontSize: 12, color: '#64748b', marginTop: 2 },
    avatar: { backgroundColor: '#f1f5f9', padding: 8, borderRadius: 20 },
    actionButtons: { flexDirection: 'row', gap: 10 },
    btnRegister: { backgroundColor: '#10b981', padding: 12, borderRadius: 10, elevation: 2 },
    btnLogout: { backgroundColor: '#ef4444', padding: 12, borderRadius: 10, elevation: 2 }
});