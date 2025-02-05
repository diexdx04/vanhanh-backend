/*
  Warnings:

  - You are about to drop the column `idPrivate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `idPrivate`,
    ADD COLUMN `isPrivate` BOOLEAN NOT NULL DEFAULT false;
