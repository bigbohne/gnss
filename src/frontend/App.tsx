import { Status, Color } from "./lib/status/Status";
import { BLEStatus } from "./lib/status/BLEStatus";
import { BLEButton } from "./lib/button/BLEButton";
import { useAtom } from "jotai";
import { currentGGAAtom } from "./lib/ble/GPS";
import { GPSStatus } from "./lib/status/GPSStatus";
import { useEffect, useMemo, useState } from "react";
import { connectWebsocketAtom, websocketAtom, wsIsConnectedAtom, wsMessageReceivedAtom } from "./lib/ws/Connection";
import { CurrentPosition } from "./lib/main/CurrentPosition";
import { StoredPosition, storePositionAtom } from "./lib/main/StoredPosition";
import { GisUpload } from "./lib/main/GISUpload";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button, Card, createTheme, Divider, Flex, Group, MantineProvider } from '@mantine/core';

const queryClient = new QueryClient()

// core styles are required for all packages
import '@mantine/core/styles.css';
import { ManualPosition } from "./lib/main/ManualPosition";
import { WebsocketStatus } from "./lib/status/WebsocketStatus";
import { RTCMStatus } from "./lib/status/RTCMStatus";

const theme = createTheme({
    /** Put your mantine theme override here */
});

export function App() {
    const [currentGGA] = useAtom(currentGGAAtom);
    const [wsConnected] = useAtom(wsIsConnectedAtom);
    const [websocket] = useAtom(websocketAtom);
    const [, connectWebsocket] = useAtom(connectWebsocketAtom);

    const [initialPositionSent, setInitialPositionSent] = useState(false)
    useMemo(() => {
        if (currentGGA && currentGGA.latitude && currentGGA.longitude && !initialPositionSent) {
            if (wsConnected) {
                websocket?.send(JSON.stringify({ lat: currentGGA.latitude, lon: currentGGA.longitude }));
                setInitialPositionSent(true);
            } else {
                connectWebsocket();
            }
        }

    }, [currentGGA])

    useEffect(() => {
        if (!wsConnected) {
            setInitialPositionSent(false);
        }
    }, [wsConnected])

    const [wsMessageReceived] = useAtom(wsMessageReceivedAtom);
    const rtcmStatusColor = wsMessageReceived ? Color.GREEN : (initialPositionSent ? Color.YELLOW : Color.RED); // Placeholder, replace with actual RTCM status logic

    const [, setStoredPosition] = useAtom(storePositionAtom);

    function storeCurrentPosition() {
        if (currentGGA && currentGGA.latitude && currentGGA.longitude) {
            setStoredPosition({
                latitude: currentGGA.latitude,
                longitude: currentGGA.longitude,
                altitude: currentGGA.altitude
            });
        }
    }

    const hasValidPosition = currentGGA && currentGGA.fixQuality > 0;
    const positionIsRTKFixed = currentGGA && currentGGA.fixQuality === 4;
    const storePositionButtonColor = hasValidPosition ? (positionIsRTKFixed ? "green" : "yellow") : "red";

    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider theme={theme}>
                <Flex direction="column" align="center">
                    <Card shadow="sm" m={8}>
                        <Flex gap={8} align="center">
                            <BLEButton />
                            <BLEStatus />
                            <WebsocketStatus />
                            <RTCMStatus wsMessageReceived={wsMessageReceived} initialPositionSent={initialPositionSent} />
                            <GPSStatus />
                        </Flex>
                        <Divider my="sm" />
                        <Flex gap={8} justify="center">
                            <CurrentPosition />
                        </Flex>
                        <Divider my="sm" />
                        <Group gap={8} grow>
                            <Button onClick={storeCurrentPosition} disabled={!hasValidPosition} variant="filled" color={storePositionButtonColor} size="xs">
                                Stage Position
                            </Button>
                            <ManualPosition />
                        </Group>
                        <StoredPosition />
                        <Divider my="sm" />
                        <GisUpload />
                    </Card>
                </Flex>
            </MantineProvider>
        </QueryClientProvider>)
}
