import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import {Rol,EstadoUsuario} from "../../generated/prisma/enums";
import {
    CreateUsuarioDto,
    UpdateUsuarioDto,
    RegisterUsuarioDto,
    LoginUsuarioDto,
    UpdatePerfilUsuarioDto
} from "../dtos/usuario.dto";
import { AppError } from "../utils/app-error";


export const usuarioService = {

    // Configuración
    async obtenerConfiguracion() {

        return {
            roles: Object.values(Rol),
            estados: Object.values(EstadoUsuario),
        };
    },


    // Listado
    async listar(
        filtros?: {
            buscar?: string;
            rol?: Rol
        }
    ) {

        const where: any = {};
        if (filtros?.buscar) {
            const textoBusqueda =
                filtros.buscar.trim();

            where.OR = [
                {
                    nombre: {
                        contains: textoBusqueda
                    }
                },
                {
                    apellidos: {
                        contains: textoBusqueda
                    }
                },
                {
                    email: {
                        contains: textoBusqueda
                    }
                },
            ];
        }

        if (filtros?.rol) {
            where.rol = filtros.rol;
        }

        return await prisma.usuario.findMany({

            where,

            select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                rol: true,
                estado: true,
            },

            orderBy: {
                id: "asc",
            },
        });
    },


    // Obtener por id
    async obtenerPorId(usuarioId: number) {

        return await prisma.usuario.findUnique({

            where: {
                id: usuarioId
            },

            select: {
                id: true,
                email: true,
                nombre: true,
                apellidos: true,
                rol: true,
                estado: true,
            },
        });
    },


    // Registro
    async registrar(data: RegisterUsuarioDto) {

        const usuarioExiste =
            await prisma.usuario.findUnique({
                where: {
                    email: data.email
                }
            });

        if (usuarioExiste) {
            throw new Error(
                "El correo ya está registrado"
            );
        }

        const hashedPassword =
            await bcrypt.hash(
                data.password,
                10
            );

        return await prisma.usuario.create({

            data: {
                email: data.email,
                nombre: data.nombre,
                apellidos: data.apellidos,
                telefono: data.telefono,
                password: hashedPassword,
                rol: Rol.CLIENTE,
                estado: EstadoUsuario.ACTIVO,
            },

            select: {
                id: true,
                email: true,
                nombre: true,
                apellidos: true,
                telefono: true,
                rol: true,
                estado: true,
            },
        });
    },


    // Login
    async login(data: LoginUsuarioDto) {

        const usuario =
            await prisma.usuario.findUnique({
                where: {
                    email: data.email
                }
            });

        if (!usuario) {
            throw new Error(
                "Correo o contraseña incorrectos"
            );
        }

        const passwordValido =
            await bcrypt.compare(
                data.password,
                usuario.password
            );

        if (!passwordValido) {
            throw new Error(
                "Correo o contraseña incorrectos"
            );
        }

        if (usuario.estado !== EstadoUsuario.ACTIVO) {
            throw new Error(
                "El usuario se encuentra bloqueado"
            );
        }

        const payload = {
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol,
        };

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error(
                "JWT_SECRET no se encuentra configurado"
            );
        }

        const options: SignOptions = {expiresIn: "2h",};
        const token =
            jwt.sign(
                payload,
                secret as Secret,
                options
            );

        return {
            token
        };
    },


    // Activar
    async activar(id: number) {
        const usuario =
            await this.obtenerPorId(id);

        if (!usuario) {
            throw AppError.notFound(
                `Usuario con ID ${id} no encontrado`
            );
        }

        return await prisma.usuario.update({

            where: { id},
            data: {estado: EstadoUsuario.ACTIVO},

            select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                estado: true,
                rol: true,
                updateAt: true
            }
        });
    },


    // Bloquear
    async bloquear(id: number) {
        const usuario = await this.obtenerPorId(id);
        if (!usuario) {
            throw AppError.notFound(
                `Usuario con ID ${id} no encontrado`
            );
        }

        return await prisma.usuario.update({

            where: {id},
            data: {estado: EstadoUsuario.BLOQUEADO},

            select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                estado: true,
                rol: true,
                updateAt: true
            }
        });
    },


    // Creación admin
    async crear(data: CreateUsuarioDto) {

        const usuarioExiste =
            await prisma.usuario.findUnique({
                where: {
                    email: data.email
                }
            });

        if (usuarioExiste) {
            throw new Error(
                "El correo ya está registrado"
            );
        }

        const hashedPassword =
            await bcrypt.hash(
                data.password,
                10
            );

        return await prisma.usuario.create({

            data: {
                email: data.email,
                nombre: data.nombre,
                apellidos: data.apellidos,
                password: hashedPassword,
                rol: data.rol ?? Rol.CLIENTE,
                estado: data.estado ?? EstadoUsuario.ACTIVO,},

            select: {
                id: true,
                email: true,
                nombre: true,
                apellidos: true,
                rol: true,
                estado: true,
            },
        });
    },


    // Actualizar
    async actualizar(id: number, data: UpdateUsuarioDto) {

        const usuario =await this.obtenerPorId(id);

        if (!usuario) {
            throw AppError.notFound(
                `Usuario con ID ${id} no encontrado`
            );
        }

        let passwordHash: string | undefined;

        if (data.password) {
            passwordHash =
                await bcrypt.hash(
                    data.password,
                    10
                );
        }

        return await prisma.usuario.update({
            where: {id},

            data: {
                email: data.email,
                nombre: data.nombre,
                apellidos: data.apellidos,
                password: passwordHash,
                rol: data.rol,
                estado: data.estado,
            },

            select: {
                id: true,
                email: true,
                nombre: true,
                apellidos: true,
                rol: true,
                estado: true,
            },
        });
    },



    // Obtiene la información del perfil de un usuario por su ID.
    // Selecciona únicamente campos seguros (excluyendo datos sensibles como contraseñas)
    // y lanza un error 404 si el usuario no existe.
    async perfil(usuarioId: number) {

        const usuario =
            await prisma.usuario.findUnique({
                where: { id: usuarioId},

                select: {
                    id: true,
                    email: true,
                    nombre: true,
                    apellidos: true,
                    telefono: true,
                    rol: true,
                    estado: true,
                    createdAt: true,
                    updateAt: true,
                },
            });

        if (!usuario) {
            throw AppError.notFound(
                "El usuario autenticado no existe"
            );
        }
        
        return usuario;
    },


    // Actualizar perfil del usuario autenticado
    async actualizarPerfil(usuarioId: number, data: UpdatePerfilUsuarioDto) {

    // Verificar que el usuario exista
    const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId}
    });

    // Si no existe lanza error
    if (!usuario) {
        throw AppError.notFound( "El usuario autenticado no existe");
    }

    // Si cambia el correo, verificar que no pertenezca a otro usuario
    if (data.email) {
        const correoExiste =
            await prisma.usuario.findFirst({
                where: {
                    email: data.email,
                    NOT: {
                        id: usuarioId
                    }
                }
            });

        if (correoExiste) {
            throw new Error(
                "El correo ya está registrado"
            );
        }
    }

    // Si envía una nueva contraseña, se encripta
    let passwordHash: string | undefined;
    if (data.password) {
        passwordHash =
            await bcrypt.hash(
                data.password,
                10
            );
    }

    // Actualizar únicamente los datos permitidos
    return await prisma.usuario.update({
        where: { id: usuarioId},
        data: {
            email: data.email,
            nombre: data.nombre,
            apellidos: data.apellidos,
            telefono: data.telefono,
            password: passwordHash,
        },

        select: {
            id: true,
            email: true,
            nombre: true,
            apellidos: true,
            telefono: true,
            rol: true,
            estado: true,
            createdAt: true,
            updateAt: true,
        }

    });
},
};