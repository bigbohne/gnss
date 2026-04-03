import { useAtomValue } from "jotai";
import { currentGGAAtom } from "../ble/GPS";
import { SatelliteDish } from "lucide-react";
import { Flex, ThemeIcon, Text } from "@mantine/core";
import { Position } from "../layout/Position";

export function CurrentPosition() {

    const currentGGA = useAtomValue(currentGGAAtom);

    if (!currentGGA) {
        return <Flex direction="row" align="center"><ThemeIcon variant="light" color="red" aria-label="Settings" mr={8}><SatelliteDish /></ThemeIcon>No Position</Flex>
    }

    if (currentGGA.fixQuality < 1) {
        return <Flex direction="row" align="center"><ThemeIcon variant="light" color="yellow" aria-label="Settings" mr={8}><SatelliteDish /></ThemeIcon>Invalid Position</Flex>
    }

    return (
        <>
            <Position style="flat" latitude={currentGGA.latitude} longitude={currentGGA.longitude} altitude={currentGGA.altitude} />
            <Text>({currentGGA.fixQualityName})</Text>
        </>
    )
}