import "dotenv/config";
import jwt, { JwtPayload } from "jsonwebtoken"
type verifyToken = string | JwtPayload

let jwtSecret = process.env.Jwt_secret as string

let expiredIn = 1000 * 60 * 60 * 24 * 3 // 3 days


export const genToken = (
    id: string,
    expiresIn: string = "3d",
    extra?: string
): string => {
    const payload: any = { id };
    if (extra) payload.extra = extra;

    return jwt.sign(payload, jwtSecret, { expiresIn });
};



export const verifyToken = (token: string): verifyToken => {
    return jwt.verify(token, jwtSecret)
}


export const setCookie = (res: any, id: string) => {

    let token = genToken(id);
    return res.cookie("token", token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: false, // Ensures the cookie is sent only over HTTPS
        maxAge: expiredIn,
        SameSite: 'none'
    })
}