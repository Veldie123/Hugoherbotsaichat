/**
 * RAG Corpus Indexer
 * 
 * Bron: hugo-rag-export.zip → data/documents_for_embedding.jsonl
 * Leest JSONL bestand en maakt embeddings via OpenAI
 */

import OpenAI from "openai";
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import * as fs from "fs";
import * as readline from "readline";
import crypto from "crypto";

neonConfig.webSocketConstructor = ws;

const openai = new OpenAI();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function ensureUUID(id: string): string {
  if (isValidUUID(id)) return id;
  return crypto.createHash('md5').update(id).digest('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}

interface RagDocument {
  id: string;
  type: string;
  title: string;
  content: string;
  metadata: {
    source?: string;
    word_count?: number;
    techniek?: string | null;
  };
}

async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

async function indexFromJsonl() {
  console.log("📚 RAG Corpus Indexer gestart\n");
  
  const filepath = "rag/corpus/documents_for_embedding.jsonl";
  
  if (!fs.existsSync(filepath)) {
    console.error(`❌ Bestand niet gevonden: ${filepath}`);
    process.exit(1);
  }
  
  const fileStream = fs.createReadStream(filepath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let count = 0;
  let errors = 0;
  
  for await (const line of rl) {
    if (!line.trim()) continue;
    
    try {
      const doc: RagDocument = JSON.parse(line);
      
      const embedding = await createEmbedding(doc.content);
      const docId = ensureUUID(doc.id);
      
      await pool.query(
        `INSERT INTO rag_documents (id, doc_type, title, content, techniek_id, embedding, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO UPDATE SET 
           content = EXCLUDED.content, 
           embedding = EXCLUDED.embedding`,
        [
          docId,
          doc.type,
          doc.title,
          doc.content,
          doc.metadata?.techniek || null,
          `[${embedding.join(',')}]`
        ]
      );
      
      count++;
      process.stdout.write(`\r  Geïndexeerd: ${count} documenten`);
      
    } catch (err) {
      errors++;
      console.error(`\n  ⚠️ Fout bij document: ${err}`);
    }
  }
  
  console.log(`\n\n✅ Klaar! ${count} documenten geïndexeerd, ${errors} fouten`);
  
  const result = await pool.query("SELECT COUNT(*) as count FROM rag_documents");
  console.log(`📊 Totaal in database: ${result.rows[0].count} documenten`);
  
  await pool.end();
}

indexFromJsonl().catch(console.error);
