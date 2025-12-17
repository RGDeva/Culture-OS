-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IDEA',
    "ownerId" TEXT NOT NULL,
    "vaultAssetIds" TEXT NOT NULL DEFAULT '[]',
    "isrc" TEXT,
    "iswc" TEXT,
    "releaseDate" DATETIME,
    "label" TEXT,
    "distributor" TEXT,
    "spotifyUrl" TEXT,
    "appleMusicUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Work_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SplitSheet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SplitSheet_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SplitParty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "splitSheetId" TEXT NOT NULL,
    "userId" TEXT,
    "externalName" TEXT,
    "role" TEXT NOT NULL,
    "walletAddress" TEXT,
    "pro" TEXT,
    "ipiCae" TEXT,
    "publishingEntity" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SplitParty_splitSheetId_fkey" FOREIGN KEY ("splitSheetId") REFERENCES "SplitSheet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SplitParty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SplitShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "splitSheetId" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "masterSharePct" REAL NOT NULL DEFAULT 0,
    "publishingSharePct" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "SplitShare_splitSheetId_fkey" FOREIGN KEY ("splitSheetId") REFERENCES "SplitSheet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SplitShare_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "SplitParty" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Earning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "occurredAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Earning_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Balance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "availableCents" INTEGER NOT NULL DEFAULT 0,
    "pendingCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdvanceAgreement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "funderId" TEXT,
    "borrowerId" TEXT NOT NULL,
    "advanceAmountCents" INTEGER NOT NULL,
    "recoupPercentage" REAL NOT NULL,
    "capAmountCents" INTEGER,
    "recoupedCents" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdvanceAgreement_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdvanceWork" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "advanceAgreementId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    CONSTRAINT "AdvanceWork_advanceAgreementId_fkey" FOREIGN KEY ("advanceAgreementId") REFERENCES "AdvanceAgreement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AdvanceWork_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PayoutPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "payoutMethod" TEXT NOT NULL,
    "bankCustomerId" TEXT,
    "bankAccountId" TEXT,
    "walletAddress" TEXT,
    "payoutCadence" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PayoutPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "duration" REAL,
    "bpm" INTEGER,
    "key" TEXT,
    "genre" TEXT,
    "moodTags" TEXT,
    "assetType" TEXT,
    "productCategory" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IDEA',
    "isForSale" BOOLEAN NOT NULL DEFAULT false,
    "price" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AssetAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "instruments" TEXT,
    "instrumentsRaw" TEXT,
    "instrumentPlotJson" TEXT,
    "audioSummary" TEXT,
    "aiInsight" TEXT,
    "viralityPlotJson" TEXT,
    "cyaniteMood" TEXT,
    "cyaniteGenres" TEXT,
    "cyaniteBpm" INTEGER,
    "cyaniteKey" TEXT,
    "cyaniteTags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastRetryAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssetAnalysis_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BountyCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "budgetCents" INTEGER NOT NULL,
    "rulesJson" TEXT NOT NULL DEFAULT '{}',
    "startAt" DATETIME,
    "endAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BountyAssetLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "assetId" TEXT,
    "listingId" TEXT,
    "showMetadataJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BountyAssetLink_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "BountyCampaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BountyParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "referralUrl" TEXT,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "BountyParticipant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "BountyCampaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BountySubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "postUrl" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" DATETIME,
    "metricsJson" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    CONSTRAINT "BountySubmission_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "BountyParticipant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BountyEarning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonDataJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    CONSTRAINT "BountyEarning_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "BountyParticipant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "walletAddress" TEXT,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "socials" TEXT DEFAULT '{}',
    "artistAccountId" TEXT,
    "classification" TEXT,
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("artistAccountId", "bio", "createdAt", "displayName", "email", "id", "onboarded", "socials", "updatedAt", "walletAddress") SELECT "artistAccountId", "bio", "createdAt", "displayName", "email", "id", "onboarded", "socials", "updatedAt", "walletAddress" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");
CREATE UNIQUE INDEX "User_artistAccountId_key" ON "User"("artistAccountId");
CREATE INDEX "user_email_idx" ON "User"("email");
CREATE INDEX "user_wallet_address_idx" ON "User"("walletAddress");
CREATE INDEX "user_artist_account_id_idx" ON "User"("artistAccountId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Work_isrc_key" ON "Work"("isrc");

-- CreateIndex
CREATE INDEX "Work_ownerId_idx" ON "Work"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "SplitSheet_workId_key" ON "SplitSheet"("workId");

-- CreateIndex
CREATE INDEX "SplitParty_splitSheetId_idx" ON "SplitParty"("splitSheetId");

-- CreateIndex
CREATE INDEX "SplitParty_userId_idx" ON "SplitParty"("userId");

-- CreateIndex
CREATE INDEX "SplitShare_splitSheetId_idx" ON "SplitShare"("splitSheetId");

-- CreateIndex
CREATE INDEX "SplitShare_partyId_idx" ON "SplitShare"("partyId");

-- CreateIndex
CREATE INDEX "Earning_workId_idx" ON "Earning"("workId");

-- CreateIndex
CREATE INDEX "Earning_occurredAt_idx" ON "Earning"("occurredAt");

-- CreateIndex
CREATE INDEX "Balance_userId_idx" ON "Balance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Balance_userId_currency_key" ON "Balance"("userId", "currency");

-- CreateIndex
CREATE INDEX "AdvanceAgreement_borrowerId_idx" ON "AdvanceAgreement"("borrowerId");

-- CreateIndex
CREATE INDEX "AdvanceWork_advanceAgreementId_idx" ON "AdvanceWork"("advanceAgreementId");

-- CreateIndex
CREATE INDEX "AdvanceWork_workId_idx" ON "AdvanceWork"("workId");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutPreference_userId_key" ON "PayoutPreference"("userId");

-- CreateIndex
CREATE INDEX "Asset_ownerId_idx" ON "Asset"("ownerId");

-- CreateIndex
CREATE INDEX "Asset_assetType_idx" ON "Asset"("assetType");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AssetAnalysis_assetId_key" ON "AssetAnalysis"("assetId");

-- CreateIndex
CREATE INDEX "AssetAnalysis_assetId_idx" ON "AssetAnalysis"("assetId");

-- CreateIndex
CREATE INDEX "AssetAnalysis_status_idx" ON "AssetAnalysis"("status");

-- CreateIndex
CREATE INDEX "BountyCampaign_creatorId_idx" ON "BountyCampaign"("creatorId");

-- CreateIndex
CREATE INDEX "BountyCampaign_status_idx" ON "BountyCampaign"("status");

-- CreateIndex
CREATE INDEX "BountyCampaign_type_idx" ON "BountyCampaign"("type");

-- CreateIndex
CREATE INDEX "BountyAssetLink_campaignId_idx" ON "BountyAssetLink"("campaignId");

-- CreateIndex
CREATE INDEX "BountyAssetLink_assetId_idx" ON "BountyAssetLink"("assetId");

-- CreateIndex
CREATE INDEX "BountyAssetLink_listingId_idx" ON "BountyAssetLink"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "BountyParticipant_referralCode_key" ON "BountyParticipant"("referralCode");

-- CreateIndex
CREATE INDEX "BountyParticipant_campaignId_idx" ON "BountyParticipant"("campaignId");

-- CreateIndex
CREATE INDEX "BountyParticipant_userId_idx" ON "BountyParticipant"("userId");

-- CreateIndex
CREATE INDEX "BountyParticipant_referralCode_idx" ON "BountyParticipant"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "BountyParticipant_campaignId_userId_key" ON "BountyParticipant"("campaignId", "userId");

-- CreateIndex
CREATE INDEX "BountySubmission_participantId_idx" ON "BountySubmission"("participantId");

-- CreateIndex
CREATE INDEX "BountySubmission_status_idx" ON "BountySubmission"("status");

-- CreateIndex
CREATE INDEX "BountySubmission_submittedAt_idx" ON "BountySubmission"("submittedAt");

-- CreateIndex
CREATE INDEX "BountyEarning_participantId_idx" ON "BountyEarning"("participantId");

-- CreateIndex
CREATE INDEX "BountyEarning_status_idx" ON "BountyEarning"("status");

-- CreateIndex
CREATE INDEX "BountyEarning_createdAt_idx" ON "BountyEarning"("createdAt");
