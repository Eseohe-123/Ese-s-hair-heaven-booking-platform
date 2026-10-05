-- CreateTable
CREATE TABLE "price_agreement" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "basePriceKobo" INTEGER NOT NULL,
    "customKobo" INTEGER NOT NULL DEFAULT 0,
    "extensionsKobo" INTEGER NOT NULL DEFAULT 0,
    "discountKobo" INTEGER NOT NULL DEFAULT 0,
    "finalPriceKobo" INTEGER NOT NULL,
    "depositKobo" INTEGER NOT NULL,
    "balanceKobo" INTEGER NOT NULL,
    "policySnapshot" JSONB NOT NULL,
    "notes" TEXT,
    "createdBy" TEXT,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "price_agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "priceAgreementId" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_deposit',
    "locationSnapshot" TEXT,
    "originalAppointmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "provider" TEXT,
    "providerRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verifiedBy" TEXT,
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "retainedKobo" INTEGER NOT NULL,
    "refundableKobo" INTEGER NOT NULL,
    "approvedBy" TEXT,
    "method" TEXT,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "price_agreement_requestId_key" ON "price_agreement"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_code_key" ON "appointment"("code");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_requestId_key" ON "appointment"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_priceAgreementId_key" ON "appointment"("priceAgreementId");

-- CreateIndex
CREATE INDEX "appointment_status_idx" ON "appointment"("status");

-- CreateIndex
CREATE INDEX "appointment_datetime_idx" ON "appointment"("datetime");

-- CreateIndex
CREATE UNIQUE INDEX "payment_providerRef_key" ON "payment"("providerRef");

-- CreateIndex
CREATE INDEX "payment_appointmentId_idx" ON "payment"("appointmentId");

-- AddForeignKey
ALTER TABLE "price_agreement" ADD CONSTRAINT "price_agreement_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "style_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "style_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_priceAgreementId_fkey" FOREIGN KEY ("priceAgreementId") REFERENCES "price_agreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
