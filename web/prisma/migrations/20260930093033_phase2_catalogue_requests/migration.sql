-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hairstyle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "startingPriceKobo" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "badge" TEXT,
    "gradient" TEXT,
    "photos" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "hairstyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceKobo" INTEGER NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "addon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "style_request" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "guestSessionId" TEXT,
    "userId" TEXT,
    "hairstyleId" TEXT,
    "customName" TEXT,
    "description" TEXT NOT NULL,
    "comboNotes" TEXT,
    "hairDetails" TEXT,
    "specialRequests" TEXT,
    "preferredDate" TIMESTAMP(3),
    "photos" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "style_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'whatsapp_online',
    "threadRef" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "hairstyle_slug_key" ON "hairstyle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "addon_name_key" ON "addon"("name");

-- CreateIndex
CREATE UNIQUE INDEX "style_request_code_key" ON "style_request"("code");

-- CreateIndex
CREATE INDEX "style_request_status_idx" ON "style_request"("status");

-- CreateIndex
CREATE UNIQUE INDEX "consultation_requestId_key" ON "consultation"("requestId");

-- AddForeignKey
ALTER TABLE "hairstyle" ADD CONSTRAINT "hairstyle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "style_request" ADD CONSTRAINT "style_request_hairstyleId_fkey" FOREIGN KEY ("hairstyleId") REFERENCES "hairstyle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation" ADD CONSTRAINT "consultation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "style_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
