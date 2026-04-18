"""Corpus parser service for Quranic Arabic Corpus v0.4 morphology."""

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)


@dataclass
class WordData:
    """Data class representing a word from the corpus."""

    chapter: int
    verse: int
    word_num: int
    subword: int
    form: str
    tag: str
    features: dict


class CorpusParser:
    """Parser for Quranic Arabic Corpus v0.4 morphology file.

    The corpus file format is tab-separated with columns:
    LOCATION | FORM | TAG | FEATURES

    Example line:
    (1:1:1:2)	somi	N	STEM|POS:N|LEM:{som|ROOT:smw|M|GEN
    """

    def __init__(self, corpus_path: Optional[Path] = None):
        """Initialize the corpus parser.

        Args:
            corpus_path: Path to the corpus file. Defaults to settings.corpus_path.
        """
        self._corpus_path = corpus_path or settings.corpus_path
        self._cache: dict[int, dict[int, list[WordData]]] = {}
        self._loaded = False

    def parse_location(self, location: str) -> tuple[int, int, int, int]:
        """Parse location string to (chapter, verse, word, subword).

        Args:
            location: Location string in format "(chapter:verse:word:subword)"

        Returns:
            Tuple of (chapter, verse, word, subword) as integers

        Raises:
            ValueError: If location format is invalid

        Example:
            >>> parser.parse_location("(1:1:1:2)")
            (1, 1, 1, 2)
        """
        match = re.match(r"\((\d+):(\d+):(\d+):(\d+)\)", location)
        if not match:
            raise ValueError(f"Invalid location format: {location}")

        return (
            int(match.group(1)),
            int(match.group(2)),
            int(match.group(3)),
            int(match.group(4)),
        )

    def parse_features(self, features_str: str) -> dict:
        """Parse features string into a dictionary.

        Args:
            features_str: Features string in corpus format

        Returns:
            Dictionary with parsed features

        Example:
            >>> parser.parse_features("STEM|POS:N|LEM:{som|ROOT:smw|M|GEN")
            {'pos': 'N', 'lemma': 'som', 'root': 'smw', 'gender': 'M'}
        """
        features = {}

        # Parse POS (Part of Speech)
        pos_match = re.search(r"POS:([^|]+)", features_str)
        if pos_match:
            features["pos"] = pos_match.group(1)

        # Parse LEM (Lemma) - extract from {lemma}
        lem_match = re.search(r"LEM:\{([^}|]+)", features_str)
        if lem_match:
            features["lemma"] = lem_match.group(1)

        # Parse ROOT
        root_match = re.search(r"ROOT:([^|]+)", features_str)
        if root_match:
            features["root"] = root_match.group(1)

        # Parse gender (M or F)
        if re.search(r"\|M\b", features_str):
            features["gender"] = "M"
        elif re.search(r"\|F\b", features_str):
            features["gender"] = "F"

        # Parse number
        if re.search(r"\|S\b", features_str):
            features["number"] = "S"
        elif re.search(r"\|MS\b", features_str):
            features["number"] = "MS"
        elif re.search(r"\|MP\b", features_str):
            features["number"] = "MP"
        elif re.search(r"\|FP\b", features_str):
            features["number"] = "FP"

        # Parse case
        if re.search(r"\|NOM\b", features_str):
            features["case"] = "NOM"
        elif re.search(r"\|GEN\b", features_str):
            features["case"] = "GEN"
        elif re.search(r"\|ACC\b", features_str):
            features["case"] = "ACC"

        return features

    def parse_word_line(self, line: str) -> Optional[WordData]:
        """Parse a single line from the corpus file.

        Args:
            line: Tab-separated line from corpus

        Returns:
            WordData instance or None for invalid/header lines
        """
        # Skip header lines and empty lines
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("LOCATION"):
            return None

        # Split by tab
        parts = line.split("\t")
        if len(parts) < 4:
            logger.debug(f"Skipping malformed line: {line[:50]}...")
            return None

        location, form, tag, features_str = parts[0], parts[1], parts[2], parts[3]

        try:
            chapter, verse, word_num, subword = self.parse_location(location)
            features = self.parse_features(features_str)

            return WordData(
                chapter=chapter,
                verse=verse,
                word_num=word_num,
                subword=subword,
                form=form,
                tag=tag,
                features=features,
            )
        except (ValueError, IndexError) as e:
            logger.debug(f"Failed to parse line: {line[:50]}... Error: {e}")
            return None

    def load_verses(self) -> dict:
        """Load all verses from the corpus file.

        Returns:
            Dictionary mapping chapter -> verse -> list of WordData
        """
        if self._loaded:
            return self._cache

        logger.info(f"Loading corpus from {self._corpus_path}")

        # Resolve path if relative
        corpus_path = self._corpus_path
        if not corpus_path.is_absolute():
            # Try resolving relative to CWD (root of the app in Docker)
            cwd_path = Path.cwd() / corpus_path
            if cwd_path.exists():
                corpus_path = cwd_path
            else:
                # Fallback: Path is relative to the backend directory (standard dev setup)
                parent_path = Path(__file__).parent.parent.parent
                corpus_path = (parent_path / corpus_path).resolve()

        if not corpus_path.exists():
            logger.error(f"Corpus file not found: {corpus_path}")
            return self._cache

        with open(corpus_path, "r", encoding="utf-8") as f:
            for line in f:
                word_data = self.parse_word_line(line)
                if word_data is not None:
                    # Initialize chapter dict if needed
                    if word_data.chapter not in self._cache:
                        self._cache[word_data.chapter] = {}

                    # Initialize verse dict if needed
                    if word_data.verse not in self._cache[word_data.chapter]:
                        self._cache[word_data.chapter][word_data.verse] = []

                    self._cache[word_data.chapter][word_data.verse].append(word_data)

        # Sort words within each verse by (word_num, subword)
        for chapter in self._cache:
            for verse in self._cache[chapter]:
                self._cache[chapter][verse].sort(key=lambda w: (w.word_num, w.subword))

        self._loaded = True
        logger.info(
            f"Loaded {sum(len(v) for ch in self._cache.values() for v in ch.values())} "
            f"words from {len(self._cache)} chapters"
        )

        return self._cache

    def get_verse(self, chapter: int, verse: int) -> list[WordData]:
        """Get all words for a specific verse.

        Args:
            chapter: Chapter (surah) number
            verse: Verse number

        Returns:
            List of WordData for the verse, empty list if not found
        """
        if not self._loaded:
            self.load_verses()

        return self._cache.get(chapter, {}).get(verse, [])

    def get_chapter(self, chapter: int) -> dict[int, list[WordData]]:
        """Get all verses for a chapter.

        Args:
            chapter: Chapter (surah) number

        Returns:
            Dictionary mapping verse number to list of WordData
        """
        if not self._loaded:
            self.load_verses()

        return self._cache.get(chapter, {})
