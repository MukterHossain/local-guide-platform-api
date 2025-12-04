/*
  Warnings:

  - You are about to drop the column `totalPrice` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `nidOrPassportUrl` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerHour` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `tours` table. All the data in the column will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tourImages` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `totalFee` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tourFee` to the `tours` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tourImages" DROP CONSTRAINT "tourImages_tourId_fkey";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "totalPrice",
ADD COLUMN     "totalFee" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "nidOrPassportUrl",
DROP COLUMN "pricePerHour",
ADD COLUMN     "feePerHour" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "tours" DROP COLUMN "price",
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tourFee" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "public"."notifications";

-- DropTable
DROP TABLE "public"."tourImages";
