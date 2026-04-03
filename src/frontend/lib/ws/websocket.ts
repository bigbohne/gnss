import { useAtomValue, useSetAtom } from "jotai";
import { websocketAtom, wsIsConnectedAtom, wsMessageReceivedAtom, connectWebsocketAtom } from "./Connection";

export function useWebsocket() {
    const socket = useAtomValue(websocketAtom);
    const isConnected = useAtomValue(wsIsConnectedAtom);
    const hasMessageReceived = useAtomValue(wsMessageReceivedAtom);
    const connect = useSetAtom(connectWebsocketAtom);

    return {
        socket,
        isConnected,
        hasMessageReceived,
        connect
    }
}