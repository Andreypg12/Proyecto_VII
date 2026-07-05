
import { prisma } from "../src/config/prisma";
import { EstadoCita, EstadoUsuario, Modalidad, Rol } from "../generated/prisma/enums";
import { create } from "node:domain";

async function main() {
    console.log("Iniciando seed...");
    // 1. Limpieza de datos

    const models = [
        prisma.especialidad,
        prisma.servicio,
        prisma.categoriaServicio,
        prisma.valoracion,
        prisma.cita,
        prisma.ubicacionProfesional,
        prisma.perfilProfesional,
        prisma.usuario,
    ]

    for (const model of models) {
        await (model as any).deleteMany();
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
            { email: "alejandro@gmail.com", nombre: "Alejandro", apellidos: "Serrano", password: "hash_password", rol: Rol.PROFESIONAL },
            { email: "andrey@correo.com", nombre: "Andrey", apellidos: "Pérez", password: "hash_password", rol: Rol.CLIENTE },
            { email: "fabián@correo.com", nombre: "Fabián", apellidos: "Zamora", password: "hash_password", rol: Rol.CLIENTE },
            { email: "franklin@correo.com", nombre: "Franklin", apellidos: "Montoya", password: "hash_password", rol: Rol.PROFESIONAL, estado: EstadoUsuario.BLOQUEADO },
            { email: "gael@correo.com", nombre: "Gael", apellidos: "Osorio", password: "hash_password", rol: Rol.CLIENTE },
            { email: "valeria@correo.com", nombre: "Valeria", apellidos: "Méndez", password: "hash_password", rol: Rol.PROFESIONAL, estado: EstadoUsuario.BLOQUEADO },
            { email: "Adriel@correo.com", nombre: "Adriel", apellidos: "Gómez", password: "hash_password", rol: Rol.ADMINISTRADOR }
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
            imagen_profesional: "image-not-found.jpg",
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


    //Seeds ubicacionProfesional

    await prisma.ubicacionProfesional.create({
        data: {
            id: 1,
            descripcion: "125m Norte de la escuela de Getsemaní",
            id_distrito: 40504,
            distrito: "Los Ángeles",
            canton: "San Rafael",
            ciudad: "Heredia",
            id_profesional: profesional.id
        }
    });

    //Seeds servicios

    await prisma.servicio.createMany({
        data: [

            {
                servicio: "Software estandard",
                descripcion: "Servicio",
                precio: 10000,
                duracion_estimada: 60,
                estado: true,
                modalidad: Modalidad.VIRTUAL,
                id_categoria: catServMap["Mantenimiento y Soporte"],
                id_profesional: profesional.id
            },
            {
                servicio: "Desarrollo de sitio web informativo",
                descripcion: "Servicio",
                precio: 85000,
                duracion_estimada: 240,
                estado: true,
                modalidad: Modalidad.VIRTUAL,
                id_categoria: catServMap["Desarrollo a Medida"],
                id_profesional: profesional.id
            },
            {
                servicio: "Aplicación móvil básica",
                descripcion: "Servicio",
                precio: 120000,
                duracion_estimada: 360,
                estado: true,
                modalidad: Modalidad.HÍBRIDA,
                id_categoria: catServMap["Desarrollo a Medida"],
                id_profesional: profesional.id
            },
            {
                servicio: "Optimización de base de datos",
                descripcion: "Servicio",
                precio: 65000,
                duracion_estimada: 180,
                estado: true,
                modalidad: Modalidad.VIRTUAL,
                id_categoria: catServMap["Consultoría Técnica"],
                id_profesional: profesional.id
            },
            {
                servicio: "Revisión de seguridad básica",
                descripcion: "Servicio",
                precio: 75000,
                duracion_estimada: 180,
                estado: true,
                modalidad: Modalidad.VIRTUAL,
                id_categoria: catServMap["Consultoría Técnica"],
                id_profesional: profesional.id
            },
            {
                servicio: "Mantenimiento mensual de sistema",
                descripcion: "Servicio",
                precio: 95000,
                duracion_estimada: 300,
                estado: true,
                modalidad: Modalidad.VIRTUAL,
                id_categoria: catServMap["Mantenimiento y Soporte"],
                id_profesional: profesional.id
            },
            {
                servicio: "Capacitación en desarrollo web",
                descripcion: "Servicio",
                precio: 55000,
                duracion_estimada: 120,
                estado: true,
                modalidad: Modalidad.PRESENCIAL,
                id_categoria: catServMap["Capacitación y Formación"],
                id_profesional: profesional.id
            },
            {
                servicio: "Migración de sistema legado",
                descripcion: "Servicio",
                precio: 150000,
                duracion_estimada: 480,
                estado: true,
                modalidad: Modalidad.HÍBRIDA,
                id_categoria: catServMap["Migración y Modernización"],
                id_profesional: profesional.id
            },
            {
                servicio: "Auditoría de arquitectura de software",
                descripcion: "Servicio",
                precio: 110000,
                duracion_estimada: 240,
                estado: true,
                modalidad: Modalidad.VIRTUAL,
                id_categoria: catServMap["Consultoría Técnica"],
                id_profesional: profesional.id
            },
            {
                servicio: "Refactorización y modernización de aplicaciones",
                descripcion: "Servicio",
                precio: 140000,
                duracion_estimada: 420,
                estado: true,
                modalidad: Modalidad.HÍBRIDA,
                id_categoria: catServMap["Migración y Modernización"],
                id_profesional: profesional.id
            }
        ]
    });
    console.log("Seed completado con éxito.");
}
main()
    .catch((e) => {
        console.error("Error en seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });