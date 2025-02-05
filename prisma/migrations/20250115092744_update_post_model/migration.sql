/*
  Warnings:

  - You are about to drop the column `title` on the `Posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Posts` DROP COLUMN `title`,
    ADD COLUMN `image` VARCHAR(191) NULL;
