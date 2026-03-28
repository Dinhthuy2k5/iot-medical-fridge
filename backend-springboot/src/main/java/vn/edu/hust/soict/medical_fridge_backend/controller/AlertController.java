package vn.edu.hust.soict.medical_fridge_backend.controller;

import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.soict.medical_fridge_backend.dto.AlertResponseDTO;
import vn.edu.hust.soict.medical_fridge_backend.entity.Alert;
import vn.edu.hust.soict.medical_fridge_backend.mapper.DataMapper;
import vn.edu.hust.soict.medical_fridge_backend.repository.AlertRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/alerts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor

public class AlertController {
    private final AlertRepository alertRepository;
    private final DataMapper dataMapper;

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

        alert.setIsResolved(true); // Đổi trạng thái
        alertRepository.save(alert);

        return "✅ Đã tắt cảnh báo thành công!";
    }
}
