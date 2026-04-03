import { useAtom } from "jotai";
import { Color, Status } from "./Status";
import { currentGGAAtom } from "../ble/GPS";
import { FallbackIndicator } from "./FallbackIndicator";

export function GPSStatus() {
    const [currentGGA] = useAtom(currentGGAAtom);

    let statusColor = Color.RED;
    if (currentGGA?.fixQuality === 1 || currentGGA?.fixQuality === 5) {
        statusColor = Color.YELLOW;
    } else if (currentGGA?.fixQuality === 4) {
        statusColor = Color.GREEN;
    }

    return <FallbackIndicator value={currentGGA}>
        <Status text="GPS" color={statusColor}></Status>
    </FallbackIndicator>
}