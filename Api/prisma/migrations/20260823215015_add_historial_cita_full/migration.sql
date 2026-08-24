-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `telefono` VARCHAR(20) NULL;

-- CreateTable
CREATE TABLE `historial_cita` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `estado_anterior` ENUM('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'COMPLETADA') NOT NULL,
    `estado_nuevo` ENUM('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'COMPLETADA') NOT NULL,
    `comentario` VARCHAR(500) NULL,
    `realizado_por` VARCHAR(50) NOT NULL DEFAULT 'PROFESIONAL',
    `fecha_cambio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_cita` INTEGER NOT NULL,
    `id_cliente` INTEGER NOT NULL,
    `id_profesional` INTEGER NOT NULL,
    `id_servicio` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `historial_cita` ADD CONSTRAINT `historial_cita_id_cita_fkey` FOREIGN KEY (`id_cita`) REFERENCES `cita`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_cita` ADD CONSTRAINT `historial_cita_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_cita` ADD CONSTRAINT `historial_cita_id_profesional_fkey` FOREIGN KEY (`id_profesional`) REFERENCES `perfil_profesional`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_cita` ADD CONSTRAINT `historial_cita_id_servicio_fkey` FOREIGN KEY (`id_servicio`) REFERENCES `servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
