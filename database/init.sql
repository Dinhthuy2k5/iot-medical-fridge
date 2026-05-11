SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
USE medical_fridge;

CREATE TABLE devices (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_temp FLOAT DEFAULT 2.0,
    max_temp FLOAT DEFAULT 8.0,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE temperature_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    temperature FLOAT NOT NULL,
    recorded_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_resolved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- =====================
-- DEVICES
-- =====================
INSERT INTO devices (id, name, min_temp, max_temp) VALUES
('FRIDGE_01', 'Tủ Vaccine Khoa Nhi', 2.0, 8.0),
('FRIDGE_02', 'Tủ Sinh Phẩm Khoa Huyết Học', 2.0, 6.0),
('FRIDGE_03', 'Tủ Thuốc Khoa Cấp Cứu', 15.0, 25.0);

-- =====================
-- TEMPERATURE_LOGS - FRIDGE_01 (48 điểm, mỗi 30 phút, 24h qua)
-- Mô phỏng: bình thường ban ngày, tăng bất thường lúc 3h sáng
-- =====================
INSERT INTO temperature_logs (device_id, temperature, recorded_at) VALUES
('FRIDGE_01', 4.2, NOW() - INTERVAL 24 HOUR),
('FRIDGE_01', 4.1, NOW() - INTERVAL 1380 MINUTE),
('FRIDGE_01', 4.3, NOW() - INTERVAL 1350 MINUTE),
('FRIDGE_01', 4.0, NOW() - INTERVAL 1320 MINUTE),
('FRIDGE_01', 4.2, NOW() - INTERVAL 1290 MINUTE),
('FRIDGE_01', 4.1, NOW() - INTERVAL 1260 MINUTE),
('FRIDGE_01', 4.3, NOW() - INTERVAL 1230 MINUTE),
('FRIDGE_01', 4.4, NOW() - INTERVAL 1200 MINUTE),
('FRIDGE_01', 4.2, NOW() - INTERVAL 1170 MINUTE),
('FRIDGE_01', 4.1, NOW() - INTERVAL 1140 MINUTE),
('FRIDGE_01', 4.0, NOW() - INTERVAL 1110 MINUTE),
('FRIDGE_01', 4.3, NOW() - INTERVAL 1080 MINUTE),
-- Bắt đầu tăng bất thường (khoảng 3h sáng)
('FRIDGE_01', 5.1, NOW() - INTERVAL 1050 MINUTE),
('FRIDGE_01', 6.3, NOW() - INTERVAL 1020 MINUTE),
('FRIDGE_01', 7.8, NOW() - INTERVAL 990 MINUTE),
('FRIDGE_01', 9.1, NOW() - INTERVAL 960 MINUTE),  -- vượt ngưỡng
('FRIDGE_01', 9.5, NOW() - INTERVAL 930 MINUTE),  -- vượt ngưỡng
('FRIDGE_01', 8.9, NOW() - INTERVAL 900 MINUTE),  -- vượt ngưỡng
-- Hạ dần về bình thường
('FRIDGE_01', 7.2, NOW() - INTERVAL 870 MINUTE),
('FRIDGE_01', 6.1, NOW() - INTERVAL 840 MINUTE),
('FRIDGE_01', 5.0, NOW() - INTERVAL 810 MINUTE),
('FRIDGE_01', 4.4, NOW() - INTERVAL 780 MINUTE),
('FRIDGE_01', 4.2, NOW() - INTERVAL 750 MINUTE),
('FRIDGE_01', 4.1, NOW() - INTERVAL 720 MINUTE),
('FRIDGE_01', 4.3, NOW() - INTERVAL 690 MINUTE),
('FRIDGE_01', 4.0, NOW() - INTERVAL 660 MINUTE),
('FRIDGE_01', 4.2, NOW() - INTERVAL 630 MINUTE),
('FRIDGE_01', 4.1, NOW() - INTERVAL 600 MINUTE),
('FRIDGE_01', 4.3, NOW() - INTERVAL 570 MINUTE),
('FRIDGE_01', 4.2, NOW() - INTERVAL 540 MINUTE),
('FRIDGE_01', 4.0, NOW() - INTERVAL 510 MINUTE),
('FRIDGE_01', 4.1, NOW() - INTERVAL 480 MINUTE),
('FRIDGE_01', 4.3, NOW() - INTERVAL 450 MINUTE),
('FRIDGE_01', 4.4, NOW() - INTERVAL 420 MINUTE),
('FRIDGE_01', 4.2, NOW() - INTERVAL 390 MINUTE),
('FRIDGE_01', 4.1, NOW() - INTERVAL 360 MINUTE),
('FRIDGE_01', 4.0, NOW() - INTERVAL 330 MINUTE),
('FRIDGE_01', 4.2, NOW() - INTERVAL 300 MINUTE),
('FRIDGE_01', 4.3, NOW() - INTERVAL 270 MINUTE),
('FRIDGE_01', 4.1, NOW() - INTERVAL 240 MINUTE),
('FRIDGE_01', 4.2, NOW() - INTERVAL 210 MINUTE),
('FRIDGE_01', 4.0, NOW() - INTERVAL 180 MINUTE),
('FRIDGE_01', 4.3, NOW() - INTERVAL 150 MINUTE),
('FRIDGE_01', 4.1, NOW() - INTERVAL 120 MINUTE),
('FRIDGE_01', 4.2, NOW() - INTERVAL 90 MINUTE),
('FRIDGE_01', 4.4, NOW() - INTERVAL 60 MINUTE),
('FRIDGE_01', 4.3, NOW() - INTERVAL 30 MINUTE),
('FRIDGE_01', 4.2, NOW());

-- =====================
-- ALERTS - tương ứng với spike nhiệt độ lúc 3h sáng
-- =====================
INSERT INTO alerts (device_id, alert_type, message, is_resolved) VALUES
('FRIDGE_01', 'HIGH_TEMP', 'Nhiệt độ vượt ngưỡng: 9.1°C (ngưỡng tối đa 8.0°C)', TRUE),
('FRIDGE_01', 'HIGH_TEMP', 'Nhiệt độ vượt ngưỡng: 9.5°C (ngưỡng tối đa 8.0°C)', TRUE),
('FRIDGE_01', 'HIGH_TEMP', 'Nhiệt độ vượt ngưỡng: 8.9°C (ngưỡng tối đa 8.0°C)', TRUE);