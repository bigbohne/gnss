import type { WebSocketHandler } from "bun";
import { BufferCoalescer } from "./BufferCoalescer";
const { NtripClient } = require('ntrip-client');
import { Buffer } from "buffer";
import { NTRIPConfig } from "../config";

export class NTRIPWebSocketHandler implements WebSocketHandler<string> {
    private ntripClient: InstanceType<typeof NtripClient> | null = null;
    private bufferCoalescer?: BufferCoalescer;

    open = (ws: Bun.ServerWebSocket<string>): void | Promise<void> => {
        console.log("server ws: open");
        this.bufferCoalescer = new BufferCoalescer((data) => {
            const b64data = data.toBase64();
            ws.send(b64data);
        });
    }

    close = (
        ws: Bun.ServerWebSocket<string>,
        code: number,
        reason: string,
    ): void | Promise<void> => {
        console.log("WebSocket closed");
        if (this.ntripClient) {
            console.log("Closing NTRIP client");
            this.ntripClient.close();
            this.ntripClient = null;
        }
    }

    message = (
        ws: Bun.ServerWebSocket<string>,
        message: string | Buffer<ArrayBuffer>,
    ): void | Promise<void> => {
        const position = JSON.parse(message) as { lat: number; lon: number };

        const xyz = llhToEcef(position.lat, position.lon)

        if (!this.ntripClient) {
            console.log("Retrieved initial position: lat: " + position.lat + ", lon: " + position.lon + ", xyz: " + xyz);
            const options = {
                ...NTRIPConfig,
                xyz: xyz,
                // the interval of send nmea, unit is millisecond
                interval: 2000,
            };

            this.ntripClient = new NtripClient(options);

            this.ntripClient.on("data", (data: Uint8Array) => {
                const buffer = Buffer.from(data);
                this.bufferCoalescer!.add(buffer);
            });

            this.ntripClient.on("close", () => {
                console.log("ntrip: client close");
            });

            this.ntripClient.on("error", (err) => {
                console.log("ntrip: error: " + err);
            });

            this.ntripClient.run();
        } else {
            console.log("NTRIP client already running, received new position");
        }
    }
}

function  llhToEcef(latDeg: number, lonDeg: number, heightMeters = 0) {
        // WGS‑84 ellipsoid constants
        const a = 6378137.0; // semi-major axis
        const e2 = 6.69437999014e-3; // first eccentricity squared

        // Convert degrees to radians
        const lat = latDeg * Math.PI / 180;
        const lon = lonDeg * Math.PI / 180;

        // Prime vertical radius of curvature
        const N = a / Math.sqrt(1 - e2 * Math.sin(lat) ** 2);

        const X = (N + heightMeters) * Math.cos(lat) * Math.cos(lon);
        const Y = (N + heightMeters) * Math.cos(lat) * Math.sin(lon);
        const Z = (N * (1 - e2) + heightMeters) * Math.sin(lat);

        return [ X, Y, Z ];
    }
