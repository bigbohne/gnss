import { useAtom } from "jotai";
import { isConnectedAtom, lastMessageAtom } from "../ble/Connection";
import { Color, Status } from "./Status";
import { useEffect, useMemo, useState } from "react";
import { FallbackIndicator } from "./FallbackIndicator";

export function BLEStatus() {
    const [bleConnected] = useAtom(isConnectedAtom);
    const [lastMessage] = useAtom(lastMessageAtom);
    const [hasTimeout, setHasTimeout] = useState<boolean>(true);


    const [timeoutTimer, setTimeoutTimer] = useState<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (timeoutTimer) {
            clearTimeout(timeoutTimer);
            setTimeoutTimer(null);
        }
        if (lastMessage) {
            const newTimeoutTimer = setTimeout(() => {
                setHasTimeout(true);
            }, 5000);

            setTimeoutTimer(newTimeoutTimer);
            setHasTimeout(false);
        }
    }, [lastMessage]);

    const statusColor = bleConnected ? (hasTimeout ? Color.YELLOW : Color.GREEN) : Color.RED;

    return <>
        <FallbackIndicator value={lastMessage}>
            <Status text="BLE" color={statusColor}></Status>
        </FallbackIndicator>
    </>
}