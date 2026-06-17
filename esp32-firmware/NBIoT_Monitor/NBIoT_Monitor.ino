#include <WiFi.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>
#include "config_private.h"

const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;

const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_topic = "medical_fridge/telemetry";
const char* device_id = "FRIDGE_01";

const int ONE_WIRE_BUS = 4;
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
  while (!client.connected()) {
    Serial.print("Dang thu ket noi den MQTT Broker... ");
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);

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
  sensors.begin();

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsgTime > 10000) {
    lastMsgTime = now;

    sensors.requestTemperatures();
    float tempC = sensors.getTempCByIndex(0);

    if (tempC != DEVICE_DISCONNECTED_C) {
      StaticJsonDocument<200> doc;
      doc["deviceId"] = device_id;
      doc["temperature"] = String(tempC, 1).toFloat();

      char jsonBuffer[256];
      serializeJson(doc, jsonBuffer);

      Serial.print("Dang gui tin nhan len topic [");
      Serial.print(mqtt_topic);
      Serial.print("]: ");
      Serial.println(jsonBuffer);

      client.publish(mqtt_topic, jsonBuffer);
    } else {
      Serial.println("Loi: Khong tim thay cam bien DS18B20. Kiem tra lai day cam!");
    }
  }
}