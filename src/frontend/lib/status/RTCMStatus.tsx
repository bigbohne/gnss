import { FallbackIndicator } from "./FallbackIndicator";
import { Color, Status } from "./Status";

export type RTCMStatusProps = {
    wsMessageReceived: boolean;
    initialPositionSent: boolean;
}

export function RTCMStatus({ wsMessageReceived, initialPositionSent }: RTCMStatusProps) {
    const rtcmStatusColor = wsMessageReceived ? Color.GREEN : (initialPositionSent ? Color.YELLOW : Color.RED);

    return (
        <FallbackIndicator value={wsMessageReceived}>
            <Status text="RTCM" color={rtcmStatusColor}></Status>
        </FallbackIndicator>
    );
}