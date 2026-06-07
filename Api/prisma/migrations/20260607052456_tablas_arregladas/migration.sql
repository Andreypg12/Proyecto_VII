/*
  Warnings:

  - You are about to drop the `ubicacionprofesional` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `canton` DROP FOREIGN KEY `Canton_id_ciudad_fkey`;

-- DropForeignKey
ALTER TABLE `distrito` DROP FOREIGN KEY `Distrito_id_canton_fkey`;

-- DropForeignKey
ALTER TABLE `perfil_profesional` DROP FOREIGN KEY `perfil_profesional_id_ubicacion_fkey`;

-- DropForeignKey
ALTER TABLE `ubicacionprofesional` DROP FOREIGN KEY `UbicacionProfesional_id_distrito_fkey`;

-- DropIndex
DROP INDEX `perfil_profesional_id_ubicacion_fkey` ON `perfil_profesional`;

-- DropTable
DROP TABLE `ubicacionprofesional`;

-- CreateTable
CREATE TABLE `ubicacion_profesional` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(500) NOT NULL,
    `id_distrito` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `perfil_profesional` ADD CONSTRAINT `perfil_profesional_id_ubicacion_fkey` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicacion_profesional`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ubicacion_profesional` ADD CONSTRAINT `ubicacion_profesional_id_distrito_fkey` FOREIGN KEY (`id_distrito`) REFERENCES `distrito`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `distrito` ADD CONSTRAINT `distrito_id_canton_fkey` FOREIGN KEY (`id_canton`) REFERENCES `canton`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `canton` ADD CONSTRAINT `canton_id_ciudad_fkey` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
