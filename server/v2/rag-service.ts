/**
 * RAG Service for Hugo V2 Engine
 * 
 * Provides semantic search over Hugo's training materials
 * using OpenAI embeddings and pgvector similarity search.
 * 
 * TODO: RAG-DATABASE-FIX
 * ----------------------
 * Issue: Database error "type vector does not exist"
 * Status: Done (januari 2026)
 * 
 * Oplossing:
 * - pgvector extensie geïnstalleerd: CREATE EXTENSION IF NOT EXISTS vector;
 * - rag_documents tabel aangemaakt met vector(1536) kolom
 * - ivfflat index aangemaakt voor snelle similarity search
 * 
 * TODO: RAG-CORPUS-VULLEN
 * -----------------------
 * Issue: RAG corpus is leeg - geen trainingsmateriaal geïndexeerd
 * Status: Pending
 * 
 * Aanpak:
 * 1. Maak rag/corpus/ directory met trainingsmateriaal (.md/.txt files)
 * 2. Run indexeer script: npm run rag:index
 * 3. Verifieer: SELECT COUNT(*) FROM rag_documents;
 */

import OpenAI from "openai";
import { pool } from "../db";
import * as fs from "fs";
import * as path from "path";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

// Use direct OpenAI API for embeddings (Replit AI Integrations doesn't support embeddings)
// Requires OPENAI_API_KEY secret to be set
export function getOpenAIClientForEmbeddings(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("[RAG] Embeddings not available (no OPENAI_API_KEY)");
    return null;
  }
  return new OpenAI({ apiKey });
}

// Use Replit AI Integrations for chat completions
export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  
  if (!apiKey || !baseURL) {
    console.log("[RAG] Chat completions not available (no AI Integrations configured)");
    return null;
  }
  return new OpenAI({ apiKey, baseURL });
}

// Check if RAG (embeddings) is available
export function isRagAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export interface RagDocument {
  id: string;
  docType: string;
  title: string;
  content: string;
  technikId?: string;
  similarity?: number;
}

export interface RagSearchResult {
  documents: RagDocument[];
  query: string;
  searchTimeMs: number;
}

/**
 * Generate embedding for a text using OpenAI
 * Returns null if OpenAI API key is not available (embeddings require direct API key)
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const client = getOpenAIClientForEmbeddings();
  if (!client) {
    return null;
  }
  
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Search for relevant documents using semantic similarity
 */
export async function searchRag(
  query: string,
  options: {
    limit?: number;
    threshold?: number;
    docType?: string;
    technikId?: string;
  } = {}
): Promise<RagSearchResult> {
  const startTime = Date.now();
  const { limit = 5, threshold = 0.65, docType, technikId } = options;

  try {
    const queryEmbedding = await generateEmbedding(query);
    
    if (!queryEmbedding) {
      console.log("[RAG] Embeddings not available (no OPENAI_API_KEY)");
      return { documents: [], query, searchTimeMs: Date.now() - startTime };
    }
    
    const embeddingStr = `[${queryEmbedding.join(",")}]`;
    
    const result = await pool.query(
      `SELECT * FROM match_rag_documents(
        $1::vector,
        $2::float,
        $3::int,
        $4::text,
        $5::text
      )`,
      [embeddingStr, threshold, limit, docType || null, technikId || null]
    );

    const documents: RagDocument[] = result.rows.map((row: any) => ({
      id: row.id,
      docType: row.doc_type,
      title: row.title,
      content: row.content,
      technikId: row.techniek_id,
      similarity: row.similarity,
    }));

    return {
      documents,
      query,
      searchTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error("[RAG] Search error:", error);
    return {
      documents: [],
      query,
      searchTimeMs: Date.now() - startTime,
    };
  }
}

/**
 * Load and index the RAG corpus into the database
 */
export async function indexCorpus(): Promise<{ indexed: number; errors: number; needsApiKey?: boolean }> {
  if (!isRagAvailable()) {
    console.error("[RAG] OPENAI_API_KEY not set - cannot generate embeddings");
    return { indexed: 0, errors: 0, needsApiKey: true };
  }
  
  const corpusPath = path.join(process.cwd(), "data/rag/epic_rag_corpus.json");
  
  if (!fs.existsSync(corpusPath)) {
    console.error("[RAG] Corpus not found:", corpusPath);
    return { indexed: 0, errors: 0 };
  }

  const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf-8"));
  let indexed = 0;
  let errors = 0;

  console.log(`[RAG] Indexing ${corpus.length} documents...`);

  for (const doc of corpus) {
    try {
      const existing = await pool.query(
        "SELECT id FROM rag_documents WHERE source_id = $1",
        [doc.source || doc.id]
      );

      if (existing.rows.length > 0) {
        continue;
      }

      const embedding = await generateEmbedding(doc.content);
      if (!embedding) {
        errors++;
        continue;
      }
      const embeddingStr = `[${embedding.join(",")}]`;

      await pool.query(
        `INSERT INTO rag_documents 
         (doc_type, source_id, title, content, techniek_id, embedding, word_count)
         VALUES ($1, $2, $3, $4, $5, $6::vector, $7)`,
        [
          doc.type,
          doc.source || doc.id,
          doc.title,
          doc.content,
          doc.techniek?.nummer || null,
          embeddingStr,
          doc.word_count,
        ]
      );

      indexed++;
      
      if (indexed % 10 === 0) {
        console.log(`[RAG] Indexed ${indexed} documents...`);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`[RAG] Error indexing ${doc.id}:`, error);
      errors++;
    }
  }

  console.log(`[RAG] Indexing complete: ${indexed} indexed, ${errors} errors`);
  return { indexed, errors };
}

/**
 * Get document count in the RAG database
 */
export async function getDocumentCount(): Promise<number> {
  const result = await pool.query("SELECT COUNT(*) FROM rag_documents");
  return parseInt(result.rows[0].count, 10);
}

/**
 * Get relevant Hugo training context for a technique or topic
 */
export async function getTrainingContext(
  sellerMessage: string,
  techniqueId?: string
): Promise<string | null> {
  const result = await searchRag(sellerMessage, {
    limit: 3,
    threshold: 0.6,
    docType: "hugo_training",
  });

  if (result.documents.length === 0) {
    return null;
  }

  const contextParts = result.documents.map((doc, i) => {
    const similarity = doc.similarity ? ` (${(doc.similarity * 100).toFixed(0)}%)` : "";
    return `[${i + 1}] ${doc.title}${similarity}:\n${doc.content.slice(0, 500)}...`;
  });

  return contextParts.join("\n\n");
}
