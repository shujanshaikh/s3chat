import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { currentUser } from "@clerk/nextjs/server";

const f = createUploadthing();

export const getUserAuth = async () => {
 try {
    const user = await currentUser();
    if (!user) {
      throw new UploadThingError("Unauthorized");
    }
    return user;
 } catch (error) {
    throw new UploadThingError("Unauthorized");
 }
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 4,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
       const user = await getUserAuth();

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload

      console.log("Upload complete for userId:", metadata.userId);
      console.log("file", file);
      console.log("file url", file.ufsUrl);
      
      // Return file data - the client will handle creating the attachment in Convex
      return { 
        fileUrl: file.ufsUrl, 
        fileName: file.name, 
        contentType: file.type,
        uploadedBy: metadata.userId 
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
