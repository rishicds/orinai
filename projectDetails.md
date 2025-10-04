# ORIN.AI - Dynamic LLM-Powered UI Layer with RAG
## VS Code Copilot Context Document

---

## 🎯 PROJECT OVERVIEW

You are building **ORIN.AI** - a universal UI layer that transforms raw LLM text outputs into interactive, structured dashboards with RAG integration. This is NOT a chatbot - it's an intelligent visualization engine that turns natural language queries into interactive data experiences.

### Core Concept
- User asks: "What did I spend on last month?"
- System returns: Interactive pie chart + drill-down links + data tables
- NOT just text responses - always visual, interactive, structured

---

## 🏗️ ARCHITECTURE STACK

### Frontend Layer
- **Framework**: Next.js 15 (App Router)
- **Styling**: TailwindCSS + shadcn/ui components
- **Animations**: Framer Motion
- **Charts**: Recharts (primary) + Plotly (complex viz)
- **Key Routes**:
  - `/` - Main chat/query interface
  - `/dashboard/[slug]` - Dynamic visualization pages
  - `/api/generate` - LLM processing endpoint

### Backend Layer
- **Orchestration**: LangChain (TypeScript preferred for Next.js compatibility)
- **Auth & Database**: Appwrite (users, sessions, query logs)
- **Cloud Functions**: Appwrite Functions (Python/Node)
- **Model Router**: Azure AI Foundry (auto-switches between GPT-5 mini/full/OSS)

### Data Layer
- **Vector Store**: Pinecone (RAG, per-user namespaces)
- **External Research**: Perplexity Sonar API
- **File Storage**: Appwrite Storage (PDFs, CSVs, JSON)

### Deployment
- **Frontend**: Vercel
- **Backend**: Appwrite Cloud
- **Vector DB**: Pinecone Cloud

---

## 📐 SYSTEM FLOW

```
User Query (Next.js UI)
    ↓
Appwrite Auth + Cloud Function
    ↓
LangChain Multi-Agent Pipeline:
    ├─ Classifier Agent (decides output type)
    ├─ Retriever Agent (Pinecone + Perplexity)
    └─ Summarizer Agent (JSON schema)
    ↓
Azure AI Foundry Model Router
    ↓
Structured JSON Output
    ↓
Next.js UI Renderer (Charts/Tables/Links)
```

---

## 🤖 MULTI-AGENT SYSTEM

### Agent 1: Classifier Agent
**Purpose**: Determine visualization type from query intent
 
**Model**: **GPT-4o Mini** (Azure AI Foundry) (model router)
- **Why**: Fast, cheap, excellent for classification tasks
- **Fallback**: gpt oss (huggingface)
- **Context window**: 2K tokens (small prompt)
- **Latency target**: < 1 second

**Input**: User query string  
**Output**: Classification object
```typescript
{
  type: 'pie_chart' | 'bar_chart' | 'line_chart' | 'table' | 'text' | 'timeline' | 'comparison' | 'infographic',
  complexity: 'simple' | 'multi_chart' | 'dashboard',
  requiresRAG: boolean,
  requiresExternal: boolean,
  requiresImage: boolean // NEW: triggers image generation
}
```

**Prompt Template**:
```
You are a visualization classifier. Analyze the query and determine the best output type.

Query: {user_query}

Return JSON only:
{
  "type": "pie_chart" | "bar_chart" | "line_chart" | "table" | "text" | "timeline" | "infographic",
  "complexity": "simple" | "multi_chart" | "dashboard",
  "requiresRAG": true/false,
  "requiresExternal": true/false,
  "requiresImage": true/false
}

Rules:
- Use "infographic" for visual explanations, comparisons, workflows
- Set requiresImage=true if query mentions: "show me", "visualize", "diagram", "illustration"
- Set requiresRAG=true if query references personal data
- Set requiresExternal=true if query needs web research
```

---

### Agent 2: Retriever Agent
**Purpose**: Fetch relevant context from user data or web

