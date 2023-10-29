/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Competition" (
    "idCompetition" SERIAL NOT NULL,
    "competitionName" TEXT NOT NULL,
    "idSystemScoring" INTEGER NOT NULL,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("idCompetition")
);

-- CreateTable
CREATE TABLE "SystemScoring" (
    "idSystemScoring" SERIAL NOT NULL,
    "win_points" INTEGER NOT NULL,
    "draw_points" INTEGER NOT NULL,
    "lose_points" INTEGER NOT NULL,

    CONSTRAINT "SystemScoring_pkey" PRIMARY KEY ("idSystemScoring")
);

-- CreateTable
CREATE TABLE "Competitor" (
    "idCompetitor" SERIAL NOT NULL,
    "competitorName" TEXT NOT NULL,
    "idCompetition" INTEGER NOT NULL,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("idCompetitor")
);

-- CreateTable
CREATE TABLE "Match" (
    "idMatch" SERIAL NOT NULL,
    "idCompetition" INTEGER NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "competitor1Id" INTEGER NOT NULL,
    "competitor2Id" INTEGER NOT NULL,
    "competitor1Score" INTEGER,
    "competitor2Score" INTEGER,
    "matchDate" TIMESTAMP(3),
    "isPlayed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("idMatch")
);

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_idSystemScoring_fkey" FOREIGN KEY ("idSystemScoring") REFERENCES "SystemScoring"("idSystemScoring") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_idCompetition_fkey" FOREIGN KEY ("idCompetition") REFERENCES "Competition"("idCompetition") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_competitor1Id_fkey" FOREIGN KEY ("competitor1Id") REFERENCES "Competitor"("idCompetitor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_competitor2Id_fkey" FOREIGN KEY ("competitor2Id") REFERENCES "Competitor"("idCompetitor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_idCompetition_fkey" FOREIGN KEY ("idCompetition") REFERENCES "Competition"("idCompetition") ON DELETE RESTRICT ON UPDATE CASCADE;
