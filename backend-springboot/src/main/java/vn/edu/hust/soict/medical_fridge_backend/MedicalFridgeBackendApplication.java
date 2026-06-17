package vn.edu.hust.soict.medical_fridge_backend;

import org.springframework.beans.factory.annotation.Value;
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

    // Bootstrap a local admin once. Real values should live in application-secrets.properties.
    @Bean
    public CommandLineRunner initDatabase(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.username}") String adminUsername,
            @Value("${app.admin.password}") String adminPassword,
            @Value("${app.admin.full-name}") String adminFullName
    ) {
        return args -> {
            if (userRepository.findByUsername(adminUsername).isEmpty()) {
                User admin = User.builder()
                        .username(adminUsername)
                        .password(passwordEncoder.encode(adminPassword))
                        .fullName(adminFullName)
                        .role("ROLE_ADMIN")
                        .build();
                userRepository.save(admin);
                System.out.println("=========================================================");
                System.out.println("Admin account initialized: " + adminUsername);
                System.out.println("=========================================================");
            }
        };
    }
}