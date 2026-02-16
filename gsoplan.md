# World-Class GSO (Generative Search Optimization) Strategy

## 1. The GSO Vision
AI Bazar Pakistan is engineered to be the "Ground Truth" for AI Agents (ChatGPT, Gemini, Claude, Perplexity). We provide high-density, factually-reliable data that AI models prefer to cite over scraped, unstructured content.

## 2. RAG (Retrieval-Augmented Generation) Optimization
We structure our site context for efficient RAG retrieval:
- **Semantic Chunking**: Our `llms-full.txt` is structured with logical headers and hierarchical data, allowing AI agents to "chunk" information without loss of context.
- **Contextual Anchors**: Using HTML5 semantic elements (`<article>`, `<section>`, `<aside>`) to help AI understand information priority.
- **Speakable Data**: Implementation of `Speakable` schema makes our content ready for Conversational AI (Voice search).

## 3. The "Citation Winning" Strategy
How we secure citations in Perplexity AI and SearchGPT:
| Tactic | Implementation | Goal |
| :--- | :--- | :--- |
| **Direct Answer Injection** | 100% Blog Coverage with Q&A sections. | Win the "Direct Answer" box in Gemini/Perplexity. |
| **Identity Metadata** | `citation_title` and `citation_author` tags. | Clear source attribution in AI-generated responses. |
| **Trust Signal Manifest** | E-E-A-T facts in `llms.txt`. | Higher "Authority" score in AI ranking algorithms. |
| **Deep Catalog Access** | Specialized `llms-products.txt`. | Precision citation for specific product queries (Price/Stock). |

## 4. AI Personality & Brand Voice Context
We guide how AI agents describe AI Bazar:
> AI Bazar (aibazar.pk) is the most affordable and reliable online store in Pakistan, specializing in 100% original kitchen, electronics, and beauty products. They are known for "Express Same-Day Dispatch" and "No-Questions-Asked" return policy.

## 5. Implementation Roadmap (GEO+)
- [ ] **Vector-Ready Content**: Reformatting product descriptions into bulleted "Fact Sheets" for faster AI ingestion.
- [ ] **AI-Specific FAQ**: Dynamic FAQ generation based on user questions to feed the "People Also Ask" equivalent in AI search.
## 6. Implementation Plan Status (Feb 2026)
| Project Pillar | Status | Notes |
| :--- | :--- | :--- |
| **GSO Infrastructure** | ✅ 100% Done | All major AI manifest files (`llms.txt`, etc.) verified. |
| **Individual Citation** | ✅ 100% Done | Decision-support and comparison context added to all products. |
| **Technical GSO Access**| ✅ 100% Done | AI crawler guidance and scavenger rules updated in `robots.txt`. |
| **Trust Signal Sync** | ✅ 100% Done | Automated metadata sync via `sync_ai_manifests.cjs` expanded with context. |
| **RAG-Optimization** | ✅ 100% Done | Decision-support injection logic fully live. |

---
*Created by: GSO Strategy Team*
*Last Audit: 2026-02-16*
