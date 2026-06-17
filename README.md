# Hệ Thống Giám Sát Tủ Lạnh Y Tế IoT

> **Medical Fridge Monitor** - giám sát nhiệt độ tủ vaccine/sinh phẩm y tế theo thời gian thực bằng ESP32, MQTT, Spring Boot, React và Expo.

![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![C++](https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![MQTT](https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=eclipse-mosquitto&logoColor=white)

Hệ thống giúp giám sát, phân tích và cảnh báo nhiệt độ tủ lạnh bảo quản vaccine/sinh phẩm y tế. Thiết bị ESP32 đọc cảm biến DS18B20, gửi dữ liệu qua Wi-Fi lên MQTT Broker HiveMQ; backend Spring Boot nhận dữ liệu, lưu MySQL, phát hiện vượt ngưỡng và gửi cảnh báo cho Web Dashboard/Mobile App.

---

## Tính Năng Nổi Bật

| Tính năng | Mô tả |
|---|---|
| Đọc nhiệt độ thời gian thực | ESP32 đọc cảm biến DS18B20 qua One-Wire và gửi dữ liệu định kỳ. |
| Truyền dữ liệu qua Wi-Fi/MQTT | Firmware publish JSON lên topic `medical_fridge/telemetry`, backend tự động subscribe. |
| Cảnh báo vượt ngưỡng | Backend so sánh nhiệt độ với ngưỡng từng tủ, tạo alert khi quá nóng/quá lạnh. |
| Chống spam cảnh báo | Nếu tủ đang có alert chưa xử lý, hệ thống không gửi email cảnh báo lặp lại. |
| Xác nhận xử lý sự cố | Nhân viên có thể bấm “Đã xử lý” trên Web/Mobile để đóng cảnh báo. |
| Email tự động | Gửi email khi phát hiện sự cố và khi sự cố được xác nhận xử lý. |
| Chẩn đoán đơn giản | Web/Mobile phân tích chuỗi nhiệt độ để gợi ý nguy cơ máy nén yếu, thiếu gas hoặc tủ quá lạnh. |
| Xuất báo cáo CSV trên Web | Web Dashboard hỗ trợ xuất báo cáo CSV. Mobile App đã bỏ tính năng xuất CSV để giao diện gọn hơn. |

---

## Kiến Trúc Hệ Thống

![System Architecture](architecture.svg)

Luồng dữ liệu chính:

```text
ESP32 + DS18B20
  -> MQTT Broker HiveMQ, topic medical_fridge/telemetry
  -> Spring Boot MQTT Subscriber
  -> MySQL: devices, temperature_logs, alerts, users
  -> REST API /api/v1/...
  -> Web React Dashboard và Mobile App Expo
```

---

## Tech Stack

| Lớp | Công nghệ |
|---|---|
| Firmware | C/C++, ESP32 Arduino, DS18B20, OneWire, DallasTemperature, PubSubClient, ArduinoJson |
| Giao tiếp IoT | Wi-Fi, MQTT, HiveMQ public broker |
| Backend | Java 17, Spring Boot, Spring Security, JWT, Spring Data JPA, JavaMailSender |
| Database | MySQL |
| Web Frontend | React, Vite, Axios, Recharts, lucide-react, react-hot-toast |
| Mobile App | React Native, Expo, Expo Router, Axios, AsyncStorage, react-native-chart-kit |
| Docker | Chỉ dùng thử nghiệm, không phải cách chạy chính của project |

---

## Cấu Trúc Thư Mục

```text
iot-medical-fridge
├── backend-springboot/        # REST API, MQTT subscriber, auth, alert logic
├── database/                  # Script khởi tạo dữ liệu MySQL
├── esp32-firmware/            # Firmware ESP32 đọc DS18B20 và publish MQTT
├── frontend-react/            # Web Dashboard React/Vite
├── mobile-app/                # Mobile App React Native/Expo
├── docker-compose.yml         # Chỉ dùng thử nghiệm
├── architecture.svg
└── README.md
```

---

## Cài Đặt Và Chạy Dự Án

### Yêu Cầu

- JDK 17+
- Maven hoặc Maven Wrapper có sẵn trong `backend-springboot`
- MySQL
- Node.js 18+ và npm
- Expo Go trên điện thoại để chạy Mobile App
- Arduino IDE hoặc PlatformIO để nạp firmware ESP32

Docker/Docker Compose có thể dùng để thử nghiệm nhanh, nhưng project này ưu tiên chạy thủ công từng phần.

---

## 1. Clone Repository

```bash
git clone https://github.com/Dinhthuy2k5/iot-medical-fridge.git
cd iot-medical-fridge
```

---

## 2. Cấu Hình Backend Spring Boot

File public `backend-springboot/src/main/resources/application.properties` không chứa thông tin riêng tư. Các giá trị thật được đặt trong file local bị gitignore:

```text
backend-springboot/src/main/resources/application-secrets.properties
```

Tạo file này từ mẫu:

```bash
cp backend-springboot/src/main/resources/application-secrets.properties.example \
   backend-springboot/src/main/resources/application-secrets.properties
```

Trên Windows PowerShell:

```powershell
Copy-Item backend-springboot/src/main/resources/application-secrets.properties.example `
  backend-springboot/src/main/resources/application-secrets.properties
```

Sau đó sửa `application-secrets.properties` theo máy local:

```properties
spring.datasource.password=your_database_password

spring.mail.username=your_email@gmail.com
spring.mail.password=your_gmail_app_password

jwt.secret=replace_with_a_base64_256_bit_secret

app.admin.username=boss_admin
app.admin.password=your_admin_password
app.admin.full-name=Your Admin Name
app.alert.recipient-email=nurse@example.com
```

Ghi chú:

- `jwt.secret` cần là chuỗi Base64 đủ dài cho HS256.
- Tài khoản admin mặc định được bootstrap từ `app.admin.*` nếu database chưa có username đó.
- Email Gmail cần dùng App Password, không dùng mật khẩu Gmail thường.

---

## 3. Chuẩn Bị MySQL

Tạo database local đúng với cấu hình mặc định:

```sql
CREATE DATABASE medical_fridge_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Có thể import dữ liệu mẫu từ:

```text
database/init.sql
```

Nếu bạn dùng database/tên user khác, sửa các dòng sau trong `application.properties` hoặc override trong `application-secrets.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/medical_fridge_db
spring.datasource.username=root
spring.datasource.password=your_database_password
```

---

## 4. Chạy Backend Thủ Công

```bash
cd backend-springboot
./mvnw spring-boot:run
```

Trên Windows PowerShell:

```powershell
cd backend-springboot
.\mvnw.cmd spring-boot:run
```

Backend chạy tại:

```text
http://localhost:8080
```

Các API chính:

| API | Mô tả |
|---|---|
| `POST /api/v1/auth/login` | Đăng nhập, nhận JWT |
| `POST /api/v1/auth/register` | Tạo tài khoản, yêu cầu quyền `ROLE_ADMIN` |
| `GET /api/v1/devices` | Lấy danh sách tủ |
| `GET /api/v1/temperatures/{deviceId}` | Lấy lịch sử nhiệt độ |
| `GET /api/v1/alerts/{deviceId}/unresolved` | Lấy cảnh báo chưa xử lý |
| `PUT /api/v1/alerts/{alertId}/resolve` | Xác nhận đã xử lý cảnh báo |
| `PUT /api/v1/users/profile` | Cập nhật tên/mật khẩu |
| `POST /api/v1/temperatures/simulate` | Gửi dữ liệu giả lập để test backend |

---

## 5. Chạy Web Frontend

```bash
cd frontend-react
npm install
npm run dev
```

Vite thường chạy tại:

```text
http://localhost:5173
```

Web Dashboard gọi backend tại `http://localhost:8080`.

---

## 6. Chạy Mobile App Bằng Expo Go

Mobile App chạy trên điện thoại thật qua Expo Go, nên điện thoại và máy tính chạy backend phải ở cùng một mạng Wi-Fi.

### Bước 1: Cài dependencies

```bash
cd mobile-app
npm install
```

### Bước 2: Tách địa chỉ IP máy tính ra file local

Mobile App không hardcode IP trong mã nguồn nữa. Tạo file local bị gitignore:

```bash
cp .env.example .env.local
```

Trên Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Sửa `.env.local` thành IPv4 LAN của máy tính đang chạy backend:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8080/api/v1
```

Ví dụ cách xem IPv4 trên Windows:

```powershell
ipconfig
```

Tìm dòng `IPv4 Address` của card Wi-Fi đang dùng.

### Bước 3: Khởi động Expo

```bash
npx expo start
```

Mở Expo Go trên điện thoại và quét QR code. Nếu đổi IP/Wi-Fi, sửa lại `.env.local` rồi restart Expo.

---

## 7. Nạp Firmware ESP32

Firmware nằm ở:

```text
esp32-firmware/NBIoT_Monitor/NBIoT_Monitor.ino
```

Thông tin Wi-Fi thật đã được tách khỏi `.ino` sang file local bị gitignore:

```text
esp32-firmware/NBIoT_Monitor/config_private.h
```

Tạo file này từ mẫu:

```bash
cp esp32-firmware/NBIoT_Monitor/config_private.example.h \
   esp32-firmware/NBIoT_Monitor/config_private.h
```

Trên Windows PowerShell:

```powershell
Copy-Item esp32-firmware/NBIoT_Monitor/config_private.example.h `
  esp32-firmware/NBIoT_Monitor/config_private.h
```

Sửa nội dung:

```cpp
#pragma once

#define WIFI_SSID "your_wifi_name"
#define WIFI_PASSWORD "your_wifi_password"
```

Thông số MQTT trong firmware hiện tại:

```cpp
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_topic = "medical_fridge/telemetry";
const char* device_id = "FRIDGE_01";
```

Backend cũng subscribe cùng topic `medical_fridge/telemetry`.

---

## 8. Docker Compose Chỉ Dùng Thử Nghiệm

Repo vẫn giữ `docker-compose.yml` để thử nghiệm nhanh, nhưng đây không phải cách chạy chính của project hiện tại.

```bash
docker-compose up -d
```

Dừng Docker:

```bash
docker-compose down
```

Nếu chạy theo Docker, cần tự kiểm tra lại mapping database/port vì môi trường chính đang dùng local MySQL + backend thủ công + frontend/mobile thủ công.

---

## Ghi Chú Bảo Mật

Các file chứa thông tin riêng tư không được commit:

```text
backend-springboot/src/main/resources/application-secrets.properties
esp32-firmware/NBIoT_Monitor/config_private.h
mobile-app/.env.local
```

Các file mẫu được commit để người khác biết cần cấu hình gì:

```text
backend-springboot/src/main/resources/application-secrets.properties.example
esp32-firmware/NBIoT_Monitor/config_private.example.h
mobile-app/.env.example
```

---

## Người Phát Triển

| Họ và tên | MSSV | Vai trò |
|---|---|---|
| Nguyễn Đình Thủy | 20235437 | Full Stack Developer |

**Môn học:** Project 2 - Trường Đại học Bách Khoa Hà Nội

---

## License

Dự án được phát triển cho mục đích học thuật - Project 2, HUST.