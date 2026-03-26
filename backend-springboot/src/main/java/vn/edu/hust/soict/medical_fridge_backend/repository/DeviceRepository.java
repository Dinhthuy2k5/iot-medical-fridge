package vn.edu.hust.soict.medical_fridge_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.soict.medical_fridge_backend.entity.Device;

@Repository
public interface DeviceRepository extends JpaRepository<Device, String> {
    // JpaRepository đã cung cấp sẵn các hàm: findAll(), findById(), save(), delete()
}