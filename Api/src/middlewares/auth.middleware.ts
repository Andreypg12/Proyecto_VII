import {NextFunction, Request, Response} from "express";
import { StatusCodes } from "http-status-codes";
import jwt, {JwtPayload, Secret} from "jsonwebtoken";
export interface AuthTokenPayload extends JwtPayload {
    id: number;
    email: string;
    rol: string;
}
export interface AuthRequest extends Request { user?: AuthTokenPayload;}

export function authenticateToken(request: AuthRequest, response: Response, next: NextFunction) {
    
    const authorizationHeader = request.headers.authorization;

    // No mandaron token
    if (!authorizationHeader) {
        return response.status(StatusCodes.UNAUTHORIZED)
            .json({success: false, message: "Token no proporcionado"});
    }

    // Authorization: Bearer TOKEN
    const [scheme, token] = authorizationHeader.split(" ");
    if ( scheme !== "Bearer" || !token ) {
        return response
            .status(StatusCodes.UNAUTHORIZED)
            .json({ success: false, message: "Formato de token inválido"});
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) { throw new Error( "JWT_SECRET no está configurado" ); }
        const decodedToken = jwt.verify( token, secret as Secret);

        if (typeof decodedToken === "string" || !decodedToken.id || !decodedToken.email ||!decodedToken.rol) {
            return response
            .status(StatusCodes.UNAUTHORIZED)
            .json({success: false,message: "Token inválido"});
        }

        request.user = {
            id: Number(decodedToken.id),
            email: String(decodedToken.email),
            rol: String(decodedToken.rol),
        };

        next();
    } catch {
        return response
            .status(StatusCodes.UNAUTHORIZED)
            .json({ success: false, message: "Token inválido o expirado"});
    }
}