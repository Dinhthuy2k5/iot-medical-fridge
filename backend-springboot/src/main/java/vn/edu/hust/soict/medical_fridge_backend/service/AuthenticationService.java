package vn.edu.hust.soict.medical_fridge_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.edu.hust.soict.medical_fridge_backend.dto.AuthenticationRequest;
import vn.edu.hust.soict.medical_fridge_backend.dto.AuthenticationResponse;
import vn.edu.hust.soict.medical_fridge_backend.dto.RegisterRequest;
import vn.edu.hust.soict.medical_fridge_backend.entity.User;
import vn.edu.hust.soict.medical_fridge_backend.repository.UserRepository;
import vn.edu.hust.soict.medical_fridge_backend.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // Gọi công cụ mã hóa BCrypt mà chúng ta đã cấu hình ở ApplicationConfig
    private final PasswordEncoder passwordEncoder;

    // --- TÍNH NĂNG 1: TẠO TÀI KHOẢN MỚI (DÀNH CHO ADMIN) ---
    public AuthenticationResponse register(RegisterRequest request) {
        // 1. Tạo đối tượng User mới
        var user = User.builder()
                .username(request.getUsername())
                // ĐÂY LÀ PHÉP MÀU: Tự động mã hóa mật khẩu trước khi nhét vào User
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .build();

        // 2. Lưu vào Database
        repository.save(user);

        // 3. In Thẻ từ (Token) cho user vừa tạo
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    // --- TÍNH NĂNG 2: ĐĂNG NHẬP (DÀNH CHO Y TÁ) ---
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        var user = repository.findByUsername(request.getUsername())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}