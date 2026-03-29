package vn.edu.hust.soict.medical_fridge_backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.ObjectMapper;
import vn.edu.hust.soict.medical_fridge_backend.dto.TemperaturePayloadDTO;
import vn.edu.hust.soict.medical_fridge_backend.service.TemperatureService;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class MqttConfig {

    private final TemperatureService temperatureService;
    private final ObjectMapper objectMapper;

    // Sử dụng trạm HiveMQ công cộng, miễn phí để test dự án
    private final String brokerUrl = "tcp://broker.hivemq.com:1883";
    private final String clientId = "SpringBoot_Backend_" + System.currentTimeMillis();

    // ĐÂY LÀ ĐỊA CHỈ NHÀ (TOPIC) MÀ ESP32 PHẢI BẮN DỮ LIỆU VÀO
    private final String topic = "medical_fridge/telemetry";

    @Bean
    public MqttClient mqttClient() {
        try {
            MqttClient client = new MqttClient(brokerUrl, clientId);
            MqttConnectOptions options = new MqttConnectOptions();
            options.setAutomaticReconnect(true); // Tự động kết nối lại nếu rớt mạng
            options.setCleanSession(true);
            options.setConnectionTimeout(10);

            // 1. Thực hiện kết nối tới Broker
            client.connect(options);
            log.info("✅ Đã kết nối thành công tới MQTT Broker: {}", brokerUrl);

            // 2. Đăng ký "lắng nghe" topic
            client.subscribe(topic, (topicName, message) -> {
                String payloadString = new String(message.getPayload());
                log.info("📡 [MQTT] Đã nhận tin nhắn từ ESP32: {}", payloadString);

                try {
                    // Dùng ObjectMapper mở gói JSON ra và nhét vào TemperaturePayloadDTO
                    TemperaturePayloadDTO payloadDTO = objectMapper.readValue(payloadString, TemperaturePayloadDTO.class);

                    // Giao cho Bếp trưởng (TemperatureService) xử lý và lưu Database
                    temperatureService.processIncomingTemperature(payloadDTO);
                } catch (Exception e) {
                    log.error("❌ Lỗi giải mã JSON từ MQTT: {}", e.getMessage());
                }
            });

            return client;
        } catch (MqttException e) {
            log.error("❌ Không thể kết nối tới MQTT Broker", e);
            return null;
        }
    }
}
