/*
  Warnings:

  - You are about to drop the column `distrito` on the `canton` table. All the data in the column will be lost.
  - You are about to drop the column `distrito` on the `ciudad` table. All the data in the column will be lost.
  - Added the required column `canton` to the `canton` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ciudad` to the `ciudad` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `canton` DROP COLUMN `distrito`,
    ADD COLUMN `canton` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ciudad` DROP COLUMN `distrito`,
    ADD COLUMN `ciudad` VARCHAR(100) NOT NULL;
