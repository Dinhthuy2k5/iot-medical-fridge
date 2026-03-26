package vn.edu.hust.soict.medical_fridge_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "temperature_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class TemperatureLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Tự động tăng (Auto Increment)
    private Long id;

    // Quan hệ N-1: Nhiều log nhiệt độ thuộc về 1 thiết bị
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(name ="temperature")
    private Float temperature;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @CreationTimestamp // Tự động lấy giờ hệ thống khi dữ liệu được lưu vào DB
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
