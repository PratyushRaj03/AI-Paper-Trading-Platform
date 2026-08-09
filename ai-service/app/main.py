import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from app.rag import rag_pipeline
from app.coach import analyze_user_portfolio_behavior
from app.trade_analyzer import analyze_single_trade

app = FastAPI(
    title="AI Financial Assistant & Trade Coach API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str
    history: Optional[List[dict]] = []

class CoachRequest(BaseModel):
    performance: Optional[dict] = {}
    risk: Optional[dict] = {}
    behavior: Optional[dict] = {}
    holdings: Optional[List[dict]] = []

class TradeAnalysisRequest(BaseModel):
    tradeId: Optional[str] = ""
    symbol: str
    side: str
    quantity: float
    entryPrice: float
    exitPrice: Optional[float] = 0.0
    realizedPnL: Optional[float] = 0.0
    totalValue: float

@app.get("/health")
def health_check():
    ai_key = os.getenv("AI_API_KEY", "")
    return {
        "status": "online",
        "service": "ai-service",
        "has_api_key": bool(ai_key),
        "demo_mode": not bool(ai_key),
        "knowledge_chunks": len(rag_pipeline.documents)
    }

@app.post("/api/ai/coach")
def get_coach_insights(req: CoachRequest):
    data = req.model_dump()
    result = analyze_user_portfolio_behavior(data)
    ai_key = os.getenv("AI_API_KEY", "")
    result["isDemoFallback"] = not bool(ai_key)
    if not ai_key:
        result["message"] = "AI API key not configured — running in demo educational mode."
    return result

@app.post("/api/ai/trade-analysis")
def analyze_trade(req: TradeAnalysisRequest):
    trade_data = req.model_dump()
    result = analyze_single_trade(trade_data)
    ai_key = os.getenv("AI_API_KEY", "")
    result["isDemoFallback"] = not bool(ai_key)
    if not ai_key:
        result["message"] = "AI API key not configured — running in demo educational mode."
    return result

@app.post("/api/ai/chat")
def rag_chat(req: ChatRequest):
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # Retrieve relevant knowledge chunks
    retrieved_chunks = rag_pipeline.query(question, top_k=2)
    sources = list(set([c['source'] for c in retrieved_chunks if 'source' in c]))

    context_text = "\n\n".join([c['text'] for c in retrieved_chunks])
    
    # Formulate answer incorporating RAG context
    ai_key = os.getenv("AI_API_KEY", "")

    answer = f"Based on financial principles:\n\n{context_text}\n\nKey Takeaway: Always maintain strict position sizing, monitor portfolio concentration, and never risk more than 2% of total virtual capital per position."

    return {
        "answer": answer,
        "sources": sources,
        "isDemoFallback": not bool(ai_key),
        "message": "AI API key not configured — running in demo educational mode." if not ai_key else None
    }
