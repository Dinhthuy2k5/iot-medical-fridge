package vn.edu.hust.soict.medical_fridge_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.soict.medical_fridge_backend.entity.TemperatureLog;
import java.util.List;

@Repository
public interface TemperatureLogRepository extends JpaRepository<TemperatureLog, Long> {
    // Tìm tất cả lịch sử nhiệt độ của 1 tủ lạnh cụ thể, sắp xếp từ mới nhất đến cũ nhất
    List<TemperatureLog> findByDeviceIdOrderByRecordedAtDesc(String deviceId);
}
