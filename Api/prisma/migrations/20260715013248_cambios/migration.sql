/*
  Warnings:

  - Added the required column `id_servicio` to the `cita` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cita` ADD COLUMN `id_servicio` INTEGER NOT NULL,
    MODIFY `fecha_hora_finalizacion_real` DATETIME(3) NULL,
    MODIFY `estado` ENUM('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'COMPLETADA') NOT NULL DEFAULT 'PENDIENTE';

-- AddForeignKey
ALTER TABLE `cita` ADD CONSTRAINT `cita_id_servicio_fkey` FOREIGN KEY (`id_servicio`) REFERENCES `servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
