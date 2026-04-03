import { Indicator } from "@mantine/core";
import { useTimeout } from "@mantine/hooks";
import { useEffect, useState } from "react";

type FallbackIndicatorProps = {
    children: React.ReactNode;
    color?: string;
    value: any; // The value to check for fallback
};

export function FallbackIndicator({ children, color, value }: FallbackIndicatorProps) {
    const [disabled, setDisabled] = useState(true);

    const [initialCheckDone, setInitialCheckDone] = useState(false);

    const timeout = useTimeout(() => {
        setDisabled(true);
    }, 200)

    useEffect(() => {
        if (!initialCheckDone) {
            setInitialCheckDone(true);
            return;
        }
        
        setDisabled(false);
        timeout.clear();
        timeout.start();
    }, [value]); // Add any dependencies that should trigger a re-check


    return <Indicator color={color || "blue"} disabled={disabled}>
        {children}
    </Indicator>;
}