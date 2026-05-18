#include <WiFi.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// ==========================================
// 1. CẤU HÌNH MẠNG (WIFI & MQTT)
// ==========================================
const char* ssid = "XD301";      // <--- SỬA TÊN WIFI Ở ĐÂY
const char* password = "30188888";     // <--- SỬA MẬT KHẨU Ở ĐÂY

const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_topic = "medical_fridge/telemetry";
const char* device_id = "FRIDGE_01"; 

// ==========================================
// 2. CẤU HÌNH CẢM BIẾN DS18B20
// ==========================================
const int ONE_WIRE_BUS = 4; // Khai báo chân GPIO 4 giống hệt sơ đồ của bạn
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsgTime = 0;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Dang ket noi den WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi da ket noi thanh cong!");
  Serial.print("Dia chi IP cua ESP32: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Vòng lặp giữ kết nối MQTT
  while (!client.connected()) {
    Serial.print("Dang thu ket noi den MQTT Broker... ");
    // Tạo một Client ID ngẫu nhiên để không bị trùng lặp
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    // Thử kết nối
    if (client.connect(clientId.c_str())) {
      Serial.println("Thanh cong!");
    } else {
      Serial.print("That bai, ma loi (rc) = ");
      Serial.print(client.state());
      Serial.println(" Thu lai sau 5 giay.");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  sensors.begin(); // Khởi động cảm biến nhiệt độ
  
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  // Đảm bảo luôn duy trì kết nối WiFi và MQTT
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Non-blocking delay: Cứ 10 giây sẽ gửi dữ liệu 1 lần
  unsigned long now = millis();
  if (now - lastMsgTime > 10000) { 
    lastMsgTime = now;

    // Yêu cầu đọc nhiệt độ
    sensors.requestTemperatures(); 
    float tempC = sensors.getTempCByIndex(0);

    // Kiểm tra xem có đọc được lỗi không (thường báo -127 độ C nếu lỏng dây)
    if (tempC != DEVICE_DISCONNECTED_C) {
      // Đóng gói JSON
      StaticJsonDocument<200> doc;
      doc["deviceId"] = device_id;
      // Làm tròn 1 chữ số thập phân (ví dụ 5.2) để gửi lên cho đẹp
      doc["temperature"] = String(tempC, 1).toFloat(); 
      
      char jsonBuffer[256];
      serializeJson(doc, jsonBuffer);

      // In ra Serial Monitor để theo dõi
      Serial.print("Dang gui tin nhan len topic [");
      Serial.print(mqtt_topic);
      Serial.print("]: ");
      Serial.println(jsonBuffer);

      // Đẩy gói tin qua giao thức MQTT
      client.publish(mqtt_topic, jsonBuffer);
      
    } else {
      Serial.println("Loi: Khong tim thay cam bien DS18B20. Kiem tra lai day cam!");
    }
  }
}