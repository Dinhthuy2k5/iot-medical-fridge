package vn.edu.hust.soict.medical_fridge_backend.mapper;

import org.springframework.stereotype.Component;
import vn.edu.hust.soict.medical_fridge_backend.entity.Alert;
import vn.edu.hust.soict.medical_fridge_backend.entity.TemperatureLog;
import vn.edu.hust.soict.medical_fridge_backend.dto.AlertResponseDTO;
import vn.edu.hust.soict.medical_fridge_backend.dto.TemperatureLogResponseDTO;

@Component
public class DataMapper {

    // Hàm chuyển đổi từ TemperatureLog (Entity) sang TemperatureLogResponseDTO
    public TemperatureLogResponseDTO toTemperatureLogDTO(TemperatureLog entity) {
         if(entity == null){
             return null;
         }

         return TemperatureLogResponseDTO.builder()
                 .id(entity.getId())
                 .deviceId(entity.getDevice().getId())
                 .deviceName(entity.getDevice().getName())
                 .temperature(entity.getTemperature())
                 .recordedAt(entity.getRecordedAt())
                 .build();
    }

    public AlertResponseDTO toAlertDTO(Alert entity) {
        if(entity == null){
            return null;
        }

        return AlertResponseDTO.builder()
                .id(entity.getId())
                .deviceId(entity.getDevice().getId())
                .deviceName(entity.getDevice().getName())
                .alertType(entity.getAlertType())
                .message(entity.getMessage())
                .createdAt(entity.getCreatedAt())
                .isResolved(entity.getIsResolved())
                .build();
    }
}
