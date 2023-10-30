/*
  Warnings:

  - You are about to drop the column `coverImageId` on the `videos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[imageId]` on the table `videos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imageId` to the `videos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_profileId_fkey";

-- DropForeignKey
ALTER TABLE "videos" DROP CONSTRAINT "videos_coverImageId_fkey";

-- DropIndex
DROP INDEX "videos_coverImageId_key";

-- AlterTable
ALTER TABLE "videos" DROP COLUMN "coverImageId",
ADD COLUMN     "imageId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "files" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "type" "FileType" NOT NULL,
    "index" INTEGER NOT NULL,
    "postId" INTEGER,
    "profileId" INTEGER,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "files_profileId_key" ON "files"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "videos_imageId_key" ON "videos"("imageId");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
