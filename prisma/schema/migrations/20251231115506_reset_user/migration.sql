/*
  Warnings:

  - You are about to drop the column `feePerHour` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[city,country]` on the table `locations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gender` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TravelStyle" AS ENUM ('BUDGET', 'STANDARD', 'LUXURY');

-- CreateEnum
CREATE TYPE "TravelPace" AS ENUM ('RELAXED', 'MODERATE', 'FAST');

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "feePerHour",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "dailyRate" DOUBLE PRECISION,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "languages" TEXT[];

-- AlterTable
ALTER TABLE "users" DROP COLUMN "address",
DROP COLUMN "bio",
DROP COLUMN "gender",
DROP COLUMN "image",
DROP COLUMN "languages";

-- CreateTable
CREATE TABLE "tourist_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interests" TEXT[],
    "travelStyle" "TravelStyle" NOT NULL,
    "preferredLangs" TEXT[],
    "groupSize" INTEGER,
    "travelPace" "TravelPace",

    CONSTRAINT "tourist_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tourist_preferences_userId_key" ON "tourist_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "locations_city_country_key" ON "locations"("city", "country");

-- AddForeignKey
ALTER TABLE "tourist_preferences" ADD CONSTRAINT "tourist_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
