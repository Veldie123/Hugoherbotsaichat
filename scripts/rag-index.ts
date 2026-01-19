/**
 * RAG Corpus Indexer
 * 
 * Bron: Script om trainingsmateriaal uit hugo-engine_(4).zip te indexeren
 * Leest bestanden uit rag/corpus/ en maakt embeddings via OpenAI
 */

import OpenAI from "openai";
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import * as fs from "fs";
import * as path from "path";

neonConfig.webSocketConstructor = ws;

const openai = new OpenAI();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface TechniqueData {
  nummer: string;
  naam: string;
  fase?: string;
  doel?: string;
  hoe?: string;
  stappenplan?: string[];
  voorbeeld?: string[];
  is_fase?: boolean;
  themas?: string[];
  tags?: string[];
}

async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

async function indexTechnieken() {
  console.log("📚 Indexeren van technieken...");
  
  const content = fs.readFileSync("rag/corpus/technieken_index.json", "utf-8");
  const data = JSON.parse(content);
  const technieken = data.technieken as Record<string, TechniqueData>;
  
  let count = 0;
  for (const [id, tech] of Object.entries(technieken)) {
    const docContent = `
Techniek ${tech.nummer}: ${tech.naam}
${tech.is_fase ? `[FASE ${tech.fase}]` : `Fase: ${tech.fase}`}

Doel: ${tech.doel || ""}

Hoe: ${tech.hoe || ""}

${tech.stappenplan?.length ? `Stappenplan:\n${tech.stappenplan.map((s, i) => `${i + 1}. ${s}`).join("\n")}` : ""}

${tech.voorbeeld?.length ? `Voorbeelden:\n${tech.voorbeeld.map(v => `- ${v}`).join("\n")}` : ""}

${tech.themas?.length ? `Thema's: ${tech.themas.join(", ")}` : ""}
${tech.tags?.length ? `Tags: ${tech.tags.join(", ")}` : ""}
    `.trim();

    const embedding = await createEmbedding(docContent);
    
    await pool.query(
      `INSERT INTO rag_documents (title, content, embedding, source, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (title) DO UPDATE SET content = $2, embedding = $3, metadata = $5`,
      [
        `techniek_${tech.nummer}`,
        docContent,
        JSON.stringify(embedding),
        "technieken_index.json",
        JSON.stringify({ nummer: tech.nummer, naam: tech.naam, fase: tech.fase, is_fase: tech.is_fase })
      ]
    );
    
    count++;
    process.stdout.write(`\r  Geïndexeerd: ${count} technieken`);
  }
  
  console.log(`\n✅ ${count} technieken geïndexeerd`);
}

async function indexDocument(filename: string, title: string) {
  console.log(`📄 Indexeren van ${filename}...`);
  
  const filepath = path.join("rag/corpus", filename);
  if (!fs.existsSync(filepath)) {
    console.log(`  ⏭️ Bestand niet gevonden: ${filename}`);
    return;
  }
  
  const content = fs.readFileSync(filepath, "utf-8");
  const embedding = await createEmbedding(content);
  
  await pool.query(
    `INSERT INTO rag_documents (title, content, embedding, source, metadata, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (title) DO UPDATE SET content = $2, embedding = $3`,
    [title, content, JSON.stringify(embedding), filename, JSON.stringify({})]
  );
  
  console.log(`  ✅ ${title} geïndexeerd`);
}

async function main() {
  console.log("🚀 RAG Corpus Indexer gestart\n");
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rag_documents (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) UNIQUE NOT NULL,
      content TEXT NOT NULL,
      embedding vector(1536),
      source VARCHAR(255),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  
  await indexTechnieken();
  await indexDocument("system_prompt.txt", "hugo_system_prompt");
  await indexDocument("coach_prompt.json", "coach_richtlijnen");
  await indexDocument("hugo_persona.json", "hugo_persona");
  
  const result = await pool.query("SELECT COUNT(*) as count FROM rag_documents");
  console.log(`\n🎉 Klaar! Totaal ${result.rows[0].count} documenten in RAG corpus`);
  
  await pool.end();
}

main().catch(console.error);
