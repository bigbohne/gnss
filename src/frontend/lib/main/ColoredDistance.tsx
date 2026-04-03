export type ColoredDistanceProps = {
    self: number,
    target: number
    deadzone?: number
}

export function ColoredDistance(props: ColoredDistanceProps) {
    const COLOR_BLACK = "#000000";
    const COLOR_GREEN = "#00FF00";
    const COLOR_RED = "#FF0000";


    const distance = props.target - props.self;
    const color = Math.abs(distance) < (props.deadzone ?? 0.001) ? COLOR_BLACK : (distance < 0 ? COLOR_RED : COLOR_GREEN);

    return <span style={{ color }}>{distance.toFixed(8)}°</span>
}