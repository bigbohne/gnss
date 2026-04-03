import { atom } from "jotai";
import { lastMessageAtom } from "./Connection";

export type GGA = {
    time: string; // UTC time in hhmmss format
    latitude: number; // Latitude in decimal degrees
    longitude: number; // Longitude in decimal degrees
    fixQuality: number; // GPS fix quality (0 = invalid, 1 = GPS fix, 2 = DGPS fix)
    fixQualityName: string;
    numSatellites: number; // Number of satellites being tracked
    horizontalDilution: number; // Horizontal dilution of precision
    altitude: number; // Altitude above mean sea level in meters
    heightOfGeoid: number; // Height of geoid above WGS84 ellipsoid in meters
}

// Derive GGA from latest BLE message
export const currentGGAAtom = atom<GGA | null>((get) => {
    const lastMessage = get(lastMessageAtom);
    if (!lastMessage) return null;

    const parts = lastMessage.split(",");
    if (parts[0] !== "$GNGGA") return null; // Not a GGA message

    if (parts.length < 10) {
        console.warn("Received GGA message with insufficient parts:", lastMessage);
        return null;
    }

    try {
        return {
            time: parts[1],
            latitude: nmeaToDecimal(parts[2], parts[3]),
            longitude: nmeaToDecimal(parts[4], parts[5]),
            fixQuality: parseInt(parts[6]),
            fixQualityName: fixQualityToName(parseInt(parts[6])),
            numSatellites: parseInt(parts[7]),
            horizontalDilution: parseFloat(parts[8]),
            altitude: parseFloat(parts[9]),
            heightOfGeoid: parseFloat(parts[11])

        };
    } catch (error) {
        console.error("Failed to parse GGA message", error);
        return null;
    }
});

export const filledGGAAtom = atom((get) => {
    const gga = get(currentGGAAtom);
    if (!gga) return null;
    
    // Fill missing fields with defaults    
    if (!gga.latitude || !gga.longitude) return null;

    return gga
});

function fixQualityToName(fixQuality: number): string {
    switch (fixQuality) {
        case 0:
            return "Invalid";
        case 1:
            return "GPS Fix";
        case 2:
            return "DGPS Fix";
        case 3:
            return "Not Applicable";
        case 4:
            return "RTK Fixed";
        case 5:
            return "RTK Float";
        case 6:
            return "Estimated (dead reckoning)";
        default:
            return "Unknown";
    }
}

function nmeaToDecimal(value: string, direction: string) {
    // value is a string like "4807.038" or "01131.000"
    // direction is one of: N, S, E, W

    const numeric = parseFloat(value);

    // Extract degrees and minutes
    const degrees = Math.floor(numeric / 100);
    const minutes = numeric - (degrees * 100);

    // Convert to decimal degrees
    let decimal = degrees + minutes / 60;

    // South and West are negative
    if (direction === "S" || direction === "W") {
        decimal = -decimal;
    }

    return decimal;
}