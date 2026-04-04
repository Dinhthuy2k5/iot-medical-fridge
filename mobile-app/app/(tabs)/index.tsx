// Thêm import RefreshControl ở dòng này
import axios from 'axios';
import { Activity, AlertTriangle, CheckCircle, Info, Thermometer } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// 🔴🔴🔴 THAY ĐỊA CHỈ IP CỦA BẠN VÀO ĐÂY 🔴🔴🔴
const SERVER_IP = '192.168.31.105';
const API_BASE = `http://${SERVER_IP}:8080/api/v1`;

export default function HomeScreen() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [temperatureData, setTemperatureData] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // --- 💡 THAY ĐỔI 1: STATE MỚI ĐỂ QUẢN LÝ VÒNG TRÒN XOAY ---
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchData();
      const interval = setInterval(fetchData, 5000); // Auto-refresh ngầm 5s
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
      if (response.data.length > 0 && !selectedDevice) {
        setSelectedDevice(response.data[0]);
      }
    } catch (error) {
      console.log("Lỗi tải thiết bị: ", error);
    }
  };

  const fetchTemperatureLogs = async (deviceId) => {
    try {
      const response = await axios.get(`${API_BASE}/temperatures/${deviceId}`);
      // Lấy tối đa 10 điểm gần nhất cho khỏi chật màn hình điện thoại
      const formattedData = response.data.slice(0, 10).reverse().map(log => {
        const dateObj = new Date(log.recordedAt);
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        return {
          ...log,
          time: `${hours}:${minutes}` // Ví dụ: "14:05"
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

  // --- 💡 THAY ĐỔI 2: HÀM LOGIC KHI NGƯỜI DÙNG VUỐT XUỐNG ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true); // 1. Hiện vòng tròn xoay
    try {
      await fetchDevices(); // 2. Tải lại danh sách tủ lạnh (để thấy tủ FRIDGE_02 mới)
      if (selectedDevice) {
        // 3. Tải lại dữ liệu của tủ đang chọn
        await Promise.all([
          fetchTemperatureLogs(selectedDevice.id),
          fetchAlerts(selectedDevice.id)
        ]);
      }
    } catch (error) {
      console.log("Refresh failed", error);
    } finally {
      setRefreshing(false); // 4. Ẩn vòng tròn xoay
    }
  }, [selectedDevice]);

  const latestData = temperatureData.length > 0 ? temperatureData[temperatureData.length - 1] : null;
  const isDanger = latestData && selectedDevice &&
    (latestData.temperature < selectedDevice.minTemp || latestData.temperature > selectedDevice.maxTemp);

  return (
    // --- 💡 THAY ĐỔI 3: GẮN REFRESHCONTROL VÀO SCROLLVIEW CHÍNH ---
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#e90e86']} // Màu vòng tròn trên Android
          tintColor={'#e90e6d'} // Màu vòng tròn trên iOS
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Activity color="#0ea5e9" size={28} />
        <Text style={styles.headerTitle}>Giám Sát Tủ Lạnh Y Tế</Text>
      </View>

      {/* Chọn thiết bị (Vuốt ngang) */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.sectionTitle}>Chọn thiết bị:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {devices.map(device => (
            <TouchableOpacity
              key={device.id}
              style={[styles.deviceBtn, selectedDevice?.id === device.id && styles.deviceBtnActive]}
              onPress={() => setSelectedDevice(device)}
            >
              <Text style={[styles.deviceBtnText, selectedDevice?.id === device.id && styles.deviceBtnTextActive]}>
                {device.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cảnh báo đỏ */}
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

      {/* Thẻ trạng thái */}
      {selectedDevice && latestData ? (
        <View style={styles.statusCardsContainer}>
          <View style={styles.statusCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Thermometer color="#64748b" size={16} />
              <Text style={styles.cardLabel}>Nhiệt độ hiện tại</Text>
            </View>
            <Text style={[styles.cardValue, { color: isDanger ? '#ef4444' : '#10b981' }]}>
              {latestData.temperature}°C
            </Text>
          </View>

          <View style={[styles.statusCard, { backgroundColor: isDanger ? '#fef2f2' : '#ecfdf5', borderColor: isDanger ? '#fca5a5' : '#6ee7b7', borderWidth: 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Info color={isDanger ? '#b91c1c' : '#047857'} size={16} />
              <Text style={[styles.cardLabel, { color: isDanger ? '#b91c1c' : '#047857' }]}>Trạng thái</Text>
            </View>
            <Text style={[styles.cardValue, { color: isDanger ? '#ef4444' : '#10b981', fontSize: 18 }]}>
              {isDanger ? 'NGUY HIỂM' : 'BÌNH THƯỜNG'}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Biểu đồ */}
      {temperatureData.length > 0 ? (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Lịch sử biến động</Text>
          <LineChart
            data={{
              labels: temperatureData.map(d => d.time),
              datasets: [{ data: temperatureData.map(d => d.temperature) }]
            }}
            width={Dimensions.get("window").width - 30}
            height={220}
            yAxisSuffix="°C"
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              propsForDots: { r: "5", strokeWidth: "2", stroke: "#0ea5e9" }
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </View>
      ) : null}

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 15, paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginLeft: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#475569', marginBottom: 10 },
  deviceBtn: { paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#e2e8f0', borderRadius: 20, marginRight: 10 },
  deviceBtnActive: { backgroundColor: '#0ea5e9' },
  deviceBtnText: { color: '#475569', fontWeight: 'bold' },
  deviceBtnTextActive: { color: 'white' },
  statusCardsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statusCard: { flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 12, marginRight: 10, elevation: 2 },
  cardLabel: { fontSize: 13, color: '#64748b', marginLeft: 5 },
  cardValue: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  alertBox: { backgroundColor: '#fee2e2', padding: 15, borderRadius: 8, borderLeftWidth: 5, borderLeftColor: '#ef4444', marginBottom: 20 },
  alertTitle: { color: '#b91c1c', fontWeight: 'bold', fontSize: 16 },
  alertMessage: { color: '#7f1d1d', marginTop: 3 },
  resolveBtn: { backgroundColor: '#ef4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 6, marginTop: 10 },
  chartContainer: { backgroundColor: 'white', padding: 15, borderRadius: 12, elevation: 2 }
});