"""Utility script to populate vector store with Quranic verses."""

import sys

sys.path.insert(0, ".")

from app.config import settings
from app.services.corpus_parser import CorpusParser
from app.services.vector_store import VectorStore
from camel_tools.utils.charmap import CharMapper


def populate_vector_store(limit: int = 1000):
    """Populate vector store with verses from the corpus.

    Args:
        limit: Number of verses to add (default 20)
    """
    print("Loading corpus...")
    corpus = CorpusParser()
    verses_data = corpus.load_verses()

    print(f"Loaded {len(verses_data)} chapters")

    # Prepare verses for vector store
    verses_to_add = []
    for chapter_num, chapter_verses in verses_data.items():
        for verse_num, words in chapter_verses.items():
            # Create text from word forms
            text = " ".join([w.form for w in words])
            verses_to_add.append(
                {
                    "chapter": chapter_num,
                    "verse": verse_num,
                    "arabic_text": text,
                    "translation": None,
                }
            )

            if limit and len(verses_to_add) >= limit:
                break
        if limit and len(verses_to_add) >= limit:
            break

    print(f"Adding {len(verses_to_add)} verses to vector store...")

    # Initialize Arabic transliterator
    mapper = CharMapper.builtin_mapper("bw2ar")

    # Add to vector store one by one
    vector_store = VectorStore()
    
    # Reset existing data
    print("Resetting existing vector store data...")
    vector_store.reset()

    for i, verse in enumerate(verses_to_add):
        try:
            # Convert Buckwalter to Arabic script
            arabic_text = mapper.map_string(verse["arabic_text"])
            
            vector_store.add_verse(
                chapter=verse["chapter"],
                verse=verse["verse"],
                arabic_text=arabic_text,
                translation=verse.get("translation"),
            )
            if (i + 1) % 5 == 0:
                print(f"Added {i + 1} verses...")
        except Exception as e:
            print(f"Error adding verse {verse['chapter']}:{verse['verse']}: {e}")

    print(f"Done! Added {len(verses_to_add)} verses to vector store")
    print(f"Total verses in store: {vector_store.get_verse_count()}")


if __name__ == "__main__":
    populate_vector_store(limit=1000)
