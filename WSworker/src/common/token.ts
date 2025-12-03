import jwt, { JwtPayload } from "jsonwebtoken"
type verifyToken = string | JwtPayload

let jwtSecret = process.env.Jwt_secret as string
export const verifyToken = (token: string): verifyToken => {
    return jwt.verify(token, jwtSecret)
}
