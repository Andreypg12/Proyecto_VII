
import { prisma } from "../src/config/prisma";
import { EstadoCita, EstadoUsuario, Modalidad, Rol } from "../generated/prisma/enums";
import { create } from "node:domain";

async function main() {
    console.log("Iniciando seed...");
    // 1. Limpieza de datos

    /*  const models = [
        prisma.especialidad,
        prisma.servicio,
        prisma.categoriaServicio,
        prisma.valoracion,
        prisma.cita,
        prisma.ubicacionProfesional,
        prisma.perfilProfesional,
        prisma.usuario,
    ] */
    const models = [
    prisma.valoracion,
    prisma.cita,
    prisma.servicio,
    prisma.ubicacionProfesional,
    prisma.perfilProfesional,
    prisma.categoriaServicio,
    prisma.especialidad,
    prisma.usuario,
    ];

    for (const model of models) {
        await (model as any).deleteMany();
    }

    const tablasAutoIncrement = [
        "valoracion",
        "cita",
        "servicio",
        "ubicacion_profesional",
        "perfil_profesional",
        "categoria_servicio",
        "especialidad",
        "usuario",
    ];

    for (const tabla of tablasAutoIncrement) {
        await prisma.$executeRawUnsafe(
            `ALTER TABLE \`${tabla}\` AUTO_INCREMENT = 1`
        );
    }

    /// 2. Creación de datos maestros (Independientes)
    /// Seeds Independientes
    /// Seeds de especialidad

    await prisma.especialidad.createMany({
        data: [
            { especialidad: "Desarrollo Web", descripcion: "Creación y mantenimiento de sitios web, aplicaciones web progresivas y plataformas online responsivas." },
            { especialidad: "Desarrollo Móvil", descripcion: "Desarrollo de aplicaciones nativas e híbridas para iOS y Android usando tecnologías como Flutter, React Native o Swift." },
            { especialidad: "Bases de Datos", descripcion: "Diseño, optimización y administración de bases de datos SQL y NoSQL, incluyendo consultas complejas y modelado de datos." },
            { especialidad: "DevOps y Cloud", descripcion: "Implementación de pipelines CI/CD, automatización de despliegues y gestión de infraestructura en la nube (AWS, Azure, GCP).", estado: false },
            { especialidad: "Ciberseguridad", descripcion: "Auditoría de sistemas, pruebas de penetración, implementación de medidas de seguridad y protección de datos." },
            { especialidad: "Inteligencia Artificial y Ciencia de Datos", descripcion: "Desarrollo de modelos de Machine Learning, análisis predictivo, procesamiento de lenguaje natural y visualización de datos estructurados." },
            { especialidad: "Diseño UI/UX", descripcion: "Creación de interfaces de usuario intuitivas, wireframes, prototipos interactivos y optimización de la experiencia de usuario (UX).", estado: false },
            { especialidad: "Aseguramiento de Calidad (QA Testing)", descripcion: "Diseño y ejecución de pruebas de software automatizadas y manuales para garantizar el correcto funcionamiento y estabilidad del sistema.", estado: false }
        ],
    });

    /// Seeds de categoriaServicio

    await prisma.categoriaServicio.createMany({
        data: [
            { categoria: "Consultoría Técnica", descripcion: "Asesoramiento especializado en arquitectura de software, selección de tecnologías y mejores prácticas para proyectos." },
            { categoria: "Desarrollo a Medida", descripcion: "Creación de soluciones personalizadas según necesidades específicas del cliente, desde prototipos hasta producción." },
            { categoria: "Mantenimiento y Soporte", descripcion: "Actualización de sistemas existentes, corrección de errores, optimización de rendimiento y soporte continuo.", estado: false },
            { categoria: "Capacitación y Formación", descripcion: "Entrenamiento en tecnologías específicas, buenas prácticas de programación y metodologías ágiles para equipos." },
            { categoria: "Migración y Modernización", descripcion: "Actualización de sistemas legados a tecnologías modernas, migración a la nube y refactorización de código.", estado: false }
        ],
    });

    /// Seeds de usuario

    await prisma.usuario.createMany({
        data: [
            { email: "admin@gmail.com", nombre: "Admin", apellidos: ".", password: "hash_password", rol: Rol.ADMINISTRADOR },
            { email: "Adriel@correo.com", nombre: "Adriel", apellidos: "Gómez", password: "hash_password", rol: Rol.ADMINISTRADOR },
            { email: "alejandro@gmail.com", nombre: "Alejandro", apellidos: "Serrano", password: "hash_password", rol: Rol.PROFESIONAL },
            { email: "daniela.rojas@correo.com", nombre: "Daniela", apellidos: "Rojas Vargas", password: "hash_password", rol: Rol.PROFESIONAL },
            { email: "sebastian.mora@correo.com", nombre: "Sebastián", apellidos: "Mora Jiménez", password: "hash_password", rol: Rol.PROFESIONAL },
            { email: "valeria@correo.com", nombre: "Valeria", apellidos: "Méndez", password: "hash_password", rol: Rol.PROFESIONAL },
            { email: "franklin@correo.com", nombre: "Franklin", apellidos: "Montoya", password: "hash_password", rol: Rol.PROFESIONAL },
            { email: "camila.solis@correo.com", nombre: "Camila", apellidos: "Solís Hernández", password: "hash_password", rol: Rol.CLIENTE, estado: EstadoUsuario.BLOQUEADO},
            { email: "andrey@correo.com", nombre: "Andrey", apellidos: "Pérez", password: "hash_password", rol: Rol.CLIENTE, estado: EstadoUsuario.BLOQUEADO },
            { email: "fabián@correo.com", nombre: "Fabián", apellidos: "Zamora", password: "hash_password", rol: Rol.CLIENTE },
            { email: "gael@correo.com", nombre: "Gael", apellidos: "Osorio", password: "hash_password", rol: Rol.CLIENTE },
        ],
        //skipDuplicates: true, 
    });



    // 3. Recuperar datos para mapeo (Uso de Maps para optimizar)

    const [serv, esp, users, prof, catServ] = await Promise.all([
        prisma.servicio.findMany(),
        prisma.especialidad.findMany(),
        prisma.usuario.findMany(),
        prisma.perfilProfesional.findMany(),
        prisma.categoriaServicio.findMany()
    ]);

    const servMap = Object.fromEntries(serv.map((c) => [c.servicio, c.id]));
    const espMap = Object.fromEntries(esp.map((e) => [e.especialidad, e.id]));
    const usersNomMap = Object.fromEntries(users.map((p) => [p.nombre, p.id]));
    const userEmailMap = Object.fromEntries(users.map((u) => [u.email, u.id]));
    const profUserMap = Object.fromEntries(prof.map((u) => [u.id_usuario, u.id]));
    const catServMap = Object.fromEntries(catServ.map((u) => [u.categoria, u.id]));


    ///Seeds Dependientes
    //Seeds perfilProfesional


    const profesional = await prisma.perfilProfesional.create({
        data: {
            titulo: "Ingeniero en software",
            descripcion: "Ingeniero en software dispuesto a seguir los requerimientos necesarios para hacer la aplicación que desees",
            tarifa_por_hora: 10000,
            annos_experiencia: 5,
            telefono: "87716188",
            imagen_profesional: "profesionalAlejandro.jpeg",
            disponibilidad: true,
            modalidad: Modalidad.VIRTUAL,
            id_usuario: userEmailMap["alejandro@gmail.com"],
            especialidades: {
                connect: [
                    { id: espMap["Desarrollo Web"] }, { id: espMap["Desarrollo Móvil"] }
                ]
            }
        }
    });

    const profesionalDaniela = await prisma.perfilProfesional.create({
        data: {
            titulo: "Desarrolladora web",
            descripcion: "Especialista en aplicaciones web modernas y diseño de interfaces.",
            tarifa_por_hora: 12000,
            annos_experiencia: 4,
            telefono: "88881111",
            imagen_profesional: "profesionalDaniela.jpg",
            disponibilidad: true,
            modalidad: Modalidad.HÍBRIDA,
            id_usuario: userEmailMap["daniela.rojas@correo.com"],
            especialidades: {
                connect: [
                    { id: espMap["Desarrollo Web"] },
                    { id: espMap["Diseño UI/UX"] }
                ]
            }
        }
    });

    const profesionalSebastian = await prisma.perfilProfesional.create({
        data: {
            titulo: "Administrador de bases de datos",
            descripcion: "Especialista en diseño, optimización y mantenimiento de bases de datos.",
            tarifa_por_hora: 13500,
            annos_experiencia: 6,
            telefono: "88882222",
            imagen_profesional: "profesionalSebastian.jpg",
            disponibilidad: true,
            modalidad: Modalidad.VIRTUAL,
            id_usuario: userEmailMap["sebastian.mora@correo.com"],
            especialidades: {
                connect: [
                    { id: espMap["Bases de Datos"] },
                    { id: espMap["DevOps y Cloud"] }
                ]
            }
        }
    });

    const profesionalValeria = await prisma.perfilProfesional.create({
        data: {
            titulo: "Especialista en ciberseguridad",
            descripcion: "Profesional enfocada en auditorías, protección de datos y seguridad de aplicaciones.",
            tarifa_por_hora: 15000,
            annos_experiencia: 7,
            telefono: "88883333",
            imagen_profesional: "profesionalValeria.jpg",
            disponibilidad: true,
            modalidad: Modalidad.HÍBRIDA,
            id_usuario: userEmailMap["valeria@correo.com"],
            especialidades: {
                connect: [
                    { id: espMap["Ciberseguridad"] },
                    { id: espMap["Aseguramiento de Calidad (QA Testing)"] }
                ]
            }
        }
    });

    const profesionalFranklin = await prisma.perfilProfesional.create({
        data: {
            titulo: "Ingeniero de inteligencia artificial",
            descripcion: "Especialista en inteligencia artificial, análisis de datos y automatización.",
            tarifa_por_hora: 16000,
            annos_experiencia: 8,
            telefono: "88884444",
            imagen_profesional: "profesionalFranklin.jpeg",
            disponibilidad: true,
            modalidad: Modalidad.VIRTUAL,
            id_usuario: userEmailMap["franklin@correo.com"],
            especialidades: {
                connect: [
                    {
                        id: espMap[
                            "Inteligencia Artificial y Ciencia de Datos"
                        ]
                    },
                    { id: espMap["Bases de Datos"] }
                ]
            }
        }
    });




    //Seeds ubicacionProfesional

    await prisma.ubicacionProfesional.createMany({
        data: [
            {
                id: 1,
                descripcion: "125m Norte de la escuela de Getsemaní",
                id_distrito: 40504,
                distrito: "Los Ángeles",
                canton: "San Rafael",
                ciudad: "Heredia",
                id_profesional: profesional.id
            },
            {
                descripcion: "Frente al parque central de San Pedro",
                id_distrito: 11501,
                distrito: "San Pedro",
                canton: "Montes de Oca",
                ciudad: "San José",
                id_profesional: profesionalDaniela.id
            },
            {
                descripcion: "200 metros oeste de la municipalidad",
                id_distrito: 40101,
                distrito: "Heredia",
                canton: "Heredia",
                ciudad: "Heredia",
                id_profesional: profesionalSebastian.id
            },
            {
                descripcion: "Centro corporativo, segundo piso",
                id_distrito: 10201,
                distrito: "Escazú",
                canton: "Escazú",
                ciudad: "San José",
                id_profesional: profesionalValeria.id
            },
            {
                descripcion: "100 metros norte del parque de Curridabat",
                id_distrito: 11801,
                distrito: "Curridabat",
                canton: "Curridabat",
                ciudad: "San José",
                id_profesional: profesionalFranklin.id
            }
        ]
    });

    

    //Seeds servicios
    // Seeds servicios con especialidades relacionadas

    await prisma.servicio.create({
        data: {
            servicio: "Software estandard",
            descripcion: "Desarrollo de software a medida según requerimientos del cliente",
            precio: 10000,
            duracion_estimada: 60,
            estado: true,
            modalidad: Modalidad.VIRTUAL,
            id_categoria: catServMap["Mantenimiento y Soporte"],
            id_profesional: profesional.id,

            especialidades: {
                connect: [
                    { id: espMap["Desarrollo Web"] },
                    { id: espMap["Desarrollo Móvil"] }
                ]
            }
        }
    });

    await prisma.servicio.create({
        data: {
            servicio: "Aplicación móvil básica",
            descripcion: "Desarrollo de aplicación móvil para Android y iOS con funcionalidades esenciales",
            precio: 120000,
            duracion_estimada: 60,
            estado: true,
            modalidad: Modalidad.HÍBRIDA,
            id_categoria: catServMap["Desarrollo a Medida"],
            id_profesional: profesionalDaniela.id,

            especialidades: {
                connect: [
                    { id: espMap["Desarrollo Web"] },
                    { id: espMap["Desarrollo Móvil"] }
                ]
            }
        }
    });

    await prisma.servicio.createMany({
        data: [
            {
                servicio: "Desarrollo de sitio web informativo",
                descripcion: "Creación de sitio web corporativo o institucional con diseño responsivo",
                precio: 85000,
                duracion_estimada: 60,
                estado: true,
                modalidad: Modalidad.VIRTUAL,
                id_categoria: catServMap["Desarrollo a Medida"],
                id_profesional: profesionalSebastian.id
            },
            {
                servicio: "Optimización de base de datos",
                descripcion: "Análisis y mejora de rendimiento de consultas y estructura de datos",
                precio: 65000,
                duracion_estimada: 60,
                estado: false,
                modalidad: Modalidad.VIRTUAL,
                id_categoria: catServMap["Consultoría Técnica"],
                id_profesional: profesionalValeria.id
            },
            {
                servicio: "Revisión de seguridad básica",
                descripcion: "Auditoría inicial de seguridad y vulnerabilidades en sistemas web",
                precio: 75000,
                duracion_estimada: 60,
                estado: true,
                modalidad: Modalidad.VIRTUAL,
                id_categoria: catServMap["Consultoría Técnica"],
                id_profesional: profesionalFranklin.id
            },
            {
                servicio: "Mantenimiento mensual de sistema",
                descripcion: "Soporte y actualizaciones correctivas de sistemas en producción",
                precio: 95000,
                duracion_estimada: 60,
                estado: true,
                modalidad: Modalidad.VIRTUAL,
                id_categoria: catServMap["Mantenimiento y Soporte"],
                id_profesional: profesional.id
            },
            {
                servicio: "Capacitación en desarrollo web",
                descripcion: "Formación en tecnologías web modernas para equipos de desarrollo",
                precio: 55000,
                duracion_estimada: 60,
                estado: true,
                modalidad: Modalidad.PRESENCIAL,
                id_categoria: catServMap["Capacitación y Formación"],
                id_profesional: profesionalDaniela.id
            },
            {
                servicio: "Migración de sistema legado",
                descripcion: "Actualización y migración de sistemas antiguos a tecnologías modernas",
                precio: 150000,
                duracion_estimada: 60,
                estado: true,
                modalidad: Modalidad.HÍBRIDA,
                id_categoria: catServMap["Migración y Modernización"],
                id_profesional: profesionalSebastian.id
            },
            {
                servicio: "Auditoría de arquitectura de software",
                descripcion: "Evaluación y mejora de la estructura técnica de sistemas existentes",
                precio: 110000,
                duracion_estimada: 60,
                estado: true,
                modalidad: Modalidad.VIRTUAL,
                id_categoria: catServMap["Consultoría Técnica"],
                id_profesional: profesionalValeria.id
            },
            {
                servicio: "Refactorización y modernización de aplicaciones",
                descripcion: "Actualización de código y arquitectura para mejorar rendimiento y mantenibilidad",
                precio: 140000,
                duracion_estimada: 60,
                estado: true,
                modalidad: Modalidad.HÍBRIDA,
                id_categoria: catServMap["Migración y Modernización"],
                id_profesional: profesionalFranklin.id
            }
        ]
    });

    // Seeds de citas

    await prisma.cita.createMany({
        data: [
            // =====================================================
            // PROFESIONAL 1: Alejandro
            // Servicios: 1 y 6
            // =====================================================

            {
                fecha_hora_inicio: new Date("2026-06-10T09:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-06-10T10:00:00"),
                fecha_hora_finalizacion_real: new Date("2026-06-10T10:05:00"),
                comentario_cliente: "Solicito revisión de una solución de software estándar.",
                monto_estimado: 10000,
                modalidad: Modalidad.VIRTUAL,
                estado: EstadoCita.COMPLETADA,
                id_cliente: 10,
                id_profesional: 1,
                id_servicio: 1
            },
            {
                fecha_hora_inicio: new Date("2026-07-15T08:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-07-15T09:00:00"),
                fecha_hora_finalizacion_real: null,
                comentario_cliente: "Necesito mantenimiento preventivo del sistema empresarial.",
                monto_estimado: 95000,
                modalidad: Modalidad.VIRTUAL,
                estado: EstadoCita.ACEPTADA,
                id_cliente: 11,
                id_profesional: 1,
                id_servicio: 6
            },
            {
                fecha_hora_inicio: new Date("2026-08-05T14:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-08-05T15:00:00"),
                fecha_hora_finalizacion_real: null,
                comentario_cliente: "Deseo orientación para seleccionar una solución de software.",
                monto_estimado: 10000,
                modalidad: Modalidad.VIRTUAL,
                estado: EstadoCita.PENDIENTE,
                id_cliente: 10,
                id_profesional: 1,
                id_servicio: 1
            },

            // =====================================================
            // PROFESIONAL 2: Daniela
            // Servicios: 2 y 7
            // =====================================================

            {
                fecha_hora_inicio: new Date("2026-06-12T09:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-06-12T10:00:00"),
                fecha_hora_finalizacion_real: new Date("2026-06-12T10:55:00"),
                comentario_cliente: "Capacitación introductoria sobre desarrollo web.",
                monto_estimado: 55000,
                modalidad: Modalidad.PRESENCIAL,
                estado: EstadoCita.COMPLETADA,
                id_cliente: 11,
                id_profesional: 2,
                id_servicio: 7
            },
            {
                fecha_hora_inicio: new Date("2026-07-20T08:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-07-20T09:00:00"),
                fecha_hora_finalizacion_real: null,
                comentario_cliente: "Requiero el desarrollo de una aplicación móvil básica.",
                monto_estimado: 120000,
                modalidad: Modalidad.HÍBRIDA,
                estado: EstadoCita.PENDIENTE,
                id_cliente: 10,
                id_profesional: 2,
                id_servicio: 2
            },
            {
                fecha_hora_inicio: new Date("2026-07-25T13:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-07-25T14:00:00"),
                fecha_hora_finalizacion_real: null,
                comentario_cliente: "Capacitación para mejorar conocimientos de desarrollo web.",
                monto_estimado: 55000,
                modalidad: Modalidad.PRESENCIAL,
                estado: EstadoCita.CANCELADA,
                id_cliente: 11,
                id_profesional: 2,
                id_servicio: 7
            },

            // =====================================================
            // PROFESIONAL 3: Sebastián
            // Servicios: 3 y 8
            // =====================================================

            {
                fecha_hora_inicio: new Date("2026-06-18T09:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-06-18T10:00:00"),
                fecha_hora_finalizacion_real: new Date("2026-06-18T13:10:00"),
                comentario_cliente: "Desarrollo de un sitio web informativo para una pequeña empresa.",
                monto_estimado: 85000,
                modalidad: Modalidad.VIRTUAL,
                estado: EstadoCita.COMPLETADA,
                id_cliente: 10,
                id_profesional: 3,
                id_servicio: 3
            },
            {
                fecha_hora_inicio: new Date("2026-07-22T08:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-07-22T09:00:00"),
                fecha_hora_finalizacion_real: null,
                comentario_cliente: "Necesito migrar un sistema antiguo a una plataforma moderna.",
                monto_estimado: 150000,
                modalidad: Modalidad.HÍBRIDA,
                estado: EstadoCita.ACEPTADA,
                id_cliente: 11,
                id_profesional: 3,
                id_servicio: 8
            },
            {
                fecha_hora_inicio: new Date("2026-08-10T09:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-08-10T10:00:00"),
                fecha_hora_finalizacion_real: null,
                comentario_cliente: "Solicito la creación de un sitio web para presentar mis servicios.",
                monto_estimado: 85000,
                modalidad: Modalidad.VIRTUAL,
                estado: EstadoCita.PENDIENTE,
                id_cliente: 10,
                id_profesional: 3,
                id_servicio: 3
            },

            // =====================================================
            // PROFESIONAL 4: Valeria
            // Servicio activo: 9
            // El servicio 4 está inactivo
            // =====================================================

            {
                fecha_hora_inicio: new Date("2026-06-20T08:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-06-20T09:00:00"),
                fecha_hora_finalizacion_real: new Date("2026-06-20T11:50:00"),
                comentario_cliente: "Auditoría de arquitectura para detectar oportunidades de mejora.",
                monto_estimado: 110000,
                modalidad: Modalidad.VIRTUAL,
                estado: EstadoCita.COMPLETADA,
                id_cliente: 11,
                id_profesional: 4,
                id_servicio: 9
            },
            {
                fecha_hora_inicio: new Date("2026-07-18T09:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-07-18T10:00:00"),
                fecha_hora_finalizacion_real: null,
                comentario_cliente: "Solicito revisión de la arquitectura de una aplicación.",
                monto_estimado: 110000,
                modalidad: Modalidad.VIRTUAL,
                estado: EstadoCita.RECHAZADA,
                id_cliente: 10,
                id_profesional: 4,
                id_servicio: 9
            },
            {
                fecha_hora_inicio: new Date("2026-08-12T13:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-08-12T14:00:00"),
                fecha_hora_finalizacion_real: null,
                comentario_cliente: "Necesito evaluar la estructura técnica de mi sistema.",
                monto_estimado: 110000,
                modalidad: Modalidad.VIRTUAL,
                estado: EstadoCita.PENDIENTE,
                id_cliente: 11,
                id_profesional: 4,
                id_servicio: 9
            },

            // =====================================================
            // PROFESIONAL 5: Franklin
            // Servicios: 5 y 10
            // =====================================================

            {
                fecha_hora_inicio: new Date("2026-06-25T09:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-06-25T10:00:00"),
                fecha_hora_finalizacion_real: new Date("2026-06-25T12:00:00"),
                comentario_cliente: "Revisión básica de seguridad para una aplicación web.",
                monto_estimado: 75000,
                modalidad: Modalidad.VIRTUAL,
                estado: EstadoCita.COMPLETADA,
                id_cliente: 10,
                id_profesional: 5,
                id_servicio: 5
            },
            {
                fecha_hora_inicio: new Date("2026-07-28T08:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-07-28T09:00:00"),
                fecha_hora_finalizacion_real: null,
                comentario_cliente: "Solicito modernizar y refactorizar una aplicación existente.",
                monto_estimado: 140000,
                modalidad: Modalidad.HÍBRIDA,
                estado: EstadoCita.ACEPTADA,
                id_cliente: 11,
                id_profesional: 5,
                id_servicio: 10
            },
            {
                fecha_hora_inicio: new Date("2026-08-15T09:00:00"),
                fecha_hora_finalizacion_esperada: new Date("2026-08-15T10:00:00"),
                fecha_hora_finalizacion_real: null,
                comentario_cliente: "Deseo revisar la seguridad general de mi plataforma.",
                monto_estimado: 75000,
                modalidad: Modalidad.VIRTUAL,
                estado: EstadoCita.PENDIENTE,
                id_cliente: 10,
                id_profesional: 5,
                id_servicio: 5
            }
        ]
    });

    
}
main()
    .catch((e) => {
        console.error("Error en seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });