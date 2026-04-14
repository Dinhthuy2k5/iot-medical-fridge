#include <OneWire.h>
#include <DallasTemperature.h>

// ================= CẤU HÌNH CHÂN GPIO =================
// 1. Chân LED 7 thanh
const int segPins[8] = {13, 12, 14, 27, 26, 25, 33, 32}; // A, B, C, D, E, F, G, DP
const int digPins[2] = {22, 23};                         // Chân chọn LED 1 (Chục), LED 2 (Đơn vị)

// 2. Chân cảm biến DS18B20
const int oneWireBus = 4;                                // Chân nối dây Data của cảm biến

// ================= CẤU HÌNH THƯ VIỆN =================
OneWire oneWire(oneWireBus);
DallasTemperature sensors(&oneWire);

// Mảng mã Hex cho LED Chung Dương (Common Anode)
const byte numMap[10] = {
  0xC0, 0xF9, 0xA4, 0xB0, 0x99, 0x92, 0x82, 0xF8, 0x80, 0x90
};

// ================= BIẾN TOÀN CỤC =================
volatile int displayValue = 0;  // Biến lưu nhiệt độ để hiển thị ra LED
volatile int currentDigit = 0;  // Trạng thái quét LED
hw_timer_t * timer = NULL;      // Đối tượng Timer

unsigned long lastTempRequest = 0;
const int tempInterval = 1000;  // Cập nhật nhiệt độ mỗi 1 giây (1000ms)

// ================= HÀM NGẮT TIMER (QUÉT LED) =================
void IRAM_ATTR onTimer() {
  // 1. Tắt cả 2 LED để chống bóng mờ
  digitalWrite(digPins[0], LOW);
  digitalWrite(digPins[1], LOW);

  // 2. Tách số (Ví dụ: 28 độ -> tens = 2, ones = 8)
  int tens = displayValue / 10;
  int ones = displayValue % 10;

  // 3. Lấy mã Hex
  byte segments = (currentDigit == 0) ? numMap[tens] : numMap[ones];

  // 4. Xuất mức logic ra các chân A-G, DP
  for (int i = 0; i < 8; i++) {
    digitalWrite(segPins[i], (segments >> i) & 0x01);
  }

  // 5. Bật LED tương ứng và đảo trạng thái
  digitalWrite(digPins[currentDigit], HIGH);
  currentDigit = 1 - currentDigit;
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);

  // --- Khởi tạo I/O cho LED ---
  for (int i = 0; i < 8; i++) {
    pinMode(segPins[i], OUTPUT);
    digitalWrite(segPins[i], HIGH); 
  }
  for (int i = 0; i < 2; i++) {
    pinMode(digPins[i], OUTPUT);
    digitalWrite(digPins[i], LOW);  
  }

  // --- Khởi tạo DS18B20 ---
  sensors.begin();
  // Lệnh này ép hàm requestTemperatures() không chờ 750ms, giúp ESP32 rảnh rỗi làm việc khác
  sensors.setWaitForConversion(false); 
  sensors.requestTemperatures();
  lastTempRequest = millis();

  // --- Khởi tạo Timer quét LED (Cú pháp Core 3.x) ---
  timer = timerBegin(1000000); 
  timerAttachInterrupt(timer, &onTimer);
  timerAlarm(timer, 5000, true, 0); // Ngắt mỗi 5ms (200Hz)
}

// ================= VÒNG LẶP CHÍNH =================
void loop() {
  // Kiểm tra nếu đã trôi qua 1 giây thì mới đọc nhiệt độ mới
  if (millis() - lastTempRequest >= tempInterval) {
    
    // Đọc giá trị nhiệt độ C
    float tempC = sensors.getTempCByIndex(0);
    
    if (tempC != DEVICE_DISCONNECTED_C) {
      Serial.print("Nhiet do thuc: ");
      Serial.print(tempC);
      Serial.println(" *C");
      
      // Làm tròn nhiệt độ để hiển thị số nguyên trên 2 LED 7 thanh
      int tempInt = round(tempC);
      
      // Giới hạn giá trị hiển thị từ 0 đến 99
      if (tempInt < 0) tempInt = 0;
      if (tempInt > 99) tempInt = 99;
      
      // Cập nhật biến toàn cục (ngắt Timer sẽ tự động lấy giá trị mới này để quét ra màn hình)
      displayValue = tempInt; 
    } else {
      Serial.println("Loi: Khong doc duoc cam bien DS18B20!");
    }
    
    // Gửi tín hiệu yêu cầu cảm biến đo lần tiếp theo
    sensors.requestTemperatures(); 
    lastTempRequest = millis(); // Cập nhật lại mốc thời gian
  }
}