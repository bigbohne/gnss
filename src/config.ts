type NTRIPConfigType = {
    host: string;
    port: number;
    mountpoint: string;
    username: string;
    password: string;
};

export const NTRIPConfig: NTRIPConfigType = {
    host: "www.openservice-sapos.niedersachsen.de",
    port: 2101,
    mountpoint: "VRS_3_4G_NI",
    username: "XYZ",
    password: "ABC",
}

export const PostgresConnectionString = "postgresql://ABC:DEF@1.2.3.4:5432/postgis"