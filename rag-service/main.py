from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
from rag_engine import RAGEngine

app = FastAPI(title="AegisDesk RAG Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag = RAGEngine()

class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5
    category: Optional[str] = None

class TriageRequest(BaseModel):
    title: str
    description: str

@app.get("/")
def root():
    return {"message": "AegisDesk RAG Service running!", "status": "healthy"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...), category: str = "General"):
    try:
        content = await file.read()
        result = rag.process_document(content, file.filename, category)
        return {"success": True, "message": f"Document '{file.filename}' processed", "chunks": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
def search(request: QueryRequest):
    try:
        results = rag.hybrid_search(request.query, request.top_k, request.category)
        return {"success": True, "results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/triage")
def triage_ticket(request: TriageRequest):
    try:
        result = rag.triage_ticket(request.title, request.description)
        return {"success": True, "triage": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/solve")
def solve_ticket(request: QueryRequest):
    try:
        result = rag.generate_solution(request.query)
        return {"success": True, "solution": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def get_stats():
    try:
        stats = rag.get_stats()
        return {"success": True, "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)