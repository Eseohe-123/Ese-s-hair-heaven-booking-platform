// Money math — all amounts in kobo integers, never float.

export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function toNaira(kobo: number): number {
  return kobo / 100;
}

export function formatKobo(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

export type Policy = {
  depositPct: number;
  cancelRetainPct: number;
  rescheduleFeeKobo: number;
  noshowFeeKobo: number;
  noticeHours: number;
};

export function quoteAgreement(
  policy: Policy,
  input: { baseKobo: number; customKobo: number; extensionsKobo: number; discountKobo: number },
) {
  const finalPriceKobo =
    input.baseKobo + input.customKobo + input.extensionsKobo - input.discountKobo;
  if (finalPriceKobo < 0) throw new Error("Discount cannot exceed the total.");
  const depositKobo = Math.round((finalPriceKobo * policy.depositPct) / 100);
  return { finalPriceKobo, depositKobo, balanceKobo: finalPriceKobo - depositKobo };
}

// Customer cancels: retain cancelRetainPct % of the DEPOSIT, refund the rest.
export function customerCancelSplit(policy: Policy, depositPaidKobo: number) {
  const retainedKobo = Math.round((depositPaidKobo * policy.cancelRetainPct) / 100);
  return { retainedKobo, refundableKobo: depositPaidKobo - retainedKobo };
}
