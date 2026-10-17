ALTER TABLE "Project" ADD COLUMN "imagePublicId" TEXT;

ALTER TABLE "Skill"
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "imagePublicId" TEXT;

ALTER TABLE "Experience"
ADD COLUMN "companyLogoUrl" TEXT,
ADD COLUMN "companyLogoPublicId" TEXT;

ALTER TABLE "Education"
ADD COLUMN "institutionLogoUrl" TEXT,
ADD COLUMN "institutionLogoPublicId" TEXT;

ALTER TABLE "Achievement"
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "imagePublicId" TEXT;

ALTER TABLE "Research"
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "imagePublicId" TEXT;

CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "description" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PortfolioProfile" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL DEFAULT '',
    "headline" TEXT,
    "shortBio" TEXT,
    "about" TEXT,
    "profileImageUrl" TEXT,
    "profileImagePublicId" TEXT,
    "heroImageUrl" TEXT,
    "heroImagePublicId" TEXT,
    "resumeUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PortfolioProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "folder" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleteRequestedAt" TIMESTAMP(3),
    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MediaAsset_publicId_key" ON "MediaAsset"("publicId");
CREATE INDEX "MediaAsset_deleteRequestedAt_idx" ON "MediaAsset"("deleteRequestedAt");
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");
