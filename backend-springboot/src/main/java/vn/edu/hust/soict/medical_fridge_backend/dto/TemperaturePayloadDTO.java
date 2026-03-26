package vn.edu.hust.soict.medical_fridge_backend.dto;

import lombok.Data;

@Data
public class TemperaturePayloadDTO {
    private String deviceId;
    private Float temperature;
}
