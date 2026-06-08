import { Rol } from "../generated/prisma/enums";
import { prisma } from "../src/config/prisma";
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

    // 3. Recuperar datos para mapeo (Uso de Maps para optimizar)

    const [serv, esp, users] = await Promise.all([
        prisma.servicio.findMany(),
        prisma.especialidad.findMany(),
        prisma.usuario.findMany(),
    ]);

    const servMap = Object.fromEntries(serv.map((c) => [c.servicio, c.id]));
    const espMap = Object.fromEntries(esp.map((e) => [e.especialidad, e.id]));
    const usersNomMap = Object.fromEntries(users.map((p) => [p.nombre, p.id]));
    const userEmailMap = Object.fromEntries(users.map((u) => [u.email, u.id]));


    // 4. Creación de Videojuegos con Relaciones
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