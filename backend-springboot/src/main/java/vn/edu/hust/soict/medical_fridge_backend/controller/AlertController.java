package vn.edu.hust.soict.medical_fridge_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.soict.medical_fridge_backend.dto.AlertResponseDTO;
import vn.edu.hust.soict.medical_fridge_backend.entity.Alert;
import vn.edu.hust.soict.medical_fridge_backend.mapper.DataMapper;
import vn.edu.hust.soict.medical_fridge_backend.repository.AlertRepository;
import vn.edu.hust.soict.medical_fridge_backend.service.EmailService; // BỔ SUNG IMPORT NÀY

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/alerts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AlertController {
    private final AlertRepository alertRepository;
    private final DataMapper dataMapper;

    // BỔ SUNG: Khai báo EmailService để sử dụng
    private final EmailService emailService;

    @GetMapping("/{deviceId}/unresolved")
    public List<AlertResponseDTO> getUnresolvedAlerts(@PathVariable String deviceId) {
        return alertRepository.findByDeviceIdAndIsResolvedFalse(deviceId)
                .stream()
                .map(dataMapper::toAlertDTO)
                .collect(Collectors.toList());
    }

    @PutMapping("/{alertId}/resolve")
    public String resolveAlert(@PathVariable Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã cảnh báo này!"));

        // Đổi trạng thái và lưu Database
        alert.setIsResolved(true);
        alertRepository.save(alert);

        // BỔ SUNG LOGIC GỬI EMAIL
        // Lấy tên thiết bị từ thực thể Alert để truyền vào nội dung Email
        String deviceName = alert.getDevice().getName();
        emailService.sendResolvedEmail(deviceName);

        return "✅ Đã tắt cảnh báo thành công!";
    }
}