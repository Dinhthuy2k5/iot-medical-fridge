package vn.edu.hust.soict.medical_fridge_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TemperatureLogResponseDTO {
    private Long id;
    private String deviceId;
    private String deviceName;
    private Float temperature;
    private LocalDateTime recordedAt;
}
