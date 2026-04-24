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
        var user = repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }

        // 💡 LOGIC KIỂM TRA MẬT KHẨU MỚI
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            // So sánh mật khẩu cũ nhập vào với mật khẩu lưu trong DB
            if (request.getCurrentPassword() == null ||
                    !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                // Nếu sai, ném ra lỗi để báo về cho Web
                throw new RuntimeException("Mật khẩu hiện tại không chính xác!");
            }
            // Nếu đúng, mã hóa mật khẩu mới và lưu
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        repository.save(user);
    }
}