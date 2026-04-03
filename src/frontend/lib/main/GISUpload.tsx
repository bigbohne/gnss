import { useState } from "react";
import { Position } from "../layout/Position";
import { storedPositionAtom } from "./StoredPosition";
import { useAtomValue } from "jotai";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import type { UploadPayload } from "../../../server/uploadHandler";
import useLocalStorageState from "use-local-storage-state";
import { Button, Flex, Select, TextInput, Grid } from "@mantine/core";
import { Status } from "../status/Status";

enum DataType {
    POINTS = 'points',
    LINE = 'line',
    POLYGON = 'polygon'
}

type PositionEntry = {
    latitude: number,
    longitude: number,
    altitude: number
}

export function GisUpload() {
    const [positions, setPositions] = useLocalStorageState<PositionEntry[]>("gis-upload-positions", { defaultValue: [] });
    const storedPosition = useAtomValue(storedPositionAtom);
    const [dataType, setDataType] = useState<DataType>(DataType.POINTS);
    const [name, setName] = useState<string>("");

    function nameChange(e: React.ChangeEvent<HTMLInputElement>) {
        setName(e.target.value);
    }

    const { mutate, isPending, status } = useMutation({
        mutationFn: async () => {

            const payload: UploadPayload = {
                name: name,
                type: dataType,
                positions: positions
            }

            return await axios.post('/upload', payload)
        },
    })

    function clear() {
        setPositions([]);
    }

    function append() {
        if (!storedPosition) {
            return;
        }

        setPositions([...positions, { ...storedPosition }]);
    }

    function upload() {
        mutate();
    }

    const uploadButtonText = isPending ? "Uploading..." : "Upload";

    const positionListItems = positions.map((elem, idx) => {
        return <div key={idx}><Position style="flat" latitude={elem.latitude} longitude={elem.longitude} altitude={elem.altitude}></Position></div>
    })

    return (<>
        <Flex direction="column" gap={8}>
            <Flex gap={8} align="center">
                <Button onClick={append} disabled={!storedPosition} size="xs" variant={positions.length === 0 ? "filled" : "outline"} color="blue">
                    Append Staged Position
                </Button>
                <Button onClick={upload} size="xs" disabled={positions.length === 0 || isPending} variant={positions.length === 0 || isPending ? "outline" : "filled"} color={isPending ? "gray" : "blue"}>
                    {uploadButtonText}
                </Button>
                <Button onClick={clear} size="xs" disabled={positions.length === 0} variant="outline" color="red">
                    Clear
                </Button>
                <Status text={status} color={status === "success" ? "green" : status === "error" ? "red" : "blue"}></Status>
            </Flex>
            <Flex>
                <Grid>
                <Grid.Col span={8}>
                    <TextInput placeholder="Name" value={name} onChange={nameChange} size="xs" />
                </Grid.Col>
                <Grid.Col span={4}>
                    <Select value={dataType} onChange={(value) => setDataType(value as DataType)} data={["points", "line", "polygon"]} size="xs"></Select>
                </Grid.Col>
                </Grid>
            </Flex>
            <Flex direction="column" gap={4} align="center">
                {positionListItems}
            </Flex>
        </Flex>
    </>)

}