import { useAtom } from "jotai";
import { storePositionAtom } from "./StoredPosition";
import { useState } from "react";

export function PositionLoader() {
    const [, setStorePosition] = useAtom(storePositionAtom);

    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [altitude, setAltitude] = useState<number | null>(null);

    function loadPosition() {
        if (latitude !== null && longitude !== null && altitude !== null) {
            setStorePosition({ latitude, longitude, altitude });
        }
    }

    return <div>
        <input size={10} onChange={(e) => setLatitude(parseFloat(e.target.value) || null)}></input>° N 
        <input size={10} onChange={(e) => setLongitude(parseFloat(e.target.value) || null)}></input>° W 
        <input size={5} onChange={(e) => setAltitude(parseFloat(e.target.value) || null)}></input>m 
        <button onClick={loadPosition}>Stage Given Position</button></div>
}