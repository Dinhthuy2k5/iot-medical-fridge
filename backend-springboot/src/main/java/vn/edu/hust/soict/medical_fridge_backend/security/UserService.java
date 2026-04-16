package vn.edu.hust.soict.medical_fridge_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.edu.hust.soict.medical_fridge_backend.dto.UpdateProfileRequest;
import vn.edu.hust.soict.medical_fridge_backend.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public void updateProfile(String username, UpdateProfileRequest request) {
        // 1. Tìm user đang đăng nhập trong cơ sở dữ liệu
        var user = repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // 2. Cập nhật tên hiển thị nếu có nhập
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }

        // 3. Cập nhật và mã hóa mật khẩu mới nếu có nhập
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        // 4. Lưu lại đè lên bản ghi cũ
        repository.save(user);
    }
}