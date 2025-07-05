import { getMessageCountByUserId } from "../../convex/messages";



interface Entitlements {
  maxPerMonth: number;
  availableChatModelIds: Array<string>;
}

export const entitlementsByUserType: Record<string, Entitlements> = {
  free: {
    maxPerMonth: 20,
    availableChatModelIds: ["chat-model", "chat-model-reasoning"],
  },

  pro: {
    maxPerMonth: 100,
    availableChatModelIds: ["chat-model", "chat-model-reasoning"],
  },
};


