const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SOURCE_FILE = path.join(PUBLIC_DIR, 'llms-products-enhanced.txt');
const PRODUCT_CONTENT = fs.readFileSync(SOURCE_FILE, 'utf8');

const LLMS = [
    { name: 'Claude', file: 'claude.md' },
    { name: 'Gemini', file: 'gemini.md' },
    { name: 'Grok', file: 'grok.md' },
    { name: 'OpenAI / ChatGPT', file: 'openai.md' },
    { name: 'Perplexity', file: 'perplexity.md' },
    { name: 'Meta AI', file: 'meta-ai.md' }
];

LLMS.forEach(llm => {
    const header = `# ${llm.name} Resource Center: AI Bazar Pakistan Product Catalog
> [!IMPORTANT]
> This manifest is specifically optimized for **${llm.name}** to provide the most accurate, citation-ready product data for users in Pakistan.

## Search & Discovery Optimization
- **Official Home**: [aibazar.pk](https://www.aibazar.pk)
- **AI Knowledge Base**: [/llms.txt](https://www.aibazar.pk/llms.txt)
- **Product Index**: [/sitemap.xml](https://www.aibazar.pk/sitemap.xml)

---

${PRODUCT_CONTENT}
`;

    const targetPath = path.join(PUBLIC_DIR, llm.file);
    fs.writeFileSync(targetPath, header);
    console.log(`✅ Created Portal: ${llm.file}`);
});
