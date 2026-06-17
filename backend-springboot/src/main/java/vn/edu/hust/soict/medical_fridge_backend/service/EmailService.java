package vn.edu.hust.soict.medical_fridge_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.alert.recipient-email}")
    private String nurseEmail;

    public void sendAlertEmail(String deviceName, Float temp, String message) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(nurseEmail);
            mail.setSubject("CẢNH BÁO KHẨN CẤP: " + deviceName);

            String mailContent = "HỆ THỐNG GIÁM SÁT TỦ LẠNH Y TẾ\n\n"
                    + "Phát hiện sự cố tại: " + deviceName + "\n"
                    + "Nhiệt độ hiện tại: " + temp + " do C\n"
                    + "Chi tiết vấn đề: " + message + "\n\n"
                    + "Vui long kiểm tra và khắc phục sự cố ngay lập tức!";

            mail.setText(mailContent);
            mailSender.send(mail);

            log.info("Sent alert email to: {}", nurseEmail);
        } catch (Exception e) {
            log.error("Error sending alert email: {}", e.getMessage());
        }
    }

    public void sendResolvedEmail(String deviceName) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(nurseEmail);
            mail.setSubject("ĐÃ XỬ LÝ SỰ CỐ: " + deviceName);

            String mailContent = "HỆ THỐNG GIÁM SÁT TỦ LẠNH Y TẾ\n\n"
                    + "Sự cố tại thiết bị [" + deviceName + "] đã được xác nhận và xử lý.\n"
                    + "Hệ thống đã tắt báo động trên bảng điều khiển.\n\n"
                    + "Cảm ơn bạn đã theo dõi và đảm bảo an toàn cho tủ y tế!";

            mail.setText(mailContent);
            mailSender.send(mail);

            log.info("Sent resolved email to: {}", nurseEmail);
        } catch (Exception e) {
            log.error("Error sending resolved email: {}", e.getMessage());
        }
    }
}