import { atom } from "jotai";
import { DateTime } from "luxon";

// Nordic UART Service (NUS) UUIDs
const NUS_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const NUS_RX_CHAR_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // Write
const NUS_TX_CHAR_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // Notify

export enum ConnectionStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED
}

const bleDeviceAtom = atom<BluetoothDevice | null>(null);
const bleRxCharAtom = atom<BluetoothRemoteGATTCharacteristic | null>(null);
const bleTxCharAtom = atom<BluetoothRemoteGATTCharacteristic | null>(null);

// Derived atom to check connection status easily
export const isConnectedAtom = atom((get) => {
  const device = get(bleDeviceAtom);
  return device ? device.gatt.connected : false;
});

export const lastMessageAtom = atom<string>("");

const isSendingAtom = atom<boolean>(false);
const bleMessageQueueAtom = atom<Uint8Array<ArrayBuffer>[]>([]);

export const connectBleAtom = atom(null, async (get, set) => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [NUS_SERVICE_UUID]
    });

    const server = await device.gatt.connect();

    // Set the device in our state
    set(bleDeviceAtom, device);

    // Optional: Handle spontaneous disconnections
    device.addEventListener('gattserverdisconnected', () => {
      clearBleState(set);
    });


    // Get Nordic UART service
    const service = await server.getPrimaryService(NUS_SERVICE_UUID);

    // Get TX (notify) and RX (write) characteristics
    const txChar = await service.getCharacteristic(NUS_TX_CHAR_UUID);
    set(bleTxCharAtom, txChar);
    const rxChar = await service.getCharacteristic(NUS_RX_CHAR_UUID);
    set(bleRxCharAtom, rxChar);

    // Handle incoming notifications
    await txChar.startNotifications();
    txChar.addEventListener("characteristicvaluechanged", event => {
      const value = new TextDecoder().decode(event.target.value);
      set(lastMessageAtom, value);
    });

  } catch (error) {
    console.error("BLE Connection failed", error);
    clearBleState(set);
  }
});

export const disconnectBleAtom = atom(null, (get, set) => {
  const device = get(bleDeviceAtom);
  if (device && device.gatt.connected) {
    device.gatt.disconnect();
  }
  clearBleState(set);
});

export const sendBleMessageAtom = atom(null, async (get, set, message: Uint8Array<ArrayBuffer>) => {
  const rxChar = get(bleRxCharAtom);
  if (!rxChar) {
    console.error("No RX characteristic available");
    return;
  }

  if (get(isSendingAtom)) {
    set(bleMessageQueueAtom, (prev) => [...prev, message]);
    return;
  }

  try {
    set(isSendingAtom, true);
    await rxChar.writeValue(message);
    while (get(bleMessageQueueAtom).length > 0) {
      const nextMessage = get(bleMessageQueueAtom)[0];
      set(bleMessageQueueAtom, get(bleMessageQueueAtom).slice(1));
      await rxChar.writeValue(nextMessage);
    }

    set(isSendingAtom, false);
  } catch (error) {
    console.error("Failed to send BLE message", error);
  }
});

function clearBleState(set: any) {
  set(bleDeviceAtom, null);
  set(bleTxCharAtom, null);
  set(bleRxCharAtom, null);
  set(lastMessageAtom, ""); // Clear last message on disconnect
}