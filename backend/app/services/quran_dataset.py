import csv
from pathlib import Path
from typing import Optional
from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

class QuranDataset:
    """Service to load and cache the local Quran dataset."""
    
    _instance = None
    
    def __init__(self):
        self._quran_data = {}
        self._loaded = False
        
        # Try finding dataset relative to CWD
        cwd_path = Path.cwd() / "dataset" / "quran_dataset.csv"
        if cwd_path.exists():
            self._csv_path = cwd_path
        else:
            # Fallback to relative to project root
            parent_path = Path(__file__).parent.parent.parent.parent
            self._csv_path = (parent_path / "dataset" / "quran_dataset.csv").resolve()
            
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_verses_sync(self):
        if self._loaded:
            return
            
        logger.info(f"Loading local Quran dataset from {self._csv_path}...")
        try:
            if not self._csv_path.exists():
                logger.error(f"Failed to find dataset at {self._csv_path}")
                return

            with open(self._csv_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    chapter = int(row["surah_no"])
                    verse = int(row["ayah_no_surah"])
                    
                    if chapter not in self._quran_data:
                        self._quran_data[chapter] = {}
                        
                    self._quran_data[chapter][verse] = {
                        "arabic": row["ayah_ar"],
                        "translation": row["ayah_en"]
                    }
            
            self._loaded = True
            logger.info("Successfully loaded local Quran dataset.")
        except Exception as e:
            logger.error(f"Error loading local dataset: {e}")

    async def load_verses(self):
        self.load_verses_sync()

    def get_verse_text(self, chapter: int, verse: int) -> Optional[str]:
        """Get the Arabic text for a specific verse."""
        if not self._loaded or not self._quran_data:
            return None
            
        return self._quran_data.get(chapter, {}).get(verse, {}).get("arabic")

    def get_translation(self, chapter: int, verse: int) -> Optional[str]:
        """Get the English translation for a specific verse."""
        if not self._loaded or not self._quran_data:
            return None
            
        return self._quran_data.get(chapter, {}).get(verse, {}).get("translation")
