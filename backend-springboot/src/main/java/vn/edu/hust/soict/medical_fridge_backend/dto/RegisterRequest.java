package vn.edu.hust.soict.medical_fridge_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String username;
    private String password; // Mật khẩu chưa mã hóa (Gốc)
    private String fullName;
    private String role;     // Ví dụ: "ROLE_NURSE", "ROLE_DOCTOR", "ROLE_ADMIN"
}