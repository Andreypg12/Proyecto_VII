
import { prisma } from "../src/config/prisma";
import { EstadoCita, Modalidad, Rol } from "../generated/prisma/enums";
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
        prisma.perfilProfesional,
        prisma.usuario,
        prisma.ubicacionProfesional,
        prisma.distrito,
        prisma.canton,
        prisma.ciudad
    ]

    for (const model of models) {
        await (model as any).deleteMany();
    }

    // 2. Creación de datos maestros (Independientes)

    await prisma.especialidad.createMany({
        data: [
            { especialidad: "Desarrollo Web", descripcion: "Creación y mantenimiento de sitios web, aplicaciones web progresivas y plataformas online responsivas." },
            { especialidad: "Desarrollo Móvil", descripcion: "Desarrollo de aplicaciones nativas e híbridas para iOS y Android usando tecnologías como Flutter, React Native o Swift." },
            { especialidad: "Bases de Datos", descripcion: "Diseño, optimización y administración de bases de datos SQL y NoSQL, incluyendo consultas complejas y modelado de datos." },
            { especialidad: "DevOps y Cloud", descripcion: "Implementación de pipelines CI/CD, automatización de despliegues y gestión de infraestructura en la nube (AWS, Azure, GCP)." },
            { especialidad: "Ciberseguridad", descripcion: "Auditoría de sistemas, pruebas de penetración, implementación de medidas de seguridad y protección de datos." }
        ],
    });

    await prisma.categoriaServicio.createMany({
        data: [
            { categoria: "Consultoría Técnica", descripcion: "Asesoramiento especializado en arquitectura de software, selección de tecnologías y mejores prácticas para proyectos." },
            { categoria: "Desarrollo a Medida", descripcion: "Creación de soluciones personalizadas según necesidades específicas del cliente, desde prototipos hasta producción." },
            { categoria: "Mantenimiento y Soporte", descripcion: "Actualización de sistemas existentes, corrección de errores, optimización de rendimiento y soporte continuo." },
            { categoria: "Capacitación y Formación", descripcion: "Entrenamiento en tecnologías específicas, buenas prácticas de programación y metodologías ágiles para equipos." },
            { categoria: "Migración y Modernización", descripcion: "Actualización de sistemas legados a tecnologías modernas, migración a la nube y refactorización de código." }
        ],
    });

    await prisma.usuario.createMany({
        data: [
            { email: "admin@gmail.com", nombre: "Admin", apellidos: ".", password: "hash_password", rol: Rol.ADMINISTRADOR },
            { email: "alejandro@gmail.com", nombre: "Alejandro", apellidos: "Serrano", password: "hash_password", rol: Rol.PROFESIONAL },
            { email: "andrey@correo.com", nombre: "Andrey", apellidos: "Pérez", password: "hash_password", rol: Rol.CLIENTE },
        ],
    });


    await prisma.ciudad.create({
        data: {
            id: 4,
            ciudad: "Heredia"
        }
    });

    await prisma.canton.create({
        data: {
            id: 405,
            canton: "San Rafael",
            id_ciudad: 4
        }
    });

    await prisma.distrito.create({
        data: {
            id: 40504,
            distrito: "Los Angeles",
            id_canton: 405
        }
    });

    await prisma.ubicacionProfesional.create({
        data: {
            id: 1,
            descripcion: "125m Norte de la escuela de Getsemaní",
            id_distrito: 40504
        }
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


    // 4. Creación de Videojuegos con Relaciones

    const profesional = await prisma.perfilProfesional.create({
        data: {
            titulo: "Ingeniero en software",
            descripcion: "Ingeniero en software dispuesto a seguir los requerimientos necesarios para hacer la aplicación que desees",
            tarifa_por_hora: 10000,
            annos_experiencia: 5,
            imagen_profesional: "image-not-found.jpg",
            disponibilidad: true,
            modalidad: Modalidad.VIRTUAL,
            id_usuario: userEmailMap["alejandro@gmail.com"],
            id_ubicacion: 1,
            especialidades: {
                connect: [
                    { id: espMap["Desarrollo Web"]}, {id: espMap["Desarrollo Móvil"] }
                ]
            }
        }
    });

    await prisma.servicio.create({
        data: {
            servicio: "Software estandard",
            precio: 10000,
            duracion_estimada: 60,
            estado: true,
            modalidad: Modalidad.VIRTUAL,
            id_categoria: catServMap["Mantenimiento y Soporte"],
            id_profesional: profesional.id
        }
    });
    // 5. Relaciones Muchos a Muchos (Plataformas)
    // 6. Creación de Órdenes
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