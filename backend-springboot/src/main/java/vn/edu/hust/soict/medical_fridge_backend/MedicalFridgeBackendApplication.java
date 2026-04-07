package vn.edu.hust.soict.medical_fridge_backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.edu.hust.soict.medical_fridge_backend.entity.User;
import vn.edu.hust.soict.medical_fridge_backend.repository.UserRepository;

@SpringBootApplication
public class MedicalFridgeBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedicalFridgeBackendApplication.class, args);
    }

    // ĐOẠN CODE NÀY SẼ TỰ ĐỘNG CHẠY 1 LẦN DUY NHẤT KHI BẬT SERVER
    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Kiểm tra xem đã có tài khoản sếp tổng chưa
            if (userRepository.findByUsername("boss_admin").isEmpty()) {
                User admin = User.builder()
                        .username("boss_admin")
                        // Tự động mã hóa chuẩn 100% bằng BCrypt
                        .password(passwordEncoder.encode("123456"))
                        .fullName("Giám Đốc IT Hữu Khánh")
                        .role("ROLE_ADMIN")
                        .build();
                userRepository.save(admin);
                System.out.println("=========================================================");
                System.out.println("✅ ĐÃ TỰ ĐỘNG KHỞI TẠO ADMIN: boss_admin / 123456");
                System.out.println("=========================================================");
            }
        };
    }
}