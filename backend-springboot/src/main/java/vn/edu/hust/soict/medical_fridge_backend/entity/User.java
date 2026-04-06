package vn.edu.hust.soict.medical_fridge_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users") // Bảng này sẽ tên là 'users' trong MySQL
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username; // Tên đăng nhập (phải là duy nhất)

    @Column(nullable = false)
    private String password; // Mật khẩu (sau này sẽ được mã hóa giấu đi)

    @Column(nullable = false)
    private String fullName; // Tên hiển thị của y tá/bác sĩ

    @Column(nullable = false)
    private String role; // Chức vụ (Ví dụ: "ROLE_NURSE" hoặc "ROLE_ADMIN")

    // ========================================================================
    // NHỮNG HÀM BÊN DƯỚI LÀ BẮT BUỘC ĐỂ SPRING SECURITY NHẬN DIỆN NGƯỜI DÙNG
    // ========================================================================

    // Hàm này báo cho hệ thống biết người dùng này có quyền hạn (Role) gì
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    // Các hàm dưới đây kiểm tra xem tài khoản có bị khóa hay hết hạn không.
    // Mặc định ta để return true (luôn hoạt động hợp lệ).
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}