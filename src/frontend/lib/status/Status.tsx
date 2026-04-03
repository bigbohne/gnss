import { Badge } from "@mantine/core"

export enum Color {
    RED,
    YELLOW,
    GREEN
}

export type StatusProps = {
    text: string,
    color: Color
}

export function Status(props: StatusProps) {

    const color = props.color === Color.RED ? "red" : props.color === Color.YELLOW ? "yellow" : "green";

    return <Badge color={color} variant="light" size="xs" p={8}>
        {props.text}
    </Badge>
}