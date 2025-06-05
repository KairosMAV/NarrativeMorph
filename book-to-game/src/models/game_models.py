"""
Modelli di dati per il sistema book-to-game
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class SceneData(BaseModel):
    """Dati di una scena dal text-chunker"""
    elementi_narrativi: str
    personaggi: str
    ambientazione: str
    mood_vibe: str
    azione_in_corso: str

class GameProject(BaseModel):
    """Progetto Unity generato"""
    project_name: str
    scenes: List[SceneData]
    unity_files: Dict[str, str]
    summary: Dict[str, Any]
