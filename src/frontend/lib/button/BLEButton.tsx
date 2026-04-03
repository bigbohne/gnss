import { useAtom } from "jotai";
import { connectBleAtom, disconnectBleAtom, isConnectedAtom } from "../ble/Connection";
import { Button } from "@mantine/core";

async function requestWakeLock(): Promise<void> {
  // Check if the browser supports the API
  if ('wakeLock' in navigator) {
    try {
      // Request the screen wake lock
      const wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake Lock is active!');

      // Listen for the lock being released (e.g., if user switches tabs)
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock was released');
      });
    } catch (err) {
      // The browser can refuse the request (e.g., low battery, low power mode)
      console.error(`${(err as Error).name}, ${(err as Error).message}`);
    }
  } else {
    console.warn('Wake Lock API not supported in this browser.');
  }
}

export function BLEButton() {
    const [bleConnected] = useAtom(isConnectedAtom);
    const [, bleConnect] = useAtom(connectBleAtom);
    const [, bleDisconnect] = useAtom(disconnectBleAtom);
    const bleButtonAction = bleConnected ? bleDisconnect : bleConnect;
    const bleButtonText = bleConnected ? "Disconnect BLE" : "Connect BLE";
    const variant = bleConnected ? "outline" : "filled";

    function onClick() {
        requestWakeLock();
        bleButtonAction();
    }

    return <Button onClick={onClick} variant={variant} size="xs">{bleButtonText}</Button>
}