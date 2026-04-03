import { atom, useAtom, useAtomValue } from "jotai";
import { filledGGAAtom } from "../ble/GPS";
import { useEffect, useMemo, useState } from "react";
import haversine from 'haversine-distance';
import { ColoredDistance } from "./ColoredDistance";
import { Position } from "../layout/Position";
import { Flex, ThemeIcon } from "@mantine/core";
import { MapPinOff } from "lucide-react";

type Position = {
    latitude: number;
    longitude: number;
    altitude: number;
}

export const storedPositionAtom = atom<Position | null>(null);

export const storePositionAtom = atom(null, async (get, set, position: Position) => {
    set(storedPositionAtom, position);
})

export function StoredPosition() {
    const storedPosition = useAtomValue(storedPositionAtom);
    const storePosition = useAtom(storePositionAtom)[1];
    const currentGGA = useAtomValue(filledGGAAtom);

    const [distance, setDistance] = useState<number | null>(null);

    useMemo(() => {
        if (currentGGA && storedPosition) {
            const currentPos = { lat: currentGGA.latitude, lon: currentGGA.longitude };
            const storedPos = { lat: storedPosition.latitude, lon: storedPosition.longitude };
            const dist = haversine(currentPos, storedPos);
            setDistance(dist);
        }
    }, [currentGGA, storedPosition]);

    const [localStoragePosition, setLocalStoragePosition] = useState<Position | null>(null);

    useEffect(() => {
        if (storedPosition) {
            setLocalStoragePosition(storedPosition);
        } else {
            setLocalStoragePosition(null);
        }
    }, [storedPosition]);

    useEffect(() => {
        if (localStoragePosition) {
            try {
                if (localStoragePosition.latitude && localStoragePosition.longitude && localStoragePosition.altitude) {
                    storePosition({
                        latitude: localStoragePosition.latitude,
                        longitude: localStoragePosition.longitude,
                        altitude: localStoragePosition.altitude
                    });
                }
            } catch (e) {
                console.error("Failed to parse stored position from local storage", e);
            }
        }
    }, []);

    if (!storedPosition) {
        return <Flex direction="row" align="center" justify="center" m={8}><ThemeIcon variant="light" color="red" aria-label="Settings" mr={8}><MapPinOff /></ThemeIcon>No Position</Flex>
    }

    return (
            <Flex direction="column" m={8} >
                <Position style="flat" latitude={storedPosition.latitude} longitude={storedPosition.longitude} altitude={storedPosition.altitude} />
                <div>
                    <ColoredDistance self={storedPosition.latitude} target={currentGGA?.latitude ?? 0} deadzone={0.000001}></ColoredDistance>&nbsp;
                    <ColoredDistance self={storedPosition.longitude} target={currentGGA?.longitude ?? 0} deadzone={0.000001}></ColoredDistance>&nbsp;
                    ({distance?.toFixed(3)}m)
                </div>
            </Flex>
    )
}