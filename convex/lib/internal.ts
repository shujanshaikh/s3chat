import { mutation, MutationCtx } from '../_generated/server';
import { v } from 'convex/values';

// Internal API arguments that all internal functions should accept
type InternalApiArgs = {
  userId?: string;
  sessionId: string;
};

// Message status validator based on your schema's generationStatus
const MessageStatusValidator = v.union(
  v.literal("pending"),
  v.literal("generating"),
  v.literal("completed"),
  v.literal("failed")
);

// Provider metadata validator - customize based on your needs
const ProviderMetadataValidator = v.any();

// Helper function to determine the effective userId
function getUserId(args: { userId?: string; sessionId: string }): string {
  if (args.userId) return args.userId;
  return 'anon:' + args.sessionId;
}

// The `internalApiMutation` wrapper function
export function internalApiMutation<
  Args extends Record<string, any>,
  ReturnValue,
>(
  config: {
    args: Args;
    handler: (
      ctx: MutationCtx,
      args: any, // Simplify type to avoid complex inference issues
    ) => Promise<ReturnValue>;
  },
) {
  // Merge the specific mutation arguments with the common internal API arguments
  const mergedArgs = {
    ...config.args,
    userId: v.optional(v.string()), // Add optional userId
    sessionId: v.string(), // Add required sessionId
  };

  // Return a standard Convex mutation with custom logic wrapped inside
  return mutation({
    args: mergedArgs,
    handler: async (ctx, args) => {
      // Common pre-processing/validation logic:

      // 1. Get the effective userId
      const effectiveUserId = getUserId(args);

      // 2. Authentication/authorization validation
      // For authenticated users, verify the userId matches the authenticated identity
      if (!effectiveUserId.startsWith("anon:")) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity || identity.subject !== effectiveUserId) {
          throw new Error("Unauthorized access: userId mismatch");
        }
      }

      // 3. Optional: Check if user exists in your users table
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", effectiveUserId))
        .first();
      
      if (!user && !effectiveUserId.startsWith("anon:")) {
        throw new Error("User not found");
      }

      // 4. Call the original handler with the processed arguments
      return config.handler(ctx, { ...args, userId: effectiveUserId });
    },
  });
}

// Export validators for use in other files
export { MessageStatusValidator, ProviderMetadataValidator };
