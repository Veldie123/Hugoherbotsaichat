/**
 * RAG Setup Verificatie Test
 * 
 * Run: npx tsx test-rag-setup.ts
 * 
 * Controleert:
 * 1. Bestanden aanwezig en correct formaat
 * 2. Database connectie en pgvector
 * 3. RAG tabel en functie
 * 4. Embedding generatie
 * 5. Semantic search werkt
 */

import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const TESTS_PASSED: string[] = [];
const TESTS_FAILED: string[] = [];

function pass(name: string) {
  console.log(`✅ ${name}`);
  TESTS_PASSED.push(name);
}

function fail(name: string, error?: string) {
  console.log(`❌ ${name}${error ? `: ${error}` : ''}`);
  TESTS_FAILED.push(name);
}

async function testFileExists(filePath: string, testName: string): Promise<boolean> {
  if (fs.existsSync(filePath)) {
    pass(testName);
    return true;
  } else {
    fail(testName, `Bestand niet gevonden: ${filePath}`);
    return false;
  }
}

async function testJsonCorpus(): Promise<boolean> {
  const filePath = 'rag/corpus/epic_rag_corpus.json';
  
  if (!fs.existsSync(filePath)) {
    fail('JSON Corpus formaat', 'Bestand niet gevonden');
    return false;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      fail('JSON Corpus formaat', 'Moet een array zijn');
      return false;
    }
    
    if (data.length === 0) {
      fail('JSON Corpus formaat', 'Array is leeg');
      return false;
    }
    
    const firstDoc = data[0];
    const requiredFields = ['id', 'type', 'title', 'content'];
    const missingFields = requiredFields.filter(f => !(f in firstDoc));
    
    if (missingFields.length > 0) {
      fail('JSON Corpus formaat', `Missende velden: ${missingFields.join(', ')}`);
      return false;
    }
    
    pass(`JSON Corpus formaat (${data.length} documenten)`);
    return true;
  } catch (e: any) {
    fail('JSON Corpus formaat', e.message);
    return false;
  }
}

async function testJsonlFormat(): Promise<boolean> {
  const filePath = 'rag/corpus/documents_for_embedding.jsonl';
  
  if (!fs.existsSync(filePath)) {
    fail('JSONL formaat', 'Bestand niet gevonden');
    return false;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length === 0) {
      fail('JSONL formaat', 'Bestand is leeg');
      return false;
    }
    
    // Check first line is valid JSON
    const firstLine = JSON.parse(lines[0]);
    
    if (typeof firstLine !== 'object') {
      fail('JSONL formaat', 'Eerste regel is geen JSON object');
      return false;
    }
    
    // Check it's NOT HTML
    if (content.includes('<!DOCTYPE') || content.includes('<html')) {
      fail('JSONL formaat', 'Dit lijkt een HTML bestand te zijn, niet JSONL!');
      return false;
    }
    
    pass(`JSONL formaat (${lines.length} regels)`);
    return true;
  } catch (e: any) {
    fail('JSONL formaat', e.message);
    return false;
  }
}

async function testDatabaseConnection(): Promise<Pool | null> {
  if (!process.env.DATABASE_URL) {
    fail('Database connectie', 'DATABASE_URL environment variable niet gevonden');
    return null;
  }
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query('SELECT 1');
    pass('Database connectie');
    return pool;
  } catch (e: any) {
    fail('Database connectie', e.message);
    return null;
  }
}

async function testPgVector(pool: Pool): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      ) as installed
    `);
    
    if (result.rows[0].installed) {
      pass('pgvector extensie geïnstalleerd');
      return true;
    } else {
      fail('pgvector extensie', 'Niet geïnstalleerd. Run: CREATE EXTENSION IF NOT EXISTS vector;');
      return false;
    }
  } catch (e: any) {
    fail('pgvector extensie', e.message);
    return false;
  }
}

async function testRagTable(pool: Pool): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'rag_documents'
      ) as exists
    `);
    
    if (result.rows[0].exists) {
      // Check row count
      const countResult = await pool.query('SELECT COUNT(*) as count FROM rag_documents');
      pass(`RAG tabel bestaat (${countResult.rows[0].count} documenten)`);
      return true;
    } else {
      fail('RAG tabel', 'Tabel rag_documents bestaat niet. Zie README voor setup.');
      return false;
    }
  } catch (e: any) {
    fail('RAG tabel', e.message);
    return false;
  }
}

