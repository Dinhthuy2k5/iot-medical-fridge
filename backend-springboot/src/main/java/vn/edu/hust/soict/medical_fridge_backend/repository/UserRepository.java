package vn.edu.hust.soict.medical_fridge_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hust.soict.medical_fridge_backend.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Hàm siêu tốc: Tìm người dùng dựa trên tên đăng nhập
    Optional<User> findByUsername(String username);
}