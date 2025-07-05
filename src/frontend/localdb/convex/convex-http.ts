import { ConvexHttpClient } from "convex/browser";

export const CONVEX_HTTP_CLIENT  = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);