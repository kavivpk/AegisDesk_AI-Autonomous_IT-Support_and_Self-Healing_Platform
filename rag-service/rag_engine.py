import os
import re
import json
from typing import List, Optional
from pathlib import Path
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
import fitz  # pymupdf
from docx import Document as DocxDocument
from dotenv import load_dotenv

load_dotenv()

class RAGEngine:
    def __init__(self):
        print("🚀 Initializing RAG Engine...")
        
        # ChromaDB setup
        self.chroma_client = chromadb.PersistentClient(
            path="./chroma_db"
        )
        
        self.collection = self.chroma_client.get_or_create_collection(
            name="aegisdesk_knowledge",
            metadata={"hnsw:space": "cosine"}
        )
        
        # Embedding model
        print("📦 Loading embedding model...")
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ RAG Engine ready!")
        
        # BM25 index
        self.bm25_docs = []
        self.bm25_index = None
        self._rebuild_bm25()

    def _rebuild_bm25(self):
        try:
            results = self.collection.get()
            if results['documents']:
                self.bm25_docs = results['documents']
                tokenized = [doc.lower().split() for doc in self.bm25_docs]
                self.bm25_index = BM25Okapi(tokenized)
        except:
            pass

    def _chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunk = ' '.join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)
        return chunks

    def _extract_text_from_pdf(self, content: bytes) -> str:
        try:
            doc = fitz.open(stream=content, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            return text
        except Exception as e:
            raise Exception(f"PDF extraction failed: {str(e)}")

    def _extract_text_from_docx(self, content: bytes) -> str:
        try:
            import io
            doc = DocxDocument(io.BytesIO(content))
            return '\n'.join([para.text for para in doc.paragraphs])
        except Exception as e:
            raise Exception(f"DOCX extraction failed: {str(e)}")

    def process_document(self, content: bytes, filename: str, category: str = "General") -> int:
        ext = Path(filename).suffix.lower()
        
        if ext == '.pdf':
            text = self._extract_text_from_pdf(content)
        elif ext == '.docx':
            text = self._extract_text_from_docx(content)
        else:
            text = content.decode('utf-8', errors='ignore')

        chunks = self._chunk_text(text)
        
        embeddings = self.embedding_model.encode(chunks).tolist()
        
        existing = self.collection.get()
        start_id = len(existing['ids']) if existing['ids'] else 0
        
        ids = [f"{filename}_{i+start_id}" for i in range(len(chunks))]
        metadatas = [{"filename": filename, "category": category, "chunk_index": i} for i in range(len(chunks))]
        
        self.collection.add(
            documents=chunks,
            embeddings=embeddings,
            ids=ids,
            metadatas=metadatas
        )
        
        self._rebuild_bm25()
        return len(chunks)

    def hybrid_search(self, query: str, top_k: int = 5, category: Optional[str] = None) -> List[dict]:
        query_embedding = self.embedding_model.encode([query]).tolist()
        
        where_filter = {"category": category} if category else None
        
        vector_results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=min(top_k * 2, max(1, self.collection.count())),
            where=where_filter
        )
        
        combined = {}
        
        if vector_results['documents'] and vector_results['documents'][0]:
            for i, doc in enumerate(vector_results['documents'][0]):
                doc_id = vector_results['ids'][0][i]
                vector_score = 1 - vector_results['distances'][0][i]
                combined[doc_id] = {
                    "content": doc,
                    "metadata": vector_results['metadatas'][0][i],
                    "vector_score": vector_score,
                    "bm25_score": 0,
                    "final_score": vector_score * 0.6
                }
        
        if self.bm25_index and self.bm25_docs:
            tokens = query.lower().split()
            bm25_scores = self.bm25_index.get_scores(tokens)
            
            all_docs = self.collection.get()
            for i, score in enumerate(bm25_scores):
                if i < len(all_docs['ids']):
                    doc_id = all_docs['ids'][i]
                    if doc_id in combined:
                        combined[doc_id]['bm25_score'] = score
                        combined[doc_id]['final_score'] += score * 0.4
                    else:
                        combined[doc_id] = {
                            "content": all_docs['documents'][i],
                            "metadata": all_docs['metadatas'][i],
                            "vector_score": 0,
                            "bm25_score": score,
                            "final_score": score * 0.4
                        }
        
        sorted_results = sorted(combined.values(), key=lambda x: x['final_score'], reverse=True)
        return sorted_results[:top_k]

    def triage_ticket(self, title: str, description: str) -> dict:
        text = f"{title} {description}".lower()
        
        categories = {
            "Network": ["network", "internet", "wifi", "vpn", "connection", "ip", "dns", "firewall"],
            "Software": ["software", "application", "app", "install", "crash", "error", "update", "license"],
            "Hardware": ["hardware", "laptop", "computer", "printer", "keyboard", "mouse", "screen", "monitor"],
            "Security": ["security", "virus", "malware", "password", "hack", "breach", "access", "permission"],
            "Email": ["email", "outlook", "mail", "smtp", "inbox", "calendar"],
            "VPN": ["vpn", "remote", "tunnel", "cisco", "connect"],
            "Server": ["server", "database", "sql", "backup", "storage", "cloud", "aws"]
        }
        
        priorities = {
            "Critical": ["critical", "urgent", "down", "outage", "breach", "emergency", "production"],
            "High": ["high", "important", "asap", "broken", "not working", "failed"],
            "Medium": ["medium", "slow", "issue", "problem", "error"],
            "Low": ["low", "minor", "question", "help", "how to"]
        }
        
        detected_category = "Other"
        max_category_score = 0
        for cat, keywords in categories.items():
            score = sum(1 for kw in keywords if kw in text)
            if score > max_category_score:
                max_category_score = score
                detected_category = cat
        
        detected_priority = "Medium"
        for priority, keywords in priorities.items():
            if any(kw in text for kw in keywords):
                detected_priority = priority
                break
        
        confidence = min(0.95, 0.5 + (max_category_score * 0.1))
        
        rag_results = self.hybrid_search(f"{title} {description}", top_k=3)
        
        return {
            "category": detected_category,
            "priority": detected_priority,
            "confidence": round(confidence, 2),
            "summary": f"Issue detected: {detected_category} problem with {detected_priority} priority",
            "similar_tickets": len(rag_results),
            "suggested_solutions": [r["content"][:200] for r in rag_results[:2]]
        }

    def generate_solution(self, query: str) -> dict:
        results = self.hybrid_search(query, top_k=5)
        
        if not results:
            return {
                "steps": ["No relevant knowledge found. Please contact IT support."],
                "root_cause": "Unknown",
                "confidence": 0.1,
                "sources": []
            }
        
        top_content = results[0]["content"] if results else ""
        
        return {
            "steps": [
                f"Step 1: Identify the issue — {query[:100]}",
                f"Step 2: Check related documentation",
                f"Step 3: Apply suggested fix based on knowledge base",
                f"Step 4: Verify the solution",
                f"Step 5: Document the resolution"
            ],
            "root_cause": f"Based on knowledge base: {top_content[:150]}",
            "confidence": round(results[0]["final_score"], 2) if results else 0.1,
            "sources": [r["metadata"].get("filename", "Unknown") for r in results[:3]]
        }

    def get_stats(self) -> dict:
        count = self.collection.count()
        return {
            "total_chunks": count,
            "collection_name": "aegisdesk_knowledge",
            "embedding_model": "all-MiniLM-L6-v2",
            "status": "ready"
        }