**Model**: **text-embedding-3-small** (OpenAI via Azure) (model router)
- **Why**: Best price/performance for embeddings
- **Fallback**: text-embedding-ada-002
- **Dimensions**: 1536
- **Cost**: $0.02 per 1M tokens

**Sources**:
- Pinecone vector DB (user's uploaded documents/data)
- Perplexity Sonar (external knowledge)

**Output**: Context chunks with metadata
```typescript
{
  chunks: Array<{text: string, source: string, relevance: number}>,
  citations: Array<{title: string, url: string}>
}
```

**Implementation**:
```typescript
// lib/langchain/agents/retriever.ts
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

export async function retrieverAgent(
  query: string, 
  userId: string, 
  classification: any
) {
  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-small",
  azureOpenAIApiKey: process.env.AZURE_AI_API_KEY,
  });
  
  let results = { chunks: [], citations: [] };
  
  // Retrieve from Pinecone if personal data needed
  if (classification.requiresRAG) {
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: pinecone.Index("orin-ai"),
      namespace: userId,
    });
    
    const docs = await vectorStore.similaritySearch(query, 5);
    results.chunks = docs.map(d => ({
      text: d.pageContent,
      source: d.metadata.source,
      relevance: d.metadata.score
    }));
  }
  
  // Retrieve from Perplexity if external data needed
  if (classification.requiresExternal) {
    const perplexityResults = await fetchPerplexity(query);
    results.citations = perplexityResults.citations;
    results.chunks.push(...perplexityResults.chunks);
  }
  
  return results;
}
```

---

### Agent 3: Summarizer Agent
**Purpose**: Transform LLM output + context into structured UI schema

**Model**: **GPT-4o** (Azure AI Foundry) (model router)
- **Why**: Best reasoning for complex data structuring
- **Fallback**: GPT-4o Mini for simple queries (cost optimization)
- **Context window**: 128K tokens (large context support)
- **Structured output**: Use `response_format: { type: "json_object" }`
- **Latency target**: 3-8 seconds

**Output**: JSON schema for frontend
```typescript
{
  type: string,
  title: string,
  data: any[],
  config: {axes?: any, colors?: string[], legends?: any},
  sublinks: Array<{label: string, route: string, context: any}>,
  summary?: string,
  imagePrompt?: string // NEW: If requiresImage=true
}
```

**Prompt Template**:
```
You are a data visualization expert. Convert the query and context into a structured dashboard schema.

Query: {user_query}
Context: {retrieved_context}
Visualization Type: {classification.type}

Generate JSON matching this schema:
{
  "type": "{classification.type}",
  "title": "Clear, descriptive title",
  "data": [ /* array of data objects */ ],
  "config": { /* chart-specific config */ },
  "sublinks": [ /* related drill-down pages */ ],
  "summary": "Brief text explanation",
  "imagePrompt": "If requiresImage=true, write a detailed DALL-E prompt"
}

Rules:
- data array must have 3-15 items for charts
- Use descriptive labels and proper units
- Generate 2-4 relevant sublinks
- imagePrompt should be detailed: style, colors, composition, mood
```

---

### Agent 4: Image Generator Agent (NEW)
**Purpose**: Generate infographics, diagrams, and visual explanations

**Model**: **FLUX.1 Schnell** 
- **Why**: Fastest open-source image model (1-4 seconds)
- **Alternative**: Gemini Nano Banana (if budget allows, higher quality)
- **Resolution**: 1024x1024 or 1024x768
- **Cost**: ~$0.003 per image (Banana.dev)

**Trigger**: When `classification.requiresImage === true` or `type === 'infographic'`

**Input**: 
```typescript
{
  prompt: string, // From summarizer agent's imagePrompt
  style: 'diagram' | 'infographic' | 'illustration' | 'chart',
  aspectRatio: '1:1' | '16:9' | '4:3'
}
```

**Output**:
```typescript
{
  imageUrl: string, // Stored in Appwrite Storage
  altText: string,
  metadata: {
    model: 'flux-schnell',
    generatedAt: timestamp,
    prompt: string
  }
}
```

*
**Example Use Cases**:
- "Show me how RAG works" → Diagram of RAG architecture
- "Compare startup costs India vs US" → Infographic with icons + numbers
- "Visualize my project timeline" → Timeline illustration
- "Explain the water cycle" → Educational diagram

---

### Agent 5: UI Schema Validator
**Purpose**: Ensure JSON output matches frontend contracts

**Model**: **No LLM needed** - Pure code validation
- Uses Zod schemas for runtime validation
- On failure, triggers re-prompt to Summarizer Agent with error details

**Action**: Validates against Zod schemas, triggers re-prompt on failure

**Implementation**:


---

## 📊 JSON OUTPUT SCHEMA

All LLM responses MUST conform to this structure:

```typescript
interface DashboardOutput {
  type: 'pie_chart' | 'bar_chart' | 'line_chart' | 'scatter' | 
        'table' | 'timeline' | 'heatmap' | 'sankey' | 'text';
  
  title: string;
  
  data: Array<{
    // For charts
    label?: string;
    value?: number;
    category?: string;
    // For tables
    [key: string]: any;
  }>;
  
  config?: {
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
    legend?: boolean;
    // Chart-specific configs
  };
  
  sublinks?: Array<{
    label: string;
    route: string; // e.g., "/dashboard/expense-details"
    context: Record<string, any>; // Pass data to next view
  }>;
  
  summary?: string; // Optional text explanation
  
  citations?: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
}
```

---

## 🔧 CODING GUIDELINES

### General Rules
1. **Always type-safe**: Use TypeScript strictly, no `any` except in edge cases
2. **Component-driven**: Every visualization is a reusable React component
3. **Schema-first**: Define Zod schemas before implementing features
4. **Error boundaries**: Wrap all LLM interactions with try-catch and fallbacks
5. **Streaming**: Use streaming responses where possible (RSC + Suspense)

### File Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts
│   │   └── upload/
│   │       └── route.ts
│   └── page.tsx

│   │   └── ...
│   ├── dashboard/
│   │   ├── DashboardRenderer.tsx
│   │   └── SublinksPanel.tsx
│   └── chat/
│       ├── ChatInterface.tsx
│       └── MessageBubble.tsx
├── lib/
│   ├── langchain/
│   │   ├── agents/
│   │   │   ├── classifier.ts
│   │   │   ├── retriever.ts
│   │   │   └── summarizer.ts
│   │   └── pipeline.ts
│   ├── appwrite/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   └── database.ts
│   ├── pinecone/
│   │   └── client.ts
│   ├── azure/
│   │   └── model-router.ts
│   └── schemas/
│       └── dashboard.ts (Zod schemas)
└── types/
    └── index.ts
```

### Component Patterns



```


---

## 🎨 UI/UX PRINCIPLES

1. **Dark mode first** - Default to dark theme, support light mode toggle
2. **Animated transitions** - Use Framer Motion for smooth chart renders
3. **Loading states** - Show skeletons during LLM processing
4. **Error states** - Graceful fallbacks with retry options
5. **Responsive** - Mobile-first, works on tablets/desktop
6. **Accessible** - ARIA labels, keyboard navigation, screen reader support



---

## 🔐 SECURITY & PERFORMANCE

### Security Checklist
- ✅ All user data stored in per-user Pinecone namespaces
- ✅ Appwrite Auth (email + OAuth providers)
- ✅ API routes protected with middleware auth checks
- ✅ No sensitive data in client-side code
- ✅ Rate limiting on LLM endpoints (100/day per user)
- ✅ Input sanitization on all user queries

### Performance Optimization
- ✅ Cache embeddings in Pinecone metadata
- ✅ Cache LLM responses in Appwrite (24hr TTL)
- ✅ Lazy load chart libraries (dynamic imports)
- ✅ Use RSC for server-side rendering
- ✅ Debounce search inputs (500ms)
- ✅ Azure Model Router defaults to GPT-5 mini (fast + cheap)

---

## 📋 DEVELOPMENT PHASES

### Phase 1 - Core MVP ✅
- [ ] Next.js setup with App Router
- [ ] Basic chat interface
- [ ] Appwrite auth + database
- [ ] Azure Model Router integration
- [ ] Simple text → chart rendering (pie/bar)

### Phase 2 - RAG Foundation 🚧
- [ ] Pinecone integration
- [ ] File upload (PDF/CSV/JSON)
- [ ] Document chunking + embedding pipeline
- [ ] Retriever agent implementation

### Phase 3 - Visualization Expansion
- [ ] Support 10+ chart types
- [ ] Sublinks routing system
- [ ] Chart config auto-detection

### Phase 4 - Multi-Agent Orchestration
- [ ] LangChain agent pipeline
- [ ] JSON schema validation layer
- [ ] Re-prompting on errors

### Phase 5 - External Research
- [ ] Perplexity Sonar integration
- [ ] Hybrid retrieval (Pinecone + Web)
- [ ] Citation cards

### Phase 6 - Production Polish
- [ ] Theme toggle (dark/light)
- [ ] Streaming responses
- [ ] Analytics dashboard
- [ ] Deploy to Vercel + Appwrite Cloud

---

## 🐛 COMMON PITFALLS TO AVOID

1. **Don't hardcode chart types** - Always use the type from LLM output
2. **Don't skip schema validation** - Invalid JSON will break the UI
3. **Don't expose API keys** - Use environment variables + Vercel secrets
4. **Don't over-complicate** - Start with simple charts, iterate based on usage
5. **Don't forget error boundaries** - LLMs can fail; always have fallbacks
6. **Don't use localStorage for user data** - Use Appwrite for persistence
7. **Don't skip loading states** - LLM calls take 2-10 seconds

---

## 💡 EXAMPLE QUERIES TO SUPPORT

| Query | Expected Output |
|-------|----------------|
| "What did I spend on last month?" | Pie chart + table + drill-down links |
| "Compare AI adoption India vs US" | Bar chart + external citations |
| "Summarize my week" | Timeline chart + text summary |
| "Show project timeline" | Gantt chart from Pinecone data |
| "Trending AI tools 2025" | List + cards with Perplexity data |

---

## 🚀 QUICK START COMMANDS

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Add: APPWRITE_*, PINECONE_*, AZURE_*, PERPLEXITY_API_KEY

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel deploy --prod
```

---

## 📚 KEY DEPENDENCIES

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "langchain": "^0.1.0",
    "@langchain/openai": "^0.0.19",
    "node-appwrite": "^11.0.0",
    "@pinecone-database/pinecone": "^2.0.0",
    "recharts": "^2.10.0",
    "framer-motion": "^11.0.0",
    "zod": "^3.22.0",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## 🎯 COPILOT INSTRUCTIONS

When generating code:

1. **Always reference this document** for architecture decisions
2. **Use TypeScript strictly** - no implicit any
3. **Follow the file structure** outlined above
4. **Implement error handling** for all LLM/API calls
5. **Create reusable components** - don't repeat code
6. **Write JSDoc comments** for complex functions
7. **Add loading/error states** to all async UI
8. **Validate all JSON** from LLM with Zod schemas
9. **Keep components under 200 lines** - split if larger
10. **Test with mock data first** before LLM integration

### When Suggesting Code:
- ✅ Show full implementations, not snippets
- ✅ Include imports and type definitions
- ✅ Add comments explaining complex logic
- ✅ Suggest file paths based on structure above
- ✅ Consider mobile responsiveness
- ✅ Include error boundaries

### When Unsure:
- Ask clarifying questions about requirements
- Suggest multiple approaches with trade-offs
- Reference this doc for architectural context

---

**Remember**: This is NOT a traditional chatbot. Every query should produce a visual, interactive experience. Think "mini wiki generator" not "text responder."