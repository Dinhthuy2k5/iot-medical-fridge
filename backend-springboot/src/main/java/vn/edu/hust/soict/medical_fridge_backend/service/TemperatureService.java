package vn.edu.hust.soict.medical_fridge_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.soict.medical_fridge_backend.dto.TemperaturePayloadDTO;
import vn.edu.hust.soict.medical_fridge_backend.entity.Alert;
import vn.edu.hust.soict.medical_fridge_backend.entity.Device;
import vn.edu.hust.soict.medical_fridge_backend.entity.TemperatureLog;
import vn.edu.hust.soict.medical_fridge_backend.repository.AlertRepository;
import vn.edu.hust.soict.medical_fridge_backend.repository.DeviceRepository;
import vn.edu.hust.soict.medical_fridge_backend.repository.TemperatureLogRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor // Tự động tạo Constructor (Dependency Injection) cho các biến final
@Slf4j
public class TemperatureService {

    // Gọi các phụ bếp (Repository) và bộ phận email
    private final TemperatureLogRepository temperatureLogRepository;
    private final DeviceRepository deviceRepository;
    private final AlertRepository alertRepository;
    private final EmailService emailService;

    // Hàm này sẽ được kích hoạt mỗi khi có gói JSON từ MQTT bay về
    @Transactional
    public void processIncomingTemperature(TemperaturePayloadDTO payload) {
        log.info("📥 Đang xử lý dữ liệu từ thiết bị {}: {}°C", payload.getDeviceId(), payload.getTemperature());

        // 1. Tìm thông tin tủ lạnh trong Database dựa vào mã ID
        Device device = deviceRepository.findById(payload.getDeviceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thiết bị mã: " + payload.getDeviceId()));

        // 2. Tạo bản ghi lịch sử nhiệt độ và lưu vào bảng temperature_logs
        TemperatureLog logEntity = TemperatureLog.builder()
                .device(device)
                .temperature(payload.getTemperature())
                .recordedAt(LocalDateTime.now()) // Thời gian server nhận được bản tin
                .build();
        temperatureLogRepository.save(logEntity);

        // 3. Chuyển sang hành động kiểm tra logic cảnh báo
        checkAndCreateAlert(device, payload.getTemperature());
    }

    // Logic kiểm tra ngưỡng an toàn
    private void checkAndCreateAlert(Device device, Float currentTemp) {
        String alertType = null;
        String message = null;

        // So sánh với ngưỡng cài đặt của tủ lạnh (Ví dụ: 2°C - 8°C)
        if (currentTemp > device.getMaxTemp()) {
            alertType = "HIGH_TEMP";
            message = String.format("Nhiệt độ quá cao: %.1f°C (Ngưỡng tối đa cho phép: %.1f°C)", currentTemp, device.getMaxTemp());
        } else if (currentTemp < device.getMinTemp()) {
            alertType = "LOW_TEMP";
            message = String.format("Nhiệt độ quá thấp: %.1f°C (Ngưỡng tối thiểu cho phép: %.1f°C)", currentTemp, device.getMinTemp());
        }

        // Nếu phát hiện nhiệt độ nằm ngoài vùng an toàn
        if (alertType != null) {
            // Kỹ thuật tránh SPAM Email: Kiểm tra xem tủ lạnh này đã có cảnh báo nào chưa được y tá tắt đi chưa?
            List<Alert> unresolvedAlerts = alertRepository.findByDeviceIdAndIsResolvedFalse(device.getId());

            if (unresolvedAlerts.isEmpty()) {
                // Chưa có cảnh báo nào -> Tạo cảnh báo mới lưu vào DB
                Alert newAlert = Alert.builder()
                        .device(device)
                        .alertType(alertType)
                        .message(message)
                        .isResolved(false) // Mặc định là chưa xử lý
                        .build();
                alertRepository.save(newAlert);

                // Kích hoạt gọi hàm gửi Email khẩn cấp
                emailService.sendAlertEmail(device.getName(), currentTemp, message);
            } else {
                // Đã có cảnh báo rồi thì chỉ ghi log hệ thống, không gửi email nữa tránh làm phiền
                log.info("⚠️ Thiết bị {} vẫn đang báo động. Đã bỏ qua gửi email mới để tránh spam.", device.getId());
            }
        }
    }
}

//Kỹ thuật chống Spam (Anti-spam Logic): Tưởng tượng mạch ESP32 cứ 5 phút
// gửi dữ liệu lên 1 lần. Nếu tủ lạnh bị hỏng qua đêm, hệ thống sẽ bắn hàng
// trăm cái email rác cho y tá. Kỹ thuật unresolvedAlerts.isEmpty() giúp đảm
// bảo hệ thống chỉ gửi đúng 1 email đầu tiên, cho đến khi y tá lên website
// bấm nút "Đã xử lý" thì nó mới được quyền cảnh báo cho lần vi phạm tiếp theo.
// Đây là tư duy thực tế (Practical Logic) cực kỳ ghi điểm cho Đồ án.