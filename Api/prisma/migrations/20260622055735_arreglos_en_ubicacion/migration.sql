/*
  Warnings:

  - You are about to drop the column `id_ubicacion` on the `perfil_profesional` table. All the data in the column will be lost.
  - You are about to drop the `canton` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ciudad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `distrito` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `telefono` to the `perfil_profesional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `canton` to the `ubicacion_profesional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ciudad` to the `ubicacion_profesional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `distrito` to the `ubicacion_profesional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_profesional` to the `ubicacion_profesional` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `canton` DROP FOREIGN KEY `canton_id_ciudad_fkey`;

-- DropForeignKey
ALTER TABLE `distrito` DROP FOREIGN KEY `distrito_id_canton_fkey`;

-- DropForeignKey
ALTER TABLE `perfil_profesional` DROP FOREIGN KEY `perfil_profesional_id_ubicacion_fkey`;

-- DropForeignKey
ALTER TABLE `ubicacion_profesional` DROP FOREIGN KEY `ubicacion_profesional_id_distrito_fkey`;

-- DropIndex
DROP INDEX `perfil_profesional_id_ubicacion_fkey` ON `perfil_profesional`;

-- DropIndex
DROP INDEX `ubicacion_profesional_id_distrito_fkey` ON `ubicacion_profesional`;

-- AlterTable
ALTER TABLE `perfil_profesional` DROP COLUMN `id_ubicacion`,
    ADD COLUMN `telefono` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ubicacion_profesional` ADD COLUMN `canton` VARCHAR(200) NOT NULL,
    ADD COLUMN `ciudad` VARCHAR(200) NOT NULL,
    ADD COLUMN `distrito` VARCHAR(200) NOT NULL,
    ADD COLUMN `id_profesional` INTEGER NOT NULL;

-- DropTable
DROP TABLE `canton`;

-- DropTable
DROP TABLE `ciudad`;

-- DropTable
DROP TABLE `distrito`;

-- AddForeignKey
ALTER TABLE `ubicacion_profesional` ADD CONSTRAINT `ubicacion_profesional_id_profesional_fkey` FOREIGN KEY (`id_profesional`) REFERENCES `perfil_profesional`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
