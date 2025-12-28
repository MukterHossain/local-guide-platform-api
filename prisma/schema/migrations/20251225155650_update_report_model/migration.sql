-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'RESOLVED');

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
