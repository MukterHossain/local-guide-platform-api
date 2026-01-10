/*
  Warnings:

  - Added the required column `tourId` to the `availabilities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tourId` to the `wishlists` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "availabilities" ADD COLUMN     "tourId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "wishlists" ADD COLUMN     "tourId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;
