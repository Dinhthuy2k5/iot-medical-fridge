package vn.edu.hust.soict.medical_fridge_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.soict.medical_fridge_backend.entity.Device;
import vn.edu.hust.soict.medical_fridge_backend.repository.DeviceRepository;

import java.util.List;

@RestController
@RequestMapping("/api/v1/devices")
@CrossOrigin(origins ="*") // CỰC KỲ QUAN TRỌNG: Cho phép ReactJS (chạy cổng khác) được phép gọi API này
@RequiredArgsConstructor
public class DeviceController {
    private final DeviceRepository deviceRepository;

    @GetMapping
    public List<Device> getAllDevices(){
        // Lấy toàn bộ danh sách thiết bị từ DB trả về cho Web
        return deviceRepository.findAll();
    }
}
