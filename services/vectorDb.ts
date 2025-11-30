import { embedText } from './gemini';

interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata?: any;
  timestamp: number;
  temporalWeight?: number; // Dynamic weight based on recency
  sentiment?: 'positive' | 'neutral' | 'negative' | 'analytical';
}

// Simple in-memory vector store with localStorage persistence
// For a production app, use 'voy-search' (WASM) or a server-side vector DB (Pinecone, Weaviate).
// This implementation uses Cosine Similarity for local retrieval.

export class VectorStore {
  private documents: VectorDocument[] = [];
  private readonly STORAGE_KEY = 'ZYNC_VECTOR_MEMORY';
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.load();
  }

  private load() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.documents = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load vector memory", e);
        this.documents = [];
      }
    }
  }

  private save() {
    // Debounce save to prevent excessive writes to localStorage
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
        // Limit local storage size (keep last 500 items to prevent quota issues)
        if (this.documents.length > 500) {
            this.documents = this.documents.slice(-500);
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.documents));
        this.saveTimeout = null;
    }, 1000); // Save after 1 second of inactivity
  }

  async add(content: string, metadata?: any, sentiment?: 'positive' | 'neutral' | 'negative' | 'analytical') {
    if (!content || content.trim().length < 5) return;

    const embedding = await embedText(content);
    if (!embedding || embedding.length === 0) return;

    const doc: VectorDocument = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      content,
      embedding,
      metadata,
      timestamp: Date.now(),
      temporalWeight: 1.0, // Initial weight is max
      sentiment
    };

    this.documents.push(doc);
    this.save();
  }

  async search(query: string, topK: number = 3): Promise<VectorDocument[]> {
    const queryEmbedding = await embedText(query);
    if (!queryEmbedding || queryEmbedding.length === 0) return [];

    const now = Date.now();
    const ONE_HOUR = 3600 * 1000;

    // Pre-calculate constants
    const decayRate = 0.1;
    const minDecay = 0.1;

    // Calculate Cosine Similarity & Apply Temporal Weighting
    // Optimization: Use a simple for loop for better performance than map
    const scoredDocs: (VectorDocument & { score: number })[] = [];
    
    for (let i = 0; i < this.documents.length; i++) {
        const doc = this.documents[i];
        const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
        
        // Temporal Decay: Weight decreases as data gets older
        const ageHours = (now - doc.timestamp) / ONE_HOUR;
        const decayFactor = Math.max(minDecay, 1.0 - (ageHours * decayRate));
        
        // Weighted Score: 70% Similarity, 30% Temporal Recency
        const finalScore = (similarity * 0.7) + (decayFactor * 0.3);
        
        scoredDocs.push({ ...doc, score: finalScore, temporalWeight: decayFactor });
    }

    // Sort by score descending
    scoredDocs.sort((a, b) => b.score - a.score);

    return scoredDocs.slice(0, topK);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    // Optimization: Cache length
    const len = vecA.length;

    for (let i = 0; i < len; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  clear() {
      this.documents = [];
      localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const memoryStore = new VectorStore();
