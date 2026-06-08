/*
  Warnings:

  - Added the required column `id_profesional` to the `servicio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `servicio` ADD COLUMN `id_profesional` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `servicio` ADD CONSTRAINT `servicio_id_profesional_fkey` FOREIGN KEY (`id_profesional`) REFERENCES `perfil_profesional`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
