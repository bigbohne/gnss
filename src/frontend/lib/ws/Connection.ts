import { atom } from "jotai";
import { isConnectedAtom, sendBleMessageAtom } from "../ble/Connection";
import { Buffer } from 'buffer';

export const websocketAtom = atom<WebSocket | null>(null);
export const wsIsConnectedAtom = atom((get) => get(websocketAtom) !== null);
export const wsMessageReceivedAtom = atom(false);

export const connectWebsocketAtom = atom(null, async (get, set) => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = window.location.host; // same domain + port
    const wsUrl = `${wsProtocol}//${wsHost}/ws`; // or whatever your WS path is

    try {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("WebSocket connected");
            set(websocketAtom, ws);
            set(wsMessageReceivedAtom, false);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            set(websocketAtom, null);
            set(wsMessageReceivedAtom, false);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error", error);
            set(websocketAtom, null);
            set(wsMessageReceivedAtom, false);
        };

        ws.onmessage = async (event) => {
            set(wsMessageReceivedAtom, true);
            const isConnected = get(isConnectedAtom);
            if (!isConnected) {
                console.warn("Received WebSocket message but BLE is not connected. Ignoring.");
                return;
            }

            // send to BLE
            set(sendBleMessageAtom, new Uint8Array(Buffer.from(event.data, 'base64')));
        };

    } catch (error) {
        console.error("Failed to connect WebSocket", error);
        set(websocketAtom, null);
        set(wsMessageReceivedAtom, false);
    }
})