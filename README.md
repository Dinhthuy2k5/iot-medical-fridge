# 🏥 Hệ Thống Giám Sát Tủ Lạnh Y Tế NB-IoT

> **Medical Fridge Monitor** — Giám sát nhiệt độ Vaccine & Sinh phẩm y tế theo thời gian thực

![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![C++](https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![MQTT](https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=eclipse-mosquitto&logoColor=white)

Hệ thống IoT toàn diện giúp **giám sát, phân tích và cảnh báo** nhiệt độ tủ lạnh bảo quản Vaccine/Sinh phẩm y tế theo thời gian thực. Dự án được thiết kế với kiến trúc phân tán, tính sẵn sàng cao và giao diện chuẩn B2B (doanh nghiệp).

---

## ✨ Tính Năng Nổi Bật

| Tính năng | Mô tả |
|---|---|
| 📡 **Kết nối NB-IoT độc lập** | Sử dụng SIM7020C trên nền 4G NB-IoT, đảm bảo truyền dữ liệu thông suốt ngay cả khi hạ tầng mạng bệnh viện gặp sự cố |
| 🚨 **Cảnh báo đa kênh** | Tự động phát hiện bất thường, gửi thông báo qua Dashboard (Web/Mobile) và Email khẩn cấp đến nhân viên y tế trực ban |
| ✅ **Xác nhận xử lý sự cố** | Nhân viên xác nhận "Đã xử lý" để đồng bộ trạng thái toàn hệ thống |
| 🧠 **Chẩn đoán thông minh** | Phân tích lịch sử nhiệt độ để cảnh báo sớm hao mòn phần cứng (yếu gas, hở gioăng, nguy cơ đóng băng sinh phẩm) |
| 📊 **Xuất báo cáo tự động** | Trích xuất báo cáo dạng CSV/Excel trực tiếp trên Web hoặc Mobile, hỗ trợ chia sẻ nhanh qua Zalo/Telegram |

---

## 🏗️ Kiến Trúc Hệ Thống

Hệ thống được tổ chức theo **4 lớp** tách biệt rõ ràng:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 4 │  Frontend           React Web Dashboard          │
│          │                     React Native Mobile App      │
├─────────────────────────────────────────────────────────────┤
│  Layer 3 │  Backend Services   Spring Boot REST API         │
│          │                     JWT Auth · Email · Logic     │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 │  Message Broker     MQTT (HiveMQ)                │
├─────────────────────────────────────────────────────────────┤
│  Layer 1 │  Edge Device        ESP32 + Cảm biến nhiệt độ   │
│          │                     SIM7020C NB-IoT              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Lớp | Công nghệ |
|---|---|
| **Firmware (Edge)** | C/C++, ESP32, SIM7020C (NB-IoT) |
| **Message Broker** | MQTT — HiveMQ |
| **Backend** | Java Spring Boot, Spring Security, JWT, JavaMailSender |
| **Database** | MySQL |
| **Web Frontend** | ReactJS, Recharts |
| **Mobile App** | React Native (Expo) |
| **DevOps** | Docker, Docker Compose |

---

## 📂 Cấu Trúc Thư Mục

```text
📦 iot-medical-fridge
 ┣ 📂 backend-springboot        # REST API, MQTT Subscriber, logic nghiệp vụ
 ┣ 📂 database                  # Script khởi tạo cơ sở dữ liệu (SQL)
 ┣ 📂 esp32 firmware/NBIoT_...  # Mã nguồn C++ nạp cho vi điều khiển ESP32
 ┣ 📂 frontend-react            # Giao diện Web Dashboard (ReactJS)
 ┣ 📂 mobile-app                # Ứng dụng di động Android/iOS (React Native)
 ┣ 📄 docker-compose.yml        # Triển khai nhanh Database & MQTT Broker
 ┗ 📄 README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu hệ thống

- **Docker** & **Docker Compose** (để chạy Database + MQTT Broker)
- **JDK 17+** & **Maven** (nếu chạy Backend thủ công)
- **Node.js 18+** & **npm** (cho Web Frontend và Mobile App)
- **Expo Go** trên điện thoại (để chạy Mobile App)

---

### 1. Khởi động Database & MQTT Broker (Docker)

```bash
docker-compose up -d
```

Lệnh này sẽ khởi tạo tự động:
- MySQL database tại port `3306`
- HiveMQ MQTT Broker tại port `1883`

---

### 2. Khởi động Backend (Spring Boot)

```bash
cd backend-springboot
mvn spring-boot:run
```

> Backend mặc định chạy tại: `http://localhost:8080`

---

### 3. Cấu Hình Môi Trường Backend

Nếu chạy thủ công bằng IDE (IntelliJ IDEA, Eclipse...), chỉnh sửa file `backend-springboot/src/main/resources/application.properties`:

**Cấu hình MySQL:**

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/medical_fridge_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_DATABASE_PASSWORD
```

**Cấu hình Gmail SMTP** (yêu cầu [App Password](https://myaccount.google.com/apppasswords) 16 ký tự):

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=xxxx xxxx xxxx xxxx
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

---

### 4. Khởi động Web Frontend (React)

> ⚠️ **Lưu ý:** Docker Compose chỉ quản lý Database và MQTT Broker. Web Frontend được cung cấp Dockerfile riêng để build image.

```bash
cd frontend-react
npm install
npm start
```

> Web Dashboard chạy tại: `http://localhost:3000`

---

### 5. Cài Đặt & Chạy Mobile App (React Native + Expo)

Mobile App chạy **độc lập** ngoài Docker thông qua nền tảng Expo.

**Bước 1:** Di chuyển vào thư mục mobile app

```bash
cd mobile-app
```

**Bước 2:** Cài đặt dependencies

```bash
npm install
```

**Bước 3:** Cài thêm các Expo package hỗ trợ xuất file và chia sẻ

```bash
npx expo install expo-file-system expo-sharing
```

**Bước 4:** Cấu hình địa chỉ IP Backend

Mở file `app/(tabs)/components/Dashboard.tsx`, tìm hằng số `SERVER_IP` và cập nhật địa chỉ IPv4 LAN của máy đang chạy Backend:

```typescript
const SERVER_IP = '192.168.x.x'; // Thay bằng IP LAN thực tế của bạn
```

**Bước 5:** Khởi động Expo

```bash
npx expo start
```

**Bước 6:** Mở app trên điện thoại

> ⚠️ Đảm bảo điện thoại và máy tính đang **cùng một mạng Wi-Fi**.

- **Android:** Mở ứng dụng **Expo Go** → chọn *Scan QR Code* → quét mã QR hiển thị trên Terminal
- **iOS:** Dùng **Camera** mặc định quét mã QR → bấm link mở trong **Expo Go**

---

## 📸 Giao Diện

> *(Thêm ảnh chụp màn hình Web Dashboard và Mobile App vào đây)*

---

## 👥 Đội Ngũ Phát Triển

> *(Thêm thông tin thành viên nhóm vào đây)*

| Thành viên | Vai trò | GitHub |
|---|---|---|
| — | — | — |

---

## 📄 License

Dự án được phát triển cho mục đích học thuật.