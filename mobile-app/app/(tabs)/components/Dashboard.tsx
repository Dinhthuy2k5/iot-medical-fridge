import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Activity, AlertTriangle, CheckCircle, Download, Info, Thermometer } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// Tách biệt hoàn toàn các file phụ trợ theo cấu trúc chuẩn
import Header from './Header';
import ProfileModal from './ProfileModal';
import RegisterModal from './RegisterModal';

const SERVER_IP = '192.168.31.107';
const API_BASE = `http://${SERVER_IP}:8080/api/v1`;

export default function Dashboard({ onLogout }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('');

    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [temperatureData, setTemperatureData] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadUserProfile();
        fetchDevices();
    }, []);

    const loadUserProfile = async () => {
        const storedName = await AsyncStorage.getItem('user_fullName');
        const storedRole = await AsyncStorage.getItem('user_role');
        if (storedName) setFullName(storedName);
        if (storedRole) setRole(storedRole);
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('user_fullName');
        await AsyncStorage.removeItem('user_role');
        onLogout();
    };

    useEffect(() => {
        if (selectedDevice) {
            fetchData();
            const interval = setInterval(fetchData, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedDevice]);

    const fetchData = () => {
        fetchTemperatureLogs(selectedDevice.id);
        fetchAlerts(selectedDevice.id);
    };

    const fetchDevices = async () => {
        try {
            const response = await axios.get(`${API_BASE}/devices`);
            setDevices(response.data);
            if (response.data.length > 0 && !selectedDevice) setSelectedDevice(response.data[0]);
        } catch (error) {
            console.log("Lỗi tải thiết bị: ", error);
        }
    };

    const fetchTemperatureLogs = async (deviceId) => {
        try {
            const response = await axios.get(`${API_BASE}/temperatures/${deviceId}`);
            const formattedData = response.data.slice(0, 30).reverse().map(log => {
                const dateObj = new Date(log.recordedAt);
                return {
                    ...log,
                    time: `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`,
                    fullTime: `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`
                };
            });
            setTemperatureData(formattedData);
        } catch (error) {
            console.log("Lỗi tải nhiệt độ: ", error);
        }
    };

    const fetchAlerts = async (deviceId) => {
        try {
            const response = await axios.get(`${API_BASE}/alerts/${deviceId}/unresolved`);
            setAlerts(response.data);
        } catch (error) {
            console.log("Lỗi tải cảnh báo: ", error);
        }
    };

    const handleResolveAlert = async (alertId) => {
        try {
            await axios.put(`${API_BASE}/alerts/${alertId}/resolve`);
            Alert.alert("Thành công", "Đã xác nhận xử lý sự cố!");
            fetchAlerts(selectedDevice.id);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tắt cảnh báo");
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchDevices();
            if (selectedDevice) {
                await Promise.all([fetchTemperatureLogs(selectedDevice.id), fetchAlerts(selectedDevice.id)]);
            }
        } catch (error) { }
        finally { setRefreshing(false); }
    }, [selectedDevice]);

    // ==============================================================
    // [ĐÃ SỬA LỖI XUẤT FILE]: Bỏ tham số encoding gây lỗi undefined
    // ==============================================================
    const handleExportCSV = async () => {
        if (temperatureData.length === 0) {
            Alert.alert("Thông báo", "Không có dữ liệu để xuất báo cáo.");
            return;
        }

        try {
            const temps = temperatureData.map(d => parseFloat(d.temperature));
            const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
            let dangerCount = 0;
            temperatureData.forEach(d => {
                if (d.temperature < selectedDevice.minTemp || d.temperature > selectedDevice.maxTemp) dangerCount++;
            });

            let csvContent = "\ufeffBÁO CÁO PHÂN TÍCH HIỆU SUẤT TỦ LẠNH Y TẾ\n";
            csvContent += `Thiết bị:,${selectedDevice.name}\n`;
            csvContent += `Nhiệt độ trung bình:,${avgTemp}°C\n`;
            csvContent += `Số lần vi phạm an toàn:,${dangerCount} lần\n`;
            csvContent += `-------------------------------------------\n`;
            csvContent += "Thời gian đo,Nhiệt độ (°C),Trạng thái\n";

            temperatureData.forEach(row => {
                const status = (row.temperature < selectedDevice.minTemp || row.temperature > selectedDevice.maxTemp) ? "VƯỢT NGƯỠNG" : "An toàn";
                csvContent += `${row.fullTime},${row.temperature},${status}\n`;
            });

            // Sử dụng cacheDirectory
            const fileUri = FileSystem.cacheDirectory + `BaoCao_${selectedDevice.id}.csv`;

            // Đã sửa lại đúng chính tả: writeAsStringAsync
            await FileSystem.writeAsStringAsync(fileUri, csvContent);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, { dialogTitle: 'Gửi báo cáo tủ lạnh', mimeType: 'text/csv' });
            } else {
                Alert.alert("Lỗi", "Thiết bị không hỗ trợ chia sẻ file.");
            }
        } catch (error) {
            console.error("Lỗi xuất file:", error);
            Alert.alert("Lỗi", "Không thể tạo file báo cáo. Vui lòng thử lại.");
        }
    };

    const latestData = temperatureData.length > 0 ? temperatureData[temperatureData.length - 1] : null;
    const isDanger = latestData && selectedDevice && (latestData.temperature < selectedDevice.minTemp || latestData.temperature > selectedDevice.maxTemp);

    // ==============================================================
    // [ĐÃ SỬA LỖI MẤT TRỤC Y]: Khắc phục bug của react-native-chart-kit
    // ==============================================================
    const chartDisplayData = temperatureData.slice(-8);
    let chartValues = chartDisplayData.map(d => parseFloat(d.temperature));

    // Nếu tất cả các điểm nhiệt độ ĐỀU BẰNG NHAU (Đường thẳng tắp)
    if (chartValues.length > 0 && chartValues.every(val => val === chartValues[0])) {
        // Cộng/trừ đi một lượng cực nhỏ (0.1 độ) để tạo ra độ lệch (Variance).
        // Nhờ vậy Chart Kit mới chia được khoảng cách và hiện ra Trục Y!
        chartValues[0] += 0.1;
        chartValues[chartValues.length - 1] -= 0.1;
    }

    let diagnosticMsg = "Hệ thống hoạt động ổn định.";
    if (temperatureData.length > 0 && selectedDevice) {
        const temps = temperatureData.map(d => parseFloat(d.temperature));
        const maxTemp = Math.max(...temps);
        const minTemp = Math.min(...temps);
        if (isDanger) diagnosticMsg = "NGUY HIỂM: Phát hiện vượt ngưỡng an toàn!";
        else if (maxTemp >= selectedDevice.maxTemp - 0.5) diagnosticMsg = "LƯU Ý: Nhiệt độ trung bình cao, dấu hiệu máy lạnh yếu.";
        else if (minTemp <= selectedDevice.minTemp + 0.5) diagnosticMsg = "LƯU Ý: Tủ quá lạnh, nguy cơ hỏng protein.";
    }

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0ea5e9']} />}>

            <Header fullName={fullName} role={role} onOpenProfile={() => setIsProfileOpen(true)} onOpenRegister={() => setIsRegisterOpen(true)} onLogout={handleLogout} />
            <ProfileModal visible={isProfileOpen} onClose={() => setIsProfileOpen(false)} initialFullName={fullName} onUpdateSuccess={(newName) => setFullName(newName)} />
            <RegisterModal visible={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />

            <View style={{ marginBottom: 15 }}>
                <Text style={styles.sectionTitle}>Chọn thiết bị giám sát:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {devices.map(device => (
                        <TouchableOpacity key={device.id} style={[styles.deviceBtn, selectedDevice?.id === device.id && styles.deviceBtnActive]} onPress={() => setSelectedDevice(device)}>
                            <Text style={[styles.deviceBtnText, selectedDevice?.id === device.id && styles.deviceBtnTextActive]}>{device.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {alerts.map(alert => (
                <View key={alert.id} style={styles.alertBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <AlertTriangle color="#ef4444" size={24} style={{ marginRight: 10 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.alertTitle}>CẢNH BÁO KHẨN CẤP</Text>
                            <Text style={styles.alertMessage}>{alert.message}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolveAlert(alert.id)}>
                        <CheckCircle color="white" size={16} style={{ marginRight: 5 }} />
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>ĐÃ XỬ LÝ SỰ CỐ</Text>
                    </TouchableOpacity>
                </View>
            ))}

            {selectedDevice && latestData ? (
                <View style={{ marginBottom: 20 }}>
                    <View style={styles.statusCardsContainer}>
                        <View style={styles.statusCard}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Thermometer color="#64748b" size={16} />
                                <Text style={styles.cardLabel}>Nhiệt độ</Text>
                            </View>
                            <Text style={[styles.cardValue, { color: isDanger ? '#ef4444' : '#0ea5e9' }]}>{latestData.temperature}°C</Text>
                        </View>
                        <View style={[styles.statusCard, { backgroundColor: isDanger ? '#fef2f2' : '#ecfdf5', borderColor: isDanger ? '#fca5a5' : '#6ee7b7', borderWidth: 1 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Info color={isDanger ? '#b91c1c' : '#047857'} size={16} />
                                <Text style={[styles.cardLabel, { color: isDanger ? '#b91c1c' : '#047857' }]}>Trạng thái</Text>
                            </View>
                            <Text style={[styles.cardValue, { color: isDanger ? '#b91c1c' : '#047857', fontSize: 16 }]}>{isDanger ? 'NGUY HIỂM' : 'AN TOÀN'}</Text>
                        </View>
                    </View>

                    <View style={[styles.diagnosticBox, isDanger ? styles.diagDanger : styles.diagSafe]}>
                        <Activity color={isDanger ? "#ef4444" : "#0ea5e9"} size={16} style={{ marginRight: 8 }} />
                        <Text style={{ flex: 1, fontSize: 13, color: isDanger ? "#b91c1c" : "#334155", fontWeight: '500' }}>
                            {diagnosticMsg}
                        </Text>
                    </View>
                </View>
            ) : null}

            {chartDisplayData.length > 0 ? (
                <View style={styles.chartContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Lịch sử biến động</Text>

                        <TouchableOpacity style={styles.exportBtn} onPress={handleExportCSV}>
                            <Download size={14} color="#0ea5e9" style={{ marginRight: 5 }} />
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0ea5e9' }}>Xuất CSV</Text>
                        </TouchableOpacity>
                    </View>

                    <LineChart
                        data={{
                            labels: chartDisplayData.map((d, i) => i % 2 === 0 ? d.time : ""),
                            datasets: [{ data: chartValues }]
                        }}
                        width={Dimensions.get("window").width - 30}
                        height={200}
                        yAxisSuffix="°C"
                        withInnerLines={true}
                        chartConfig={{
                            backgroundColor: "#ffffff",
                            backgroundGradientFrom: "#ffffff",
                            backgroundGradientTo: "#ffffff",
                            decimalPlaces: 1,
                            color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                            propsForDots: { r: "4", strokeWidth: "2", stroke: "#0ea5e9" },
                            propsForLabels: { fontSize: 10 }
                        }}
                        bezier
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                </View>
            ) : null}

            <View style={{ height: 80 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', padding: 15, paddingTop: 50 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
    deviceBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'white', borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    deviceBtnActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
    deviceBtnText: { color: '#64748b', fontWeight: 'bold' },
    deviceBtnTextActive: { color: 'white' },
    statusCardsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    statusCard: { flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 12, marginRight: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    cardLabel: { fontSize: 13, color: '#64748b', marginLeft: 5, fontWeight: 'bold' },
    cardValue: { fontSize: 28, fontWeight: '900', marginTop: 10 },
    diagnosticBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1 },
    diagSafe: { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' },
    diagDanger: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
    alertBox: { backgroundColor: '#fee2e2', padding: 15, borderRadius: 12, borderLeftWidth: 5, borderLeftColor: '#ef4444', marginBottom: 20, elevation: 2 },
    alertTitle: { color: '#b91c1c', fontWeight: '900', fontSize: 16 },
    alertMessage: { color: '#7f1d1d', marginTop: 3, fontWeight: '500' },
    resolveBtn: { backgroundColor: '#ef4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, marginTop: 10 },
    chartContainer: { backgroundColor: 'white', padding: 15, borderRadius: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    exportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f9ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#bae6fd' }
});