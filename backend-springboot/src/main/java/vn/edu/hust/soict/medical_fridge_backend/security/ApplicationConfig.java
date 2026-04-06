package vn.edu.hust.soict.medical_fridge_backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.edu.hust.soict.medical_fridge_backend.repository.UserRepository;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;

    // 1. Dạy Spring cách tìm User trong Database của chúng ta
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng trong hệ thống!"));
    }

    // 2. Chỉ định thuật toán mã hóa mật khẩu là BCrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 3. Lắp ráp các công cụ trên thành một "Cỗ máy xác thực" hoàn chỉnh
    @Bean
    public AuthenticationProvider authenticationProvider() {
        // Đưa userDetailsService() vào ngay trong ngoặc tròn khi khởi tạo (Constructor Injection)
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService());

        // Dòng này giữ nguyên
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    // 4. Công cụ quản lý đăng nhập trung tâm
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}