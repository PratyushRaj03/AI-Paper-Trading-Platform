"""
Knowledge Ingestion Script
Loads documents from knowledge directory and verifies TF-IDF index.
"""
from app.rag import rag_pipeline

if __name__ == '__main__':
    print("Ingesting knowledge documents...")
    rag_pipeline.load_and_ingest_knowledge()
    print(f"Ingestion finished. Loaded {len(rag_pipeline.documents)} chunks.")
