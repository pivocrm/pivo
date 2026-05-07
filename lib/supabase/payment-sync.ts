import type { DealStatus } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncPaymentForDeal(
  supabase: any,
  dealId: string,
  dealValue: number,
  newStatus: DealStatus
) {
  if (newStatus === "aguardando_pagamento") {
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("deal_id", dealId);

    if (!existing || existing.length === 0) {
      await supabase.from("payments").insert({
        deal_id: dealId,
        amount: dealValue,
        status: "pendente",
      } as never);
    }
  } else if (newStatus === "concluido") {
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("deal_id", dealId);

    const today = new Date().toISOString().split("T")[0];

    if (existing && existing.length > 0) {
      await supabase
        .from("payments")
        .update({ status: "recebido", payment_date: today } as never)
        .eq("deal_id", dealId);
    } else {
      await supabase.from("payments").insert({
        deal_id: dealId,
        amount: dealValue,
        status: "recebido",
        payment_date: today,
      } as never);
    }
  }
}