async function testMatchFunction(pool: Pool): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'match_rag_documents'
      ) as exists
    `);
    
    if (result.rows[0].exists) {
      pass('match_rag_documents functie bestaat');
      return true;
    } else {
      fail('match_rag_documents functie', 'Functie niet gevonden. Zie README voor setup.');
      return false;
    }
  } catch (e: any) {
    fail('match_rag_documents functie', e.message);
    return false;
  }
}

async function testOpenAIEmbeddings(): Promise<boolean> {
  if (!process.env.OPENAI_API_KEY) {
    fail('OpenAI API', 'OPENAI_API_KEY environment variable niet gevonden');
    return false;
  }
  
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'Test embedding generatie'
    });
    
    if (response.data[0].embedding.length === 1536) {
      pass('OpenAI embeddings (text-embedding-3-small)');
      return true;
    } else {
      fail('OpenAI embeddings', `Onverwachte embedding dimensie: ${response.data[0].embedding.length}`);
      return false;
    }
  } catch (e: any) {
    fail('OpenAI embeddings', e.message);
    return false;
  }
}

async function testSemanticSearch(pool: Pool): Promise<boolean> {
  try {
    // Generate test embedding
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'Hoe start ik een verkoopgesprek?'
    });
    const embedding = response.data[0].embedding;
    const embeddingStr = `[${embedding.join(',')}]`;
    
    // Search
    const result = await pool.query(`
      SELECT * FROM match_rag_documents($1::vector, 0.5, 3, NULL, NULL)
    `, [embeddingStr]);
    
    if (result.rows.length > 0) {
      pass(`Semantic search werkt (${result.rows.length} resultaten)`);
      console.log(`   Top resultaat: "${result.rows[0].title}" (similarity: ${result.rows[0].similarity.toFixed(3)})`);
      return true;
    } else {
      fail('Semantic search', 'Geen resultaten gevonden. Zijn documenten geïndexeerd?');
      return false;
    }
  } catch (e: any) {
    fail('Semantic search', e.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n🔍 RAG Setup Verificatie\n');
  console.log('=' .repeat(50));
  
  // File tests
  console.log('\n📁 Bestand Tests\n');
  await testFileExists('rag/corpus/epic_rag_corpus.json', 'epic_rag_corpus.json aanwezig');
  await testFileExists('rag/corpus/documents_for_embedding.jsonl', 'documents_for_embedding.jsonl aanwezig');
  await testJsonCorpus();
  await testJsonlFormat();
  
  // Database tests
  console.log('\n🗄️ Database Tests\n');
  const pool = await testDatabaseConnection();
  
  if (pool) {
    await testPgVector(pool);
    const tableExists = await testRagTable(pool);
    await testMatchFunction(pool);
    
    // API tests
    console.log('\n🤖 API Tests\n');
    const embeddingsWork = await testOpenAIEmbeddings();
    
    // Semantic search (only if everything else works)
    if (tableExists && embeddingsWork) {
      console.log('\n🔎 Search Test\n');
      await testSemanticSearch(pool);
    }
    
    await pool.end();
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Resultaat: ${TESTS_PASSED.length} geslaagd, ${TESTS_FAILED.length} gefaald\n`);
  
  if (TESTS_FAILED.length === 0) {
    console.log('🎉 Alle tests geslaagd! RAG systeem is correct geconfigureerd.\n');
  } else {
    console.log('⚠️ Sommige tests gefaald. Zie README_RAG.md voor setup instructies.\n');
    process.exit(1);
  }
}

runAllTests().catch(console.error);
