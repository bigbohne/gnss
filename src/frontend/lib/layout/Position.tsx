import { Flex, Text } from "@mantine/core";


type PositionProps = {
    latitude: number,
    longitude: number,
    altitude: number,
    style?: "flat" | "long"
}

export function Position(props: PositionProps) {

    const direction = props.style === "flat" ? "row" : "column";

    return <Flex direction={direction} gap={8}>
        <Flex direction="row" align="center"><Text size="sm" mr={4}>Lat.: </Text><Text fw={500}>{props.latitude.toFixed(6)}°</Text></Flex>
        <Flex direction="row" align="center"><Text size="sm" mr={4}>Lon.: </Text><Text fw={500}>{props.longitude.toFixed(6)}°</Text></Flex>
        <Flex direction="row" align="center"><Text size="sm" mr={4}>Alt: </Text><Text fw={500}>{props.altitude.toFixed(1)}m</Text></Flex>
    </Flex>
}