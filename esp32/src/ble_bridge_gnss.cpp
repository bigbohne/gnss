#include <Arduino.h>

/*
 * ============================================================================
 * GNSS Message-Aware BLE Bridge (30-Second Overview)
 * ============================================================================
 * 
 * WHAT IT IS:
 * An ESP32 firmware bridge connecting a hardware GNSS receiver (UART) to a 
 * BLE-enabled client (phone, tablet, PC) using Nordic UART Service (NUS).
 * 
 * CORE FUNCTIONS:
 * 1. GNSS -> BLE (Filtered Stream):
 *    - Reads raw NMEA data from the GNSS module (UART pins 25 TX / 27 RX).
 *    - Buffers and filters sentences, specifically targeting `$GNGGA` (fix data).
 *    - Validates NMEA XOR checksums before notifying the BLE client.
 * 
 * 2. BLE -> GNSS (Pass-Through):
 *    - Receives incoming BLE writes (e.g., RTCM correction data or config commands)
 *      and immediately forwards raw bytes directly to the GNSS module over UART.
 * 
 * 3. Connection & MTU Management:
 *    - Advertises as "GPS RTK Stick" and automatically restarts advertising on disconnect.
 *    - Configures high MTU (up to 512 bytes) for efficient data transfers.
 * ============================================================================
 */

// Client Code: https://github.com/makerdiary/web-device-cli/blob/master/js/app.js

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#include <HardwareSerial.h>

HardwareSerial GNSSReceiver(2);

#define GNSS_RX_PIN 27
#define GNSS_TX_PIN 25

BLEServer *pServer = NULL;
BLECharacteristic *pTxCharacteristic;
bool deviceConnected = false;
bool advertisingStarted = false;
int value = 0;

// UUIDs for the Nordic UART Service (Standard for BLE Serial)
#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E" 
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"


// Definitions
void processByte(char c);
void handleNMEASentence(const String& sentence);
bool verifyChecksum(const String& s);


class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Connected");
    };
    
    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      advertisingStarted = false;
      // Restart advertising to allow re-connection
      Serial.println("Disconnected");
    }

    void onMtuChanged(BLEServer* pServer, esp_ble_gatts_cb_param_t* param) {
      Serial.printf("MTU changed: %d\n", param->mtu.mtu);
    }
};

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      size_t length = pCharacteristic->getLength();
      if (length > 0) {

        // Forward BLE packet to GNSS receiver
        GNSSReceiver.write(pCharacteristic->getData(), pCharacteristic->getLength());

        Serial.print("Received ");
        Serial.print(length);
        Serial.println(" bytes from BLE");
      }
    }
};

void setup() {
  Serial.begin(115200);

  // Create the BLE Device
  BLEDevice::init("GPS RTK Stick");

  BLEDevice::setMTU(512);
  Serial.printf("BLEDevice::getMTU(): %d\n", BLEDevice::getMTU());

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create a BLE Characteristic for TX (Notify)
  pTxCharacteristic = pService->createCharacteristic(
                        CHARACTERISTIC_UUID_TX,
                        BLECharacteristic::PROPERTY_NOTIFY
                      );
  pTxCharacteristic->addDescriptor(new BLE2902());

  // Create a BLE Characteristic for RX (Write)
  BLECharacteristic *pRxCharacteristic = pService->createCharacteristic(
                                           CHARACTERISTIC_UUID_RX,
                                           BLECharacteristic::PROPERTY_WRITE
                                         );
  pRxCharacteristic->setCallbacks(new MyCallbacks());

  // Start the service and advertising
  pService->start();
  advertisingStarted = false;

  GNSSReceiver.begin(115200, SERIAL_8N1, GNSS_RX_PIN, GNSS_TX_PIN);

  Serial.println("Waiting for a client connection...");
}

void loop() {
  if (deviceConnected) {
    // Example: Send a counter value every 2 seconds
    String str = "Count: " + String(value++) + "\n";
    
    delay(2000);
  } else {
    if (!advertisingStarted) {
      delay(1000);
      pServer->startAdvertising();
      pServer->getAdvertising()->start();
      Serial.println("Advertising Started");
      advertisingStarted = true;
    }
  }

  while(GNSSReceiver.available()) {
    char b = GNSSReceiver.read();
    processByte(b);
  }

}


String nmeaBuffer;
bool collecting = false;

void processByte(char c) {
  if (c == '$') {
    // Start of a new NMEA sentence
    collecting = true;
    nmeaBuffer = "$";
    return;
  }

  if (!collecting) return;

  nmeaBuffer += c;

  if (c == '\n') {
    // Full sentence received
    collecting = false;
    handleNMEASentence(nmeaBuffer);
  }
}

void handleNMEASentence(const String& sentence) {
  // Basic check for GNGGA
  if (sentence.startsWith("$GNGGA")) {
    //Serial.println("GNGGA detected:");
    //Serial.println(sentence);

    if (verifyChecksum(sentence)) {
      //Serial.println("Checksum OK - Transmitting via BLE");
      pTxCharacteristic->setValue(sentence.c_str());
      pTxCharacteristic->notify();
    } else {
      Serial.println("Checksum FAIL");
    }
  }
}

// Compute and verify NMEA checksum
bool verifyChecksum(const String& s) {
  int starIndex = s.indexOf('*');
  if (starIndex < 0) return false;

  // Extract transmitted checksum
  String hexChecksum = s.substring(starIndex + 1, starIndex + 3);
  int transmitted = strtol(hexChecksum.c_str(), NULL, 16);

  // Compute checksum of characters between $ and *
  int calc = 0;
  for (int i = 1; i < starIndex; i++) {
    calc ^= s[i];
  }

  return calc == transmitted;
}
