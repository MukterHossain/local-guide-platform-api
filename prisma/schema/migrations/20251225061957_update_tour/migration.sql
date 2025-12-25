-- CreateEnum
CREATE TYPE "TourStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'BLOCKED');

-- AlterTable
ALTER TABLE "tours" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "TourStatus" NOT NULL DEFAULT 'PUBLISHED';
