-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_postId_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_profileId_fkey";

-- AlterTable
ALTER TABLE "images" ALTER COLUMN "postId" DROP NOT NULL,
ALTER COLUMN "profileId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
