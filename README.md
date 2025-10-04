## ORIN.AI — Phase 1 MVP

ORIN.AI transforms LLM responses into structured dashboards. Phase 1 delivers the core MVP:

- Next.js App Router shell with dark UI
- Streaming-style chat prompt interface
- Azure OpenAI model router (classification + summarization)
- Appwrite integration for auth-aware logging
- Pie/Bar chart renderers using Recharts + Framer Motion

## Stack

- **Frontend**: Next.js 15, Tailwind v4, Framer Motion, Recharts
- **Backend orchestrator**: Azure OpenAI via lightweight router
- **Auth/Data**: Appwrite (sessions + query logs)

## Environment variables

Create `.env.local` and add:

```
# Azure OpenAI
AZURE_AI_ENDPOINT=
AZURE_AI_API_KEY=
AZURE_AI_API_VERSION=2025-01-01-preview
AZURE_AI_MODEL_NAME=model-router
AZURE_AI_DEPLOYMENT_NAME=model-router

# Appwrite
APPWRITE_ENDPOINT=
APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
APPWRITE_DATABASE_ID=orinai
APPWRITE_COLLECTION_QUERIES=queries
APPWRITE_DEV_USER_ID=demo-user      # optional local fallback
```

## Install & Run

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000` and ask a question. Without valid Azure credentials, the app will fall back to mocked chart data so the UI remains interactive.

## Appwrite bootstrap script

Provision the required database and collection:

```bash
pnpm setup:appwrite
```

The script is idempotent and will create:

- Database: `APPWRITE_DATABASE_ID`
- Collection: `APPWRITE_COLLECTION_QUERIES`
- Attributes: `userId`, `query`, `responseType`, `createdAt`
- Index: `by_user_created (userId ASC, createdAt DESC)`

## Architecture snapshot

```
src/
├─ app/
│  ├─ api/generate/route.ts  ← orchestrates Azure pipeline + Appwrite log
│  └─ page.tsx               ← hero + client shell
├─ components/
│  ├─ chat/                  ← chat UI primitives
│  ├─ charts/                ← Recharts renderers
│  ├─ dashboard/             ← renderer + sublinks panel
│  └─ home/HomeShell.tsx     ← client state holder
├─ lib/
│  ├─ appwrite/              ← client + auth + logging helpers
│  ├─ azure/model-router.ts  ← deployment routing + fetch wrapper
│  ├─ langchain/agents       ← classifier/retriever/summarizer
│  ├─ langchain/pipeline.ts  ← orchestrator
│  └─ schemas/dashboard.ts   ← shared Zod schemas
└─ types/                    ← shared TS shapes
```

## Development notes

- **Auth**: Appwrite session cookie `a_session` is used when available; fallback user ID supports local dev.
- **Azure**: Requests route to the configured `AZURE_AI_MODEL_NAME` (default `model-router`) across all intents. Override per intent with `AZURE_AI_CLASSIFIER_MODEL_NAME`, `AZURE_AI_SUMMARIZER_MODEL_NAME`, or `AZURE_AI_GENERATOR_MODEL_NAME` if needed. Ensure `AZURE_AI_API_VERSION` matches your Azure deployment.
- **Fallback mode**: If Azure calls fail, heuristic classification and sample chart data keep the experience running.
- **Next steps**: Wire Pinecone retrieval, expand chart catalog, validate outputs with runtime Zod re-prompts.
