# GNSS Message-Aware BLE Bridge

An ESP32 firmware bridge connecting a hardware GNSS receiver (UART) to a BLE-enabled client (phone, tablet, PC) using Nordic UART Service (NUS).

## Core Functions

1. **GNSS $\rightarrow$ BLE (Filtered Stream):**
   - Reads raw NMEA data from the GNSS module (UART pins: `GPIO 25 TX` / `GPIO 27 RX`).
   - Buffers and filters sentences, specifically targeting `$GNGGA` (fix data).
   - Validates NMEA XOR checksums before notifying the BLE client.

2. **BLE $\rightarrow$ GNSS (Pass-Through):**
   - Receives incoming BLE writes (e.g., RTCM correction data for RTK or configuration commands) and immediately forwards raw bytes directly to the GNSS module over UART.

3. **Connection & MTU Management:**
   - Advertises as **"GPS RTK Stick"** and automatically restarts advertising on disconnect.
   - Configures high MTU (up to 512 bytes) for efficient data transfers.

---

## Hardware & Pin Configuration

- **Target Board:** ESP32 (Denky32 / generic ESP32)
- **GNSS RX Pin:** `GPIO 27` (connect to GNSS module TX)
- **GNSS TX Pin:** `GPIO 25` (connect to GNSS module RX)
- **GNSS Baud Rate:** `115200`

---

## Prerequisites & Build Setup (VS Code)

This project uses [PlatformIO](https://platformio.org/) for build management and dependencies.

### 1. Install PlatformIO Extension
- Open VS Code and navigate to the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
- Search for **PlatformIO IDE** (`platformio.platformio-ide`) and click **Install**.
- Restart VS Code if prompted. PlatformIO will automatically install the necessary Espressif 32 toolchains and the Arduino framework.

### 2. Build and Flash
- **Build:** Click the **$\checkmark$ (PlatformIO: Build)** icon in the bottom status bar, or run:
  ```bash
  pio run
  ```
- **Upload:** Connect your ESP32 via USB and click the **$\rightarrow$ (PlatformIO: Upload)** icon in the status bar, or run:
  ```bash
  pio run --target upload
  ```
- **Serial Monitor:** Click the plug icon in the status bar or run:
  ```bash
  pio device monitor
  ```
