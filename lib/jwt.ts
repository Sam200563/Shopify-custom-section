import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "default_secret_please_change"
);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, JWT_SECRET, {
        algorithms: ["HS256"],
    });
    return payload;
}
