import { Domain } from "domain"
import jwt ,{JwtPayload} from "jsonwebtoken"
type verifyToken = string | JwtPayload

let jwtSecret = process.env.Jwt_secret || "ahddhahdiai"



export const genToken = (id:string):string => {    
return jwt.sign(id, jwtSecret)
}
export const verifyToken = (token:string):verifyToken=> {
return jwt.verify(token, jwtSecret)
}


export const setCookie = (res:any,id :string) =>{
   
    let token  = genToken(id) ;
    return res.cookie("token" ,token ,{
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: false, // Ensures the cookie is sent only over HTTPS
        maxAge: 1000 * 60 * 60 *24 *3, // Expires after 1 d
        SameSite :'none'
    })
}