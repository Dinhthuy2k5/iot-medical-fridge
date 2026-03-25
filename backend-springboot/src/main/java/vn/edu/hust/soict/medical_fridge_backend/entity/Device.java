package vn.edu.hust.soict.medical_fridge_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "devices")
@Data // Tự động tạo Getter, Setter, toString
@NoArgsConstructor // Tự động tạo Constructor rỗng
@AllArgsConstructor // Tự động tạo Constructor full tham số
@Builder // Giúp khởi tạo object dễ dàng hơn (Design Pattern Builder)

public class Device {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name ="name", nullable = false, length= 100)
    private String name;

    @Column(name ="min_temp")
    private Float minTemp;
    @Column(name ="max_temp")
    private Float maxTemp;

    @Column(name = "status", length=20)
    private String status;
}
