-- CreateTable
CREATE TABLE `categoria_servicio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoria` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(200) NULL,
    `estado` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `categoria_servicio_categoria_key`(`categoria`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `especialidad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `especialidad` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(200) NULL,
    `estado` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `especialidad_especialidad_key`(`especialidad`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ubicacion_profesional` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `provincia` VARCHAR(45) NULL,
    `canton` VARCHAR(45) NULL,
    `distrito` VARCHAR(45) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rol` ENUM('ADMIN', 'USUARIO', 'PROFESIONAL') NOT NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO', 'BLOQUEADO') NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(100) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `contrasena` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(20) NOT NULL,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuario_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfil_profesional` (
    `id_profesional` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `disponibilidad` ENUM('DISPONIBLE', 'NO_DISPONIBLE') NOT NULL,
    `id_ubicacion` INTEGER NULL,
    `modalidad_preferida` ENUM('PRESENCIAL', 'VIRTUAL', 'HIBRIDA') NOT NULL,
    `titulo` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(500) NOT NULL,
    `tarifa_base` INTEGER NOT NULL,
    `annos_experiencia` TINYINT NOT NULL DEFAULT 0,
    `imagen_profesional` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `perfil_profesional_id_usuario_key`(`id_usuario`),
    PRIMARY KEY (`id_profesional`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profesional_especialidad` (
    `id_profesional` INTEGER NOT NULL,
    `id_especialidad` INTEGER NOT NULL,

    PRIMARY KEY (`id_profesional`, `id_especialidad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_profesional` INTEGER NOT NULL,
    `id_categoria_servicio` INTEGER NOT NULL,
    `modalidad` ENUM('PRESENCIAL', 'VIRTUAL', 'HIBRIDA') NOT NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') NOT NULL,
    `nombre_servicio` VARCHAR(100) NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `duracion_estimada` SMALLINT NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicio_especialidad` (
    `id_servicio` INTEGER NOT NULL,
    `id_especialidad` INTEGER NOT NULL,

    PRIMARY KEY (`id_especialidad`, `id_servicio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cita` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cliente` INTEGER NOT NULL,
    `id_profesional` INTEGER NOT NULL,
    `modalidad` ENUM('PRESENCIAL', 'VIRTUAL', 'HIBRIDA') NOT NULL,
    `estado` ENUM('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'COMPLETADA') NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_hora_inicio` DATETIME(3) NOT NULL,
    `fecha_hora_finalizacion_esperada` DATETIME(3) NOT NULL,
    `fecha_hora_finalizacion_real` DATETIME(3) NULL,
    `comentario_cliente` VARCHAR(500) NULL,
    `comentario_profesional` VARCHAR(500) NULL,
    `monto_estimado` DECIMAL(10, 2) NOT NULL,

    INDEX `cita_id_cliente_idx`(`id_cliente`),
    INDEX `cita_id_profesional_idx`(`id_profesional`),
    INDEX `cita_estado_idx`(`estado`),
    INDEX `cita_fecha_hora_inicio_idx`(`fecha_hora_inicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reseña` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cita` INTEGER NOT NULL,
    `id_cliente` INTEGER NOT NULL,
    `id_profesional` INTEGER NOT NULL,
    `puntuacion` TINYINT NOT NULL,
    `comentario` VARCHAR(500) NULL,
    `fecha_reseña` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_profesional_perfil` INTEGER NULL,

    UNIQUE INDEX `reseña_id_cita_key`(`id_cita`),
    INDEX `reseña_id_profesional_idx`(`id_profesional`),
    INDEX `reseña_puntuacion_idx`(`puntuacion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `perfil_profesional` ADD CONSTRAINT `perfil_profesional_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perfil_profesional` ADD CONSTRAINT `perfil_profesional_id_ubicacion_fkey` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicacion_profesional`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profesional_especialidad` ADD CONSTRAINT `profesional_especialidad_id_profesional_fkey` FOREIGN KEY (`id_profesional`) REFERENCES `perfil_profesional`(`id_profesional`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profesional_especialidad` ADD CONSTRAINT `profesional_especialidad_id_especialidad_fkey` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicio` ADD CONSTRAINT `servicio_id_profesional_fkey` FOREIGN KEY (`id_profesional`) REFERENCES `perfil_profesional`(`id_profesional`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicio` ADD CONSTRAINT `servicio_id_categoria_servicio_fkey` FOREIGN KEY (`id_categoria_servicio`) REFERENCES `categoria_servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicio_especialidad` ADD CONSTRAINT `servicio_especialidad_id_servicio_fkey` FOREIGN KEY (`id_servicio`) REFERENCES `servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicio_especialidad` ADD CONSTRAINT `servicio_especialidad_id_especialidad_fkey` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cita` ADD CONSTRAINT `cita_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cita` ADD CONSTRAINT `cita_id_profesional_fkey` FOREIGN KEY (`id_profesional`) REFERENCES `perfil_profesional`(`id_profesional`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reseña` ADD CONSTRAINT `reseña_id_cita_fkey` FOREIGN KEY (`id_cita`) REFERENCES `cita`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reseña` ADD CONSTRAINT `reseña_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reseña` ADD CONSTRAINT `reseña_id_profesional_fkey` FOREIGN KEY (`id_profesional`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reseña` ADD CONSTRAINT `reseña_id_profesional_perfil_fkey` FOREIGN KEY (`id_profesional_perfil`) REFERENCES `perfil_profesional`(`id_profesional`) ON DELETE SET NULL ON UPDATE CASCADE;
