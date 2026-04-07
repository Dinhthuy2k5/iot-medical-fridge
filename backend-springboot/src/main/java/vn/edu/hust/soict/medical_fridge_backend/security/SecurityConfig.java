package vn.edu.hust.soict.medical_fridge_backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // 1. CHỈ MỞ CỬA TỰ DO DUY NHẤT CHO ĐĂNG NHẬP
                        .requestMatchers("/api/v1/auth/login").permitAll()

                        // 2. KHÓA CỬA ĐĂNG KÝ: CHỈ CÓ TÀI KHOẢN MANG CHỨC VỤ 'ROLE_ADMIN' MỚI ĐƯỢC VÀO
                        .requestMatchers("/api/v1/auth/register").hasAuthority("ROLE_ADMIN")

                        // 3. Các API lấy nhiệt độ, lấy thiết bị... thì ai có Token (đã đăng nhập) cũng vào được
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}