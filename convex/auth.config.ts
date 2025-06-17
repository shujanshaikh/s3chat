export default {
    providers: [
        {
            domain: process.env.CLERK_DOMAIN!,
            applicationID: "convex",
        },
    ]
}