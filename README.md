# S3.chat

Welcome to the **s3.chat**! This project is built with Next.js, Convex for the backend database and functions, and integrates with various AI APIs.

## Getting Started

Follow these steps to get your development environment up and running.

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Bun:** A fast all-in-one JavaScript runtime. [Install Bun](https://bun.sh/docs/installation)
*   **Node.js (LTS recommended):** While Bun is used for running, Node.js might be a dependency for some tools or libraries. [Install Node.js](https://nodejs.org/en/download/)
*   **Convex CLI:** You'll need to install the Convex CLI globally.
    ```bash
    bunx convex install
    ```
*   **Convex Account:** Sign up for a free Convex account at [Convex.dev](https://www.convex.dev/).
*   **Clerk Account:** Sign up for a free Clerk account at [Clerk.com](https://clerk.com/).
*   **AI API Keys:** Obtain API keys for the AI models you plan to use (e.g., Google Generative AI, OpenAI, Anthropic, etc.).

### Installation

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/shujanshaikh/s3chat.git
    cd s3chat
    ```

2.  **Install Dependencies:**
    Use Bun to install the project's dependencies:

    ```bash
    bun install
    ```

## Environment Variables

This project uses environment variables to manage sensitive keys and configurations. You'll need to create two separate `.env` files: `.env.local` for local development API keys and ` .env` for Clerk-related keys.

 ```bash
### Backend (Convex & AI APIs)

Create a file named `.env.local` in the root of your project and populate it with your API keys and Convex deployment URL.
# .env.local
GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_key"
OPENAI_API_KEY="your_openai_key"
ANTHROPIC_API_KEY="your_anthropic_key"
TOGETHER_API_KEY="your_together_key"
DEEPSEEK_API_KEY="your_deepseek_key"
GROQ_API_KEY="your_groq_key"

# Deployment used by `npx convex dev`
CONVEX_DEPLOYMENT="convex dev key"

NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=

#.env
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
