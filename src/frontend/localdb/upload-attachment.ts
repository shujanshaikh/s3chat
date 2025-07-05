import { api } from "../../../convex/_generated/api";

// Export the mutation reference to be used with useMutation hook
export const createAttachmentMutation = api.attachments.createAttachment;

// Example usage in a React component:
// const createAttachment = useMutation(createAttachmentMutation);
// await createAttachment({ messageId, fileUrl, fileName, contentType });

// This function was removed because Convex mutations must be called 
// using the useMutation hook in React components, not directly.
  