-- AlterTable
ALTER TABLE `historial_cita` ADD COLUMN `id_usuario` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `historial_cita` ADD CONSTRAINT `historial_cita_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
