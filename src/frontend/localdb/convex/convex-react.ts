"use client";
import { ConvexReactClient } from "convex/react";

export const CONVEX_CLIENT = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);