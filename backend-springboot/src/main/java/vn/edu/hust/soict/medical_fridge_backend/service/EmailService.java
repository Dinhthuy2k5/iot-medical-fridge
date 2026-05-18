package vn.edu.hust.soict.medical_fridge_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    // Công cụ gửi mail được Spring Boot tự động nạp từ application.properties
    private final JavaMailSender mailSender;

    // Giả sử đây là email của y tá trực (bạn thay bằng email thật để test)
    private final String NURSE_EMAIL = "ngdinhthuy2k5@gmail.com";

    public void sendAlertEmail(String deviceName, Float temp, String message) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(NURSE_EMAIL);
            mail.setSubject("🚨 CẢNH BÁO KHẨN CẤP: " + deviceName);

            // Soạn nội dung bức thư
            String mailContent = "HỆ THỐNG GIÁM SÁT TỦ LẠNH Y TẾ\n\n"
                    + "Phát hiện sự cố tại: " + deviceName + "\n"
                    + "Nhiệt độ hiện tại: " + temp + "°C\n"
                    + "Chi tiết vấn đề: " + message + "\n\n"
                    + "Vui lòng kiểm tra và khắc phục sự cố ngay lập tức!";

            mail.setText(mailContent);

            // Bấm nút "Gửi"
            mailSender.send(mail);

            log.info("✅ ĐÃ GỬI EMAIL CẢNH BÁO THÀNH CÔNG ĐẾN: {}", NURSE_EMAIL);

        } catch (Exception e) {
            log.error("❌ Lỗi khi gửi email cảnh báo: {}", e.getMessage());
        }
    }
}