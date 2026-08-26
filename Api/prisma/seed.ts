import { prisma } from "../src/config/prisma";
import { EstadoCita, EstadoUsuario, Modalidad, Rol } from "../generated/prisma/enums";
import bcrypt from "bcryptjs";

async function main() {
    console.log("Iniciando seed...");
    const passwordHash = await bcrypt.hash("123456", 10);

    // 1. Limpieza de datos
    const models = [
        prisma.historialCita,
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
        "historial_cita",
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

    // 2. Creación de datos maestros (Independientes)

    // Especialidades
    const especialidades = await prisma.especialidad.createMany({
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

    // Categorías de servicio
    const categorias = await prisma.categoriaServicio.createMany({
        data: [
            { categoria: "Consultoría Técnica", descripcion: "Asesoramiento especializado en arquitectura de software, selección de tecnologías y mejores prácticas para proyectos." },
            { categoria: "Desarrollo a Medida", descripcion: "Creación de soluciones personalizadas según necesidades específicas del cliente, desde prototipos hasta producción." },
            { categoria: "Mantenimiento y Soporte", descripcion: "Actualización de sistemas existentes, corrección de errores, optimización de rendimiento y soporte continuo.", estado: false },
            { categoria: "Capacitación y Formación", descripcion: "Entrenamiento en tecnologías específicas, buenas prácticas de programación y metodologías ágiles para equipos." },
            { categoria: "Migración y Modernización", descripcion: "Actualización de sistemas legados a tecnologías modernas, migración a la nube y refactorización de código.", estado: false }
        ],
    });

    // Usuarios - todos con @correo.com, sin tildes en emails
    const usuarios = await prisma.usuario.createMany({
        data: [
            { email: "admin@correo.com", nombre: "Admin", apellidos: "Sistema", password: passwordHash, rol: Rol.ADMINISTRADOR },
            { email: "adriel@correo.com", nombre: "Adriel", apellidos: "Gomez", password: passwordHash, rol: Rol.ADMINISTRADOR },
            { email: "alejandro@correo.com", nombre: "Alejandro", apellidos: "Serrano", password: passwordHash, rol: Rol.PROFESIONAL },
            { email: "daniela@correo.com", nombre: "Daniela", apellidos: "Rojas Vargas", password: passwordHash, rol: Rol.PROFESIONAL },
            { email: "sebastian@correo.com", nombre: "Sebastian", apellidos: "Mora Jimenez", password: passwordHash, rol: Rol.PROFESIONAL },
            { email: "valeria@correo.com", nombre: "Valeria", apellidos: "Mendez", password: passwordHash, rol: Rol.PROFESIONAL },
            { email: "franklin@correo.com", nombre: "Franklin", apellidos: "Montoya", password: passwordHash, rol: Rol.PROFESIONAL },
            { email: "camila@correo.com", nombre: "Camila", apellidos: "Solís Hernández", password: passwordHash, rol: Rol.CLIENTE, estado: EstadoUsuario.BLOQUEADO },
            { email: "andrey@correo.com", nombre: "Andrey", apellidos: "Perez", password: passwordHash, rol: Rol.CLIENTE, estado: EstadoUsuario.BLOQUEADO },
            { email: "fabian@correo.com", nombre: "Fabian", apellidos: "Zamora", password: passwordHash, rol: Rol.CLIENTE },
            { email: "gael@correo.com", nombre: "Gael", apellidos: "Osorio", password: passwordHash, rol: Rol.CLIENTE },
        ],
    });

    // Recuperar datos para mapeo
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

    // 3. Perfiles profesionales
    const profesionalAlejandro = await prisma.perfilProfesional.create({
        data: {
            titulo: "Ingeniero en software",
            descripcion: "Ingeniero en software dispuesto a seguir los requerimientos necesarios para hacer la aplicación que desees",
            tarifa_por_hora: 10000,
            annos_experiencia: 5,
            telefono: "87716188",
            imagen_profesional: "profesionalAlejandro.jpeg",
            disponibilidad: true,
            modalidad: Modalidad.VIRTUAL,
            id_usuario: userEmailMap["alejandro@correo.com"],
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
            id_usuario: userEmailMap["daniela@correo.com"],
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
            id_usuario: userEmailMap["sebastian@correo.com"],
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

    // Ubicaciones profesionales
    await prisma.ubicacionProfesional.createMany({
        data: [
            {
                descripcion: "125m Norte de la escuela de Getsemaní",
                id_distrito: 40504,
                distrito: "Los Ángeles",
                canton: "San Rafael",
                ciudad: "Heredia",
                id_profesional: profesionalAlejandro.id
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

    // 4. Servicios
    const servicio1 = await prisma.servicio.create({
        data: {
            servicio: "Software estandard",
            descripcion: "Desarrollo de software a medida según requerimientos del cliente",
            precio: 10000,
            duracion_estimada: 60,
            estado: true,
            modalidad: Modalidad.VIRTUAL,
            id_categoria: catServMap["Mantenimiento y Soporte"],
            id_profesional: profesionalAlejandro.id,
            especialidades: {
                connect: [
                    { id: espMap["Desarrollo Web"] },
                    { id: espMap["Desarrollo Móvil"] }
                ]
            }
        }
    });

    const servicio2 = await prisma.servicio.create({
        data: {
            servicio: "Aplicación móvil básica",
            descripcion: "Desarrollo de aplicación móvil para Android y iOS con funcionalidades esenciales",
            precio: 120000,
            duracion_estimada: 90,
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

    const servicios = await prisma.servicio.createMany({
        data: [
            {
                servicio: "Desarrollo de sitio web informativo",
                descripcion: "Creación de sitio web corporativo o institucional con diseño responsivo",
                precio: 85000,
                duracion_estimada: 90,
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
                id_profesional: profesionalAlejandro.id
            },
            {
                servicio: "Capacitación en desarrollo web",
                descripcion: "Formación en tecnologías web modernas para equipos de desarrollo",
                precio: 55000,
                duracion_estimada: 120,
                estado: true,
                modalidad: Modalidad.PRESENCIAL,
                id_categoria: catServMap["Capacitación y Formación"],
                id_profesional: profesionalDaniela.id
            },
            {
                servicio: "Migración de sistema legado",
                descripcion: "Actualización y migración de sistemas antiguos a tecnologías modernas",
                precio: 150000,
                duracion_estimada: 120,
                estado: true,
                modalidad: Modalidad.HÍBRIDA,
                id_categoria: catServMap["Migración y Modernización"],
                id_profesional: profesionalSebastian.id
            },
            {
                servicio: "Auditoría de arquitectura de software",
                descripcion: "Evaluación y mejora de la estructura técnica de sistemas existentes",
                precio: 110000,
                duracion_estimada: 120,
                estado: true,
                modalidad: Modalidad.VIRTUAL,
                id_categoria: catServMap["Consultoría Técnica"],
                id_profesional: profesionalValeria.id
            },
            {
                servicio: "Refactorización y modernización de aplicaciones",
                descripcion: "Actualización de código y arquitectura para mejorar rendimiento y mantenibilidad",
                precio: 140000,
                duracion_estimada: 120,
                estado: true,
                modalidad: Modalidad.HÍBRIDA,
                id_categoria: catServMap["Migración y Modernización"],
                id_profesional: profesionalFranklin.id
            }
        ]
    });

    // Obtener IDs de servicios creados
    const allServicios = await prisma.servicio.findMany({
        where: {
            id_profesional: {
                in: [profesionalAlejandro.id, profesionalDaniela.id, profesionalSebastian.id, profesionalValeria.id, profesionalFranklin.id]
            }
        }
    });

    const servByProf = Object.fromEntries(
        allServicios.map(s => [`${s.id_profesional}-${s.servicio}`, s.id])
    );

    // Clientes
    const clienteFabian = usersNomMap["Fabian"];
    const clienteGael = usersNomMap["Gael"];

    // Helper para fechas relativas a hoy
    const hoy = new Date();
    const makeDate = (daysOffset: number, hour: number, minute: number = 0) => {
        const d = new Date(hoy);
        d.setDate(d.getDate() + daysOffset);
        d.setHours(hour, minute, 0, 0);
        return d;
    };

    // 5. Citas con IDs reales y fechas coherentes
    const citasData = [
        // PROFESIONAL 1: Alejandro (VIRTUAL, servicios 60 min)
        {
            fecha_hora_inicio: makeDate(-20, 9, 0),
            fecha_hora_finalizacion_esperada: makeDate(-20, 10, 0),
            fecha_hora_finalizacion_real: makeDate(-20, 10, 5),
            comentario_cliente: "Solicito revisión de una solución de software estándar.",
            monto_estimado: 10000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteFabian,
            id_profesional: profesionalAlejandro.id,
            id_servicio: servByProf[`${profesionalAlejandro.id}-Software estandard`]
        },
        {
            fecha_hora_inicio: makeDate(-5, 8, 0),
            fecha_hora_finalizacion_esperada: makeDate(-5, 9, 0),
            fecha_hora_finalizacion_real: null,
            comentario_cliente: "Necesito mantenimiento preventivo del sistema empresarial.",
            monto_estimado: 95000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.ACEPTADA,
            id_cliente: clienteGael,
            id_profesional: profesionalAlejandro.id,
            id_servicio: servByProf[`${profesionalAlejandro.id}-Mantenimiento mensual de sistema`]
        },
        {
            fecha_hora_inicio: makeDate(5, 14, 0),
            fecha_hora_finalizacion_esperada: makeDate(5, 15, 0),
            fecha_hora_finalizacion_real: null,
            comentario_cliente: "Deseo orientación para seleccionar una solución de software.",
            monto_estimado: 10000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.PENDIENTE,
            id_cliente: clienteFabian,
            id_profesional: profesionalAlejandro.id,
            id_servicio: servByProf[`${profesionalAlejandro.id}-Software estandard`]
        },

        // PROFESIONAL 2: Daniela (HIBRIDA, servicios 90 y 120 min)
        {
            fecha_hora_inicio: makeDate(-18, 9, 0),
            fecha_hora_finalizacion_esperada: makeDate(-18, 11, 0), // 120 min
            fecha_hora_finalizacion_real: makeDate(-18, 11, 5),
            comentario_cliente: "Capacitación introductoria sobre desarrollo web para mi equipo.",
            monto_estimado: 55000,
            modalidad: Modalidad.PRESENCIAL,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteGael,
            id_profesional: profesionalDaniela.id,
            id_servicio: servByProf[`${profesionalDaniela.id}-Capacitación en desarrollo web`]
        },
        {
            fecha_hora_inicio: makeDate(-2, 8, 0),
            fecha_hora_finalizacion_esperada: makeDate(-2, 9, 30), // 90 min
            fecha_hora_finalizacion_real: null,
            comentario_cliente: "Requiero el desarrollo de una aplicación móvil básica.",
            monto_estimado: 120000,
            modalidad: Modalidad.HÍBRIDA,
            estado: EstadoCita.PENDIENTE,
            id_cliente: clienteFabian,
            id_profesional: profesionalDaniela.id,
            id_servicio: servByProf[`${profesionalDaniela.id}-Aplicación móvil básica`]
        },
        {
            fecha_hora_inicio: makeDate(3, 13, 0),
            fecha_hora_finalizacion_esperada: makeDate(3, 15, 0), // 120 min
            fecha_hora_finalizacion_real: null,
            comentario_cliente: "Capacitación para mejorar conocimientos de desarrollo web.",
            monto_estimado: 55000,
            modalidad: Modalidad.PRESENCIAL,
            estado: EstadoCita.CANCELADA,
            id_cliente: clienteGael,
            id_profesional: profesionalDaniela.id,
            id_servicio: servByProf[`${profesionalDaniela.id}-Capacitación en desarrollo web`]
        },

        // PROFESIONAL 3: Sebastian (VIRTUAL, servicios 90 y 120 min)
        {
            fecha_hora_inicio: makeDate(-12, 9, 0),
            fecha_hora_finalizacion_esperada: makeDate(-12, 10, 30), // 90 min
            fecha_hora_finalizacion_real: makeDate(-12, 10, 35),
            comentario_cliente: "Desarrollo de un sitio web informativo para una pequeña empresa.",
            monto_estimado: 85000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteFabian,
            id_profesional: profesionalSebastian.id,
            id_servicio: servByProf[`${profesionalSebastian.id}-Desarrollo de sitio web informativo`]
        },
        {
            fecha_hora_inicio: makeDate(-3, 8, 0),
            fecha_hora_finalizacion_esperada: makeDate(-3, 10, 0), // 120 min
            fecha_hora_finalizacion_real: null,
            comentario_cliente: "Necesito migrar un sistema antiguo a una plataforma moderna.",
            monto_estimado: 150000,
            modalidad: Modalidad.HÍBRIDA,
            estado: EstadoCita.ACEPTADA,
            id_cliente: clienteGael,
            id_profesional: profesionalSebastian.id,
            id_servicio: servByProf[`${profesionalSebastian.id}-Migración de sistema legado`]
        },
        {
            fecha_hora_inicio: makeDate(10, 9, 0),
            fecha_hora_finalizacion_esperada: makeDate(10, 10, 30), // 90 min
            fecha_hora_finalizacion_real: null,
            comentario_cliente: "Solicito la creación de un sitio web para presentar mis servicios.",
            monto_estimado: 85000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.PENDIENTE,
            id_cliente: clienteFabian,
            id_profesional: profesionalSebastian.id,
            id_servicio: servByProf[`${profesionalSebastian.id}-Desarrollo de sitio web informativo`]
        },

        // PROFESIONAL 4: Valeria (HIBRIDA, servicios 60 y 120 min)
        {
            fecha_hora_inicio: makeDate(-10, 8, 0),
            fecha_hora_finalizacion_esperada: makeDate(-10, 10, 0), // 120 min
            fecha_hora_finalizacion_real: makeDate(-10, 10, 5),
            comentario_cliente: "Auditoría de arquitectura para detectar oportunidades de mejora.",
            monto_estimado: 110000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteGael,
            id_profesional: profesionalValeria.id,
            id_servicio: servByProf[`${profesionalValeria.id}-Auditoría de arquitectura de software`]
        },
        {
            fecha_hora_inicio: makeDate(-7, 9, 0),
            fecha_hora_finalizacion_esperada: makeDate(-7, 10, 0), // 60 min
            fecha_hora_finalizacion_real: null,
            comentario_cliente: "Solicito revisión de la arquitectura de una aplicación.",
            monto_estimado: 110000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.RECHAZADA,
            id_cliente: clienteFabian,
            id_profesional: profesionalValeria.id,
            id_servicio: servByProf[`${profesionalValeria.id}-Auditoría de arquitectura de software`]
        },
        {
            fecha_hora_inicio: makeDate(12, 13, 0),
            fecha_hora_finalizacion_esperada: makeDate(12, 15, 0), // 120 min
            fecha_hora_finalizacion_real: null,
            comentario_cliente: "Necesito evaluar la estructura técnica de mi sistema.",
            monto_estimado: 110000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.PENDIENTE,
            id_cliente: clienteGael,
            id_profesional: profesionalValeria.id,
            id_servicio: servByProf[`${profesionalValeria.id}-Auditoría de arquitectura de software`]
        },

        // PROFESIONAL 5: Franklin (VIRTUAL, servicios 60 y 120 min)
        {
            fecha_hora_inicio: makeDate(-5, 9, 0),
            fecha_hora_finalizacion_esperada: makeDate(-5, 10, 0), // 60 min
            fecha_hora_finalizacion_real: makeDate(-5, 10, 3),
            comentario_cliente: "Revisión básica de seguridad para una aplicación web.",
            monto_estimado: 75000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteFabian,
            id_profesional: profesionalFranklin.id,
            id_servicio: servByProf[`${profesionalFranklin.id}-Revisión de seguridad básica`]
        },
        {
            fecha_hora_inicio: makeDate(-1, 8, 0),
            fecha_hora_finalizacion_esperada: makeDate(-1, 10, 0), // 120 min
            fecha_hora_finalizacion_real: null,
            comentario_cliente: "Solicito modernizar y refactorizar una aplicación existente.",
            monto_estimado: 140000,
            modalidad: Modalidad.HÍBRIDA,
            estado: EstadoCita.ACEPTADA,
            id_cliente: clienteGael,
            id_profesional: profesionalFranklin.id,
            id_servicio: servByProf[`${profesionalFranklin.id}-Refactorización y modernización de aplicaciones`]
        },
        {
            fecha_hora_inicio: makeDate(15, 9, 0),
            fecha_hora_finalizacion_esperada: makeDate(15, 10, 0), // 60 min
            fecha_hora_finalizacion_real: null,
            comentario_cliente: "Deseo revisar la seguridad general de mi plataforma.",
            monto_estimado: 75000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.PENDIENTE,
            id_cliente: clienteFabian,
            id_profesional: profesionalFranklin.id,
            id_servicio: servByProf[`${profesionalFranklin.id}-Revisión de seguridad básica`]
        },

        // =====================================================
        // CITAS COMPLETADAS ADICIONALES para más valoraciones
        // =====================================================

        // Alejandro - 2 más (total 4)
        {
            fecha_hora_inicio: makeDate(-30, 10, 0),
            fecha_hora_finalizacion_esperada: makeDate(-30, 11, 0),
            fecha_hora_finalizacion_real: makeDate(-30, 11, 3),
            comentario_cliente: "Consultoría para arquitectura de microservicios.",
            monto_estimado: 10000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteGael,
            id_profesional: profesionalAlejandro.id,
            id_servicio: servByProf[`${profesionalAlejandro.id}-Software estandard`]
        },
        {
            fecha_hora_inicio: makeDate(-40, 15, 0),
            fecha_hora_finalizacion_esperada: makeDate(-40, 16, 0),
            fecha_hora_finalizacion_real: makeDate(-40, 16, 2),
            comentario_cliente: "Revisión de código y buenas prácticas.",
            monto_estimado: 95000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteFabian,
            id_profesional: profesionalAlejandro.id,
            id_servicio: servByProf[`${profesionalAlejandro.id}-Mantenimiento mensual de sistema`]
        },

        // Daniela - 2 más (total 3)
        {
            fecha_hora_inicio: makeDate(-25, 9, 0),
            fecha_hora_finalizacion_esperada: makeDate(-25, 11, 0), // 120 min
            fecha_hora_finalizacion_real: makeDate(-25, 11, 5),
            comentario_cliente: "Capacitación avanzada en React y TypeScript.",
            monto_estimado: 55000,
            modalidad: Modalidad.PRESENCIAL,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteFabian,
            id_profesional: profesionalDaniela.id,
            id_servicio: servByProf[`${profesionalDaniela.id}-Capacitación en desarrollo web`]
        },
        {
            fecha_hora_inicio: makeDate(-35, 14, 0),
            fecha_hora_finalizacion_esperada: makeDate(-35, 15, 30), // 90 min
            fecha_hora_finalizacion_real: makeDate(-35, 15, 25),
            comentario_cliente: "Desarrollo de app móvil para e-commerce.",
            monto_estimado: 120000,
            modalidad: Modalidad.HÍBRIDA,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteGael,
            id_profesional: profesionalDaniela.id,
            id_servicio: servByProf[`${profesionalDaniela.id}-Aplicación móvil básica`]
        },

        // Sebastian - 2 más (total 3)
        {
            fecha_hora_inicio: makeDate(-22, 8, 0),
            fecha_hora_finalizacion_esperada: makeDate(-22, 10, 0), // 120 min
            fecha_hora_finalizacion_real: makeDate(-22, 10, 10),
            comentario_cliente: "Migración completa de sistema legacy a cloud.",
            monto_estimado: 150000,
            modalidad: Modalidad.HÍBRIDA,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteGael,
            id_profesional: profesionalSebastian.id,
            id_servicio: servByProf[`${profesionalSebastian.id}-Migración de sistema legado`]
        },
        {
            fecha_hora_inicio: makeDate(-28, 10, 0),
            fecha_hora_finalizacion_esperada: makeDate(-28, 11, 30), // 90 min
            fecha_hora_finalizacion_real: makeDate(-28, 11, 20),
            comentario_cliente: "Sitio web corporativo con panel admin.",
            monto_estimado: 85000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteFabian,
            id_profesional: profesionalSebastian.id,
            id_servicio: servByProf[`${profesionalSebastian.id}-Desarrollo de sitio web informativo`]
        },

        // Valeria - 2 más (total 3)
        {
            fecha_hora_inicio: makeDate(-15, 9, 0),
            fecha_hora_finalizacion_esperada: makeDate(-15, 11, 0), // 120 min
            fecha_hora_finalizacion_real: makeDate(-15, 11, 8),
            comentario_cliente: "Auditoría completa de seguridad OWASP Top 10.",
            monto_estimado: 110000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteFabian,
            id_profesional: profesionalValeria.id,
            id_servicio: servByProf[`${profesionalValeria.id}-Auditoría de arquitectura de software`]
        },
        {
            fecha_hora_inicio: makeDate(-18, 15, 0),
            fecha_hora_finalizacion_esperada: makeDate(-18, 16, 0), // 60 min
            fecha_hora_finalizacion_real: makeDate(-18, 16, 15),
            comentario_cliente: "Revisión de cumplimiento de normativas de datos.",
            monto_estimado: 110000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteGael,
            id_profesional: profesionalValeria.id,
            id_servicio: servByProf[`${profesionalValeria.id}-Auditoría de arquitectura de software`]
        },

        // Franklin - 2 más (total 3)
        {
            fecha_hora_inicio: makeDate(-12, 8, 0),
            fecha_hora_finalizacion_esperada: makeDate(-12, 10, 0), // 120 min
            fecha_hora_finalizacion_real: makeDate(-12, 10, 5),
            comentario_cliente: "Refactorización de monolito a microservicios.",
            monto_estimado: 140000,
            modalidad: Modalidad.HÍBRIDA,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteFabian,
            id_profesional: profesionalFranklin.id,
            id_servicio: servByProf[`${profesionalFranklin.id}-Refactorización y modernización de aplicaciones`]
        },
        {
            fecha_hora_inicio: makeDate(-8, 14, 0),
            fecha_hora_finalizacion_esperada: makeDate(-8, 15, 0), // 60 min
            fecha_hora_finalizacion_real: makeDate(-8, 15, 2),
            comentario_cliente: "Pentesting básico y reporte de vulnerabilidades.",
            monto_estimado: 75000,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoCita.COMPLETADA,
            id_cliente: clienteGael,
            id_profesional: profesionalFranklin.id,
            id_servicio: servByProf[`${profesionalFranklin.id}-Revisión de seguridad básica`]
        }
    ];

    const citasCreadas = [];
    for (const c of citasData) {
        const creada = await prisma.cita.create({ data: c });
        citasCreadas.push(creada);
    }

    // 6. Historiales de cita
    for (const cita of citasCreadas) {
        const historiales: any[] = [];
        const createdAt = new Date(cita.fecha_hora_inicio.getTime() - 1000 * 60 * 60 * 24 * 3);

        // Registro inicial: PENDIENTE -> PENDIENTE
        historiales.push({
            id_cita: cita.id,
            estado_anterior: "PENDIENTE",
            estado_nuevo: "PENDIENTE",
            comentario: "Cita creada por el cliente.",
            realizado_por: "CLIENTE",
            id_usuario: cita.id_cliente,
            fecha_cambio: createdAt
        });

        if (cita.estado === "ACEPTADA" || cita.estado === "COMPLETADA" || cita.estado === "CANCELADA" || cita.estado === "RECHAZADA") {
            historiales.push({
                id_cita: cita.id,
                estado_anterior: "PENDIENTE",
                estado_nuevo: "ACEPTADA",
                comentario: "El profesional aceptó la solicitud de cita.",
                realizado_por: "PROFESIONAL",
                id_usuario: cita.id_profesional,
                fecha_cambio: new Date(createdAt.getTime() + 1000 * 60 * 60 * 24)
            });
        }

        if (cita.estado === "COMPLETADA") {
            historiales.push({
                id_cita: cita.id,
                estado_anterior: "ACEPTADA",
                estado_nuevo: "COMPLETADA",
                comentario: "Servicio finalizado satisfactoriamente.",
                realizado_por: "PROFESIONAL",
                id_usuario: cita.id_profesional,
                fecha_cambio: new Date(cita.fecha_hora_finalizacion_real!.getTime() + 1000 * 60 * 5)
            });
        } else if (cita.estado === "CANCELADA") {
            historiales.push({
                id_cita: cita.id,
                estado_anterior: "ACEPTADA",
                estado_nuevo: "CANCELADA",
                comentario: "El cliente solicitó la cancelación de la cita.",
                realizado_por: "CLIENTE",
                id_usuario: cita.id_cliente,
                fecha_cambio: new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 2)
            });
        }

        if (cita.estado === "RECHAZADA") {
            historiales.push({
                id_cita: cita.id,
                estado_anterior: "PENDIENTE",
                estado_nuevo: "RECHAZADA",
                comentario: "El profesional no pudo atender la solicitud por conflictos de horario.",
                realizado_por: "PROFESIONAL",
                id_usuario: cita.id_profesional,
                fecha_cambio: new Date(createdAt.getTime() + 1000 * 60 * 60 * 24)
            });
        }

        for (const h of historiales) {
            await prisma.historialCita.create({
                data: {
                    id_cita: h.id_cita,
                    estado_anterior: h.estado_anterior as any,
                    estado_nuevo: h.estado_nuevo as any,
                    comentario: h.comentario,
                    realizado_por: h.realizado_por,
                    id_usuario: h.id_usuario,
                    fecha_cambio: h.fecha_cambio,
                    id_cliente: cita.id_cliente,
                    id_profesional: cita.id_profesional,
                    id_servicio: cita.id_servicio
                }
            });
        }
    }

    // 7. Valoraciones (ratings) - solo para citas COMPLETADAS
    const citasCompletadas = citasCreadas.filter(c => c.estado === EstadoCita.COMPLETADA);

    const valoracionesData = [
        // Alejandro - 2 citas completadas
        {
            puntuacion: 5,
            comentario: "Excelente profesional, entregó el software a tiempo y con gran calidad. Muy recomendado.",
            id_profesional: profesionalAlejandro.id,
            id_cliente: clienteFabian,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalAlejandro.id && c.id_cliente === clienteFabian && c.id_servicio === servByProf[`${profesionalAlejandro.id}-Software estandard`])?.id
        },
        {
            puntuacion: 4,
            comentario: "Buen servicio de mantenimiento, el sistema quedó optimizado. Comunicación fluida.",
            id_profesional: profesionalAlejandro.id,
            id_cliente: clienteGael,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalAlejandro.id && c.id_cliente === clienteGael && c.id_servicio === servByProf[`${profesionalAlejandro.id}-Mantenimiento mensual de sistema`])?.id
        },

        // Daniela - 1 cita completada
        {
            puntuacion: 5,
            comentario: "La capacitación fue muy completa y práctica. Mi equipo aprendió mucho. Daniela explica excelente.",
            id_profesional: profesionalDaniela.id,
            id_cliente: clienteGael,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalDaniela.id && c.id_cliente === clienteGael)?.id
        },

        // Sebastian - 1 cita completada
        {
            puntuacion: 4,
            comentario: "Sitio web entregado según lo acordado. Diseño responsivo y código limpio. Volvería a contratar.",
            id_profesional: profesionalSebastian.id,
            id_cliente: clienteFabian,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalSebastian.id && c.id_cliente === clienteFabian)?.id
        },

        // Valeria - 1 cita completada
        {
            puntuacion: 5,
            comentario: "Auditoría muy exhaustiva, detectó vulnerabilidades que no conocíamos. Muy profesional.",
            id_profesional: profesionalValeria.id,
            id_cliente: clienteGael,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalValeria.id && c.id_cliente === clienteGael)?.id
        },

        // Franklin - 1 cita completada
        {
            puntuacion: 4,
            comentario: "Revisión de seguridad completa y clara en el reporte. Buen trato y respuesta rápida.",
            id_profesional: profesionalFranklin.id,
            id_cliente: clienteFabian,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalFranklin.id && c.id_cliente === clienteFabian)?.id
        },

        // Alejandro - 2 citas completadas adicionales
        {
            puntuacion: 5,
            comentario: "Arquitectura de microservicios muy bien diseñada, escalable y documentada. Gran profesional.",
            id_profesional: profesionalAlejandro.id,
            id_cliente: clienteGael,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalAlejandro.id && c.id_cliente === clienteGael && c.id_servicio === servByProf[`${profesionalAlejandro.id}-Software estandard`])?.id
        },
        {
            puntuacion: 4,
            comentario: "Mantenimiento proactivo, detectó problemas antes de que fueran críticos. Muy confiable.",
            id_profesional: profesionalAlejandro.id,
            id_cliente: clienteFabian,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalAlejandro.id && c.id_cliente === clienteFabian && c.id_servicio === servByProf[`${profesionalAlejandro.id}-Mantenimiento mensual de sistema`])?.id
        },

        // Daniela - 2 citas completadas adicionales
        {
            puntuacion: 5,
            comentario: "Capacitación avanzada excelente, contenido actualizado y ejercicios prácticos muy útiles.",
            id_profesional: profesionalDaniela.id,
            id_cliente: clienteFabian,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalDaniela.id && c.id_cliente === clienteFabian && c.id_servicio === servByProf[`${profesionalDaniela.id}-Capacitación en desarrollo web`])?.id
        },
        {
            puntuacion: 4,
            comentario: "App móvil entregada funcional y con buen diseño. Comunicación constante durante el desarrollo.",
            id_profesional: profesionalDaniela.id,
            id_cliente: clienteGael,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalDaniela.id && c.id_cliente === clienteGael && c.id_servicio === servByProf[`${profesionalDaniela.id}-Aplicación móvil básica`])?.id
        },

        // Sebastian - 2 citas completadas adicionales
        {
            puntuacion: 5,
            comentario: "Migración a cloud impecable, cero downtime y mejora de performance notable. Experto en la materia.",
            id_profesional: profesionalSebastian.id,
            id_cliente: clienteGael,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalSebastian.id && c.id_cliente === clienteGael && c.id_servicio === servByProf[`${profesionalSebastian.id}-Migración de sistema legado`])?.id
        },
        {
            puntuacion: 4,
            comentario: "Sitio corporativo profesional, panel admin intuitivo y fácil de gestionar. Cumplió plazos.",
            id_profesional: profesionalSebastian.id,
            id_cliente: clienteFabian,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalSebastian.id && c.id_cliente === clienteFabian && c.id_servicio === servByProf[`${profesionalSebastian.id}-Desarrollo de sitio web informativo`])?.id
        },

        // Valeria - 2 citas completadas adicionales
        {
            puntuacion: 5,
            comentario: "Auditoría OWASP exhaustiva, reporte detallado con prioridades claras. Muy valioso para nuestra seguridad.",
            id_profesional: profesionalValeria.id,
            id_cliente: clienteFabian,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalValeria.id && c.id_cliente === clienteFabian && c.id_servicio === servByProf[`${profesionalValeria.id}-Auditoría de arquitectura de software`])?.id
        },
        {
            puntuacion: 4,
            comentario: "Revisión de cumplimiento normativo completa, nos ahorró problemas legales futuros. Muy recomendada.",
            id_profesional: profesionalValeria.id,
            id_cliente: clienteGael,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalValeria.id && c.id_cliente === clienteGael && c.id_servicio === servByProf[`${profesionalValeria.id}-Auditoría de arquitectura de software`])?.id
        },

        // Franklin - 2 citas completadas adicionales
        {
            puntuacion: 5,
            comentario: "Refactorización a microservicios perfecta, arquitectura limpia y tests automatizados. Trabajo de alto nivel.",
            id_profesional: profesionalFranklin.id,
            id_cliente: clienteFabian,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalFranklin.id && c.id_cliente === clienteFabian && c.id_servicio === servByProf[`${profesionalFranklin.id}-Refactorización y modernización de aplicaciones`])?.id
        },
        {
            puntuacion: 4,
            comentario: "Pentesting exhaustivo, reporte de vulnerabilidades claro y plan de remediación accionable.",
            id_profesional: profesionalFranklin.id,
            id_cliente: clienteGael,
            id_cita: citasCompletadas.find(c => c.id_profesional === profesionalFranklin.id && c.id_cliente === clienteGael && c.id_servicio === servByProf[`${profesionalFranklin.id}-Revisión de seguridad básica`])?.id
        }
    ];

    for (const v of valoracionesData) {
        if (v.id_cita) {
            await prisma.valoracion.create({
                data: {
                    puntuacion: v.puntuacion,
                    comentario: v.comentario,
                    id_profesional: v.id_profesional,
                    id_cliente: v.id_cliente,
                    id_cita: v.id_cita
                }
            });
        }
    }

    console.log("✅ Seed completado exitosamente");
    console.log(`   - ${especialidades.count} especialidades`);
    console.log(`   - ${categorias.count} categorías`);
    console.log(`   - ${usuarios.count} usuarios`);
    console.log(`   - 5 perfiles profesionales`);
    console.log(`   - 5 ubicaciones`);
    console.log(`   - ${allServicios.length} servicios`);
    console.log(`   - ${citasCreadas.length} citas`);
    console.log(`   - ${citasCompletadas.length} valoraciones`);
}

main()
    .catch((e) => {
        console.error("Error en seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });