package vn.edu.hust.soict.medical_fridge_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.soict.medical_fridge_backend.dto.TemperatureLogResponseDTO;
import vn.edu.hust.soict.medical_fridge_backend.dto.TemperaturePayloadDTO;
import vn.edu.hust.soict.medical_fridge_backend.mapper.DataMapper;
import vn.edu.hust.soict.medical_fridge_backend.repository.TemperatureLogRepository;
import vn.edu.hust.soict.medical_fridge_backend.service.TemperatureService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/temperatures")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TemperatureController {

    private final TemperatureService temperatureService;
    private final TemperatureLogRepository temperatureLogRepository;
    private final DataMapper dataMapper;

    // API 1: Dành cho ReactJS lấy dữ liệu vẽ biểu đồ
    @GetMapping("/{deviceId}")
    public List<TemperatureLogResponseDTO> getLogsByDevice(@PathVariable String deviceId) {
        return temperatureLogRepository.findByDeviceIdOrderByRecordedAtDesc(deviceId)
                .stream()
                .map(dataMapper::toTemperatureLogDTO) // Dùng Mapper để đóng gói Entity thành DTO
                .collect(Collectors.toList());
    }

    // API 2: API Dùng để TEST GIẢ LẬP phần cứng (ESP32)
    @PostMapping("/simulate")
    public String simulateEsp32Data(@RequestBody TemperaturePayloadDTO payload) {
        // Đưa gói dữ liệu giả lập vào bộ não Service để xử lý y như thật
        temperatureService.processIncomingTemperature(payload);
        return "✅ Đã nhận và xử lý dữ liệu giả lập thành công cho thiết bị: " + payload.getDeviceId();
    }
}

