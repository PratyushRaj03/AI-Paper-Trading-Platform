import os
import glob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

KNOWLEDGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'knowledge')

class LocalRAGPipeline:
    def __init__(self):
        self.documents = []
        self.doc_metadata = []
        self.vectorizer = None
        self.tfidf_matrix = None
        self.load_and_ingest_knowledge()

    def load_and_ingest_knowledge(self):
        """Reads markdown files from knowledge directory, chunks them, and builds TF-IDF index."""
        md_files = glob.glob(os.path.join(KNOWLEDGE_DIR, '*.md'))
        chunks = []
        metadata = []

        for file_path in md_files:
            file_name = os.path.basename(file_path).replace('.md', '').replace('_', ' ').title()
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Split document into paragraphs/sections by '##' or double newlines
                sections = content.split('##')
                for idx, sec in enumerate(sections):
                    clean_sec = sec.strip()
                    if len(clean_sec) > 30:
                        chunks.append(clean_sec)
                        metadata.append({
                            'source': file_name,
                            'section_id': idx
                        })
            except Exception as e:
                print(f"Error loading {file_path}: {e}")

        if chunks:
            self.documents = chunks
            self.doc_metadata = metadata
            self.vectorizer = TfidfVectorizer(stop_words='english')
            self.tfidf_matrix = self.vectorizer.fit_transform(self.documents)
            print(f"RAG Knowledge Pipeline initialized with {len(chunks)} document chunks.")
        else:
            print("Warning: No knowledge document chunks loaded.")

    def query(self, user_question: str, top_k: int = 3):
        """Finds top-k relevant knowledge chunks matching user question."""
        if not self.vectorizer or not self.tfidf_matrix or len(self.documents) == 0:
            return [{
                "text": "General financial knowledge base.",
                "source": "Investing Fundamentals"
            }]

        query_vec = self.vectorizer.transform([user_question])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix)[0]

        top_indices = similarities.argsort()[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score > 0.05:  # Relevance threshold
                results.append({
                    "text": self.documents[idx],
                    "source": self.doc_metadata[idx]['source'],
                    "score": score
                })

        if not results:
            results.append({
                "text": self.documents[top_indices[0]],
                "source": self.doc_metadata[top_indices[0]]['source'],
                "score": float(similarities[top_indices[0]])
            })

        return results

# Singleton pipeline instance
rag_pipeline = LocalRAGPipeline()
