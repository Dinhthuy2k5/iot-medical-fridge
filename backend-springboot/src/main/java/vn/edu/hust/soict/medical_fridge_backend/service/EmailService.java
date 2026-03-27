package vn.edu.hust.soict.medical_fridge_backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
@Service
@Slf4j // Anotation của Lombok giúp tự động tạo công cụ ghi log
public class EmailService {
    public void sendAlertEmail(String deviceName, Float temp, String message) {
        // Trong tương lai, code gọi API gửi Email thật (như SendGrid hoặc Gmail SMTP) sẽ nằm ở đây

        log.warn("=====================================================");
        log.warn("🚨 [EMAIL KHẨN CẤP] Gửi đến Y tá trực!");
        log.warn("🏥 Tủ lạnh: {}", deviceName);
        log.warn("🌡️ Nhiệt độ hiện tại: {}°C", temp);
        log.warn("⚠️ Vấn đề: {}", message);
        log.warn("=====================================================");
    }
}
