/*
  Warnings:

  - The values [INACTIVO] on the enum `usuario_estado` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `usuario` MODIFY `estado` ENUM('ACTIVO', 'BLOQUEADO') NOT NULL DEFAULT 'ACTIVO';
