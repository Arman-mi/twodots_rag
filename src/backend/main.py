from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from rag import ask_twodots
from schemas import ChatRequest, ChatResponse

app = FastAPI(title="TwoDots RAG API")

frontend_origin = os.environ.get("FRONTEND_ORIGIN", "*")

origins = [
    "https://twodots-rag-model.onrender.com",
    "http://localhost:3000",   
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    answer, citations = ask_twodots(request.message)
    return ChatResponse(response=answer, citations=citations)

