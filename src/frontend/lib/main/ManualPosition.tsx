import { Button, Flex, Modal, NumberInput, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAtom } from "jotai";
import { useState } from "react";
import { storePositionAtom } from "./StoredPosition";

export function ManualPosition() {
    const [opened, { open, close }] = useDisclosure(false);

    const [, setStorePosition] = useAtom(storePositionAtom);

    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [altitude, setAltitude] = useState<number | null>(null);

    function loadPosition() {
        if (latitude !== null && longitude !== null && altitude !== null) {
            setStorePosition({ latitude, longitude, altitude });
            close();
        }
    }

    return (
        <>
            <Modal opened={opened} onClose={close} title="Manual Position Loader">
                <Flex direction="column" gap={8}>
                        <NumberInput onValueChange={(value) => setLatitude(value.floatValue || null)}
                            label="Latitude [°N]"
                            placeholder="0.0000000"
                            decimalScale={8}
                        />
                        <NumberInput onValueChange={(value) => setLongitude(value.floatValue || null)}
                            label="Longitude [°E]"
                            placeholder="0.0000000"
                            decimalScale={8}
                        />
                        <NumberInput onValueChange={(value) => setAltitude(value.floatValue || null)}
                            label="Altitude [m]"
                            placeholder="0.0000000"
                            decimalScale={8}
                        />
                    <Flex><Button onClick={loadPosition}>Load Position</Button></Flex>
                </Flex>
            </Modal>
            <Button onClick={open} variant="outline" size="xs">
                Manual Position
            </Button>
        </>
    )
}