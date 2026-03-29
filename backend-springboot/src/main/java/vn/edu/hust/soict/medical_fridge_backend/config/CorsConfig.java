package vn.edu.hust.soict.medical_fridge_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // Báo cho Spring Boot biết đây là file cấu hình hệ thống
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Áp dụng cho toàn bộ đường dẫn bắt đầu bằng /api/
                .allowedOrigins("*") // Cho phép mọi Frontend gọi tới (Sau này đưa lên thực tế sẽ thay bằng domain thật)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Cho phép các hành động lấy, thêm, sửa, xóa
                .allowedHeaders("*");
    }

}
