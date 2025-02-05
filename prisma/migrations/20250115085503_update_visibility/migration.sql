/*
  Warnings:

  - The values [PRIVATE] on the enum `Posts_visibility` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Posts` MODIFY `visibility` ENUM('PUBLIC', 'ONLY_ME') NOT NULL DEFAULT 'PUBLIC';
