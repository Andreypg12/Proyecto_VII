/*
  Warnings:

  - You are about to alter the column `password` on the `usuario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(251)`.

*/
-- AlterTable
ALTER TABLE `usuario` MODIFY `password` VARCHAR(251) NOT NULL;
