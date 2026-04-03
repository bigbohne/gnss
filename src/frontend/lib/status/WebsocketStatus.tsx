import { useWebsocket } from "../ws/websocket";
import { FallbackIndicator } from "./FallbackIndicator";
import { Color, Status } from "./Status";

export function WebsocketStatus() {
    const { isConnected, hasMessageReceived,  } = useWebsocket();

    const statusColor = isConnected ? (hasMessageReceived ? Color.GREEN : Color.YELLOW) : Color.RED;

    return <>
            <FallbackIndicator value={hasMessageReceived}>
                <Status text="WebSocket" color={statusColor}></Status>
            </FallbackIndicator>
        </>
}