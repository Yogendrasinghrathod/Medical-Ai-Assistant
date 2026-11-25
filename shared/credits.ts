export const STARTING_CREDITS = 10;
export const CREDITS_PER_CALL = 1;

export const CREDIT_PACKS = {
  starter: {
    id: "starter" as const,
    name: "Starter pack",
    priceUsd: 1,
    credits: 5,
    blurb: "$1 · 5 credits · 5 voice calls",
  },
  value: {
    id: "value" as const,
    name: "Value pack",
    priceUsd: 10,
    credits: 25,
    blurb: "$10 · 25 credits · 25 voice calls",
  },
};

export type CreditPackId = keyof typeof CREDIT_PACKS;
