import { SQL } from "bun";
import { PostgresConnectionString } from "../config";

export type UploadPayload = {
    name: string,
    type: string,
    positions: {
        latitude: number,
        longitude: number,
        altitude: number
    }[]
}

const psql = new SQL(PostgresConnectionString);

export async function uploadHandler(req: Request): Promise<Response> {
    const payload: UploadPayload = await req.json();

    if (!payload.positions || payload.positions.length === 0) {
        return new Response("No positions provided", { status: 400 });
    }

    switch (payload.type) {
        case "points":
            await uploadPoints(payload, psql);
            break;
        case "line":
            await uploadLine(payload, psql);
            break;
        case "polygon":
            await uploadPolygon(payload, psql);
            break;
        default:
            return new Response("Invalid data type", { status: 400 });
    }
    
    return new Response("OK", { status: 201 });
}

export async function uploadPolygon(payload: UploadPayload, conn: SQL) {
    // Repeat the position list to create a WKT polygon string
    const firstPosition = payload.positions[0]!;
    const polygonString = [...payload.positions, firstPosition].map(pos => `${pos.longitude} ${pos.latitude}`).join(", ");
    const geomString = `POLYGON((${polygonString}))`;
    console.log(geomString);

    await conn`INSERT INTO survey_polygons (name, geom) VALUES (${payload.name}, ST_GeomFromText(${geomString}, 4258));`
}

export async function uploadPoints(payload: UploadPayload, conn: SQL) {
    for (const pos of payload.positions) {
        const geomString = `POINT(${pos.longitude} ${pos.latitude})`;
        console.log(geomString);
        await conn`INSERT INTO survey_points (name, geom) VALUES (${payload.name}, ST_GeomFromText(${geomString}, 4258));`
    }
}

export async function uploadLine(payload: UploadPayload, conn: SQL) {
    const lineString = payload.positions.map(pos => `${pos.longitude} ${pos.latitude}`).join(", ");
    const geomString = `LINESTRING(${lineString})`;
    console.log(geomString);

    await conn`INSERT INTO survey_lines (name, geom) VALUES (${payload.name}, ST_GeomFromText(${geomString}, 4258));`
}