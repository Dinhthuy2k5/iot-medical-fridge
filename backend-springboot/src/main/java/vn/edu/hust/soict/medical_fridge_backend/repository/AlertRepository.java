package vn.edu.hust.soict.medical_fridge_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.soict.medical_fridge_backend.entity.Alert;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    // Tìm các cảnh báo chưa được xử lý của một tủ lạnh
    List<Alert> findByDeviceIdAndIsResolvedFalse(String deviceId);
}
