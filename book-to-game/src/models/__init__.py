"""
Pydantic models for book-to-game conversion system.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum


class GameType(str, Enum):
    """Types of games that can be generated."""
    ADVENTURE = "adventure"
    RPG = "rpg"
    PUZZLE = "puzzle"
    EXPLORATION = "exploration"
    INTERACTIVE_STORY = "interactive_story"


class ARExperienceType(str, Enum):
    """Types of AR experiences."""
    LOCATION_BASED = "location_based"
    MARKER_BASED = "marker_based"
    MARKERLESS = "markerless"
    FACE_TRACKING = "face_tracking"


class Character(BaseModel):
    """Represents a character from the book."""
    name: str
    description: str
    personality_traits: List[str]
    appearance: str
    role: str  # protagonist, antagonist, supporting, etc.
    relationships: Dict[str, str] = Field(default_factory=dict)
    dialogue_style: str = ""
    
    # Unity/Game specific
    model_3d_hints: Dict[str, Any] = Field(default_factory=dict)
    animation_suggestions: List[str] = Field(default_factory=list)
    voice_characteristics: str = ""


class Location(BaseModel):
    """Represents a location/setting from the book."""
    name: str
    description: str
    atmosphere: str
    time_period: str = ""
    weather: str = ""
    lighting: str = ""
    sounds: List[str] = Field(default_factory=list)
    
    # Unity/AR specific
    ar_markers: List[str] = Field(default_factory=list)
    model_3d_hints: Dict[str, Any] = Field(default_factory=dict)
    interactive_objects: List[str] = Field(default_factory=list)


class Scene(BaseModel):
    """Represents a scene from the book."""
    id: str
    title: str
    summary: str
    location: str
    characters_present: List[str]
    mood: str
    key_events: List[str]
    dialogue_snippets: List[str] = Field(default_factory=list)
    
    # Game specific
    objectives: List[str] = Field(default_factory=list)
    challenges: List[str] = Field(default_factory=list)
    rewards: List[str] = Field(default_factory=list)


class GameObjective(BaseModel):
    """Represents a game objective/quest."""
    id: str
    title: str
    description: str
    type: str  # collect, interact, solve, explore, etc.
    target: str  # what needs to be done
    location: str
    characters_involved: List[str] = Field(default_factory=list)
    prerequisites: List[str] = Field(default_factory=list)
    rewards: List[str] = Field(default_factory=list)
    hint: str = ""


class Puzzle(BaseModel):
    """Represents a puzzle or challenge."""
    id: str
    title: str
    description: str
    puzzle_type: str  # riddle, logic, physical, etc.
    difficulty: int = Field(ge=1, le=10)
    solution: str
    hints: List[str] = Field(default_factory=list)
    location: str
    related_story_element: str


class InteractiveObject(BaseModel):
    """Objects that can be interacted with in AR/game."""
    id: str
    name: str
    description: str
    location: str
    interaction_type: str  # touch, voice, gesture, etc.
    triggers: List[str] = Field(default_factory=list)
    responses: List[str] = Field(default_factory=list)
    
    # Unity specific
    prefab_name: str = ""
    scale: Dict[str, float] = Field(default_factory=lambda: {"x": 1.0, "y": 1.0, "z": 1.0})
    position_hints: Dict[str, Any] = Field(default_factory=dict)


class BookAnalysis(BaseModel):
    """Complete analysis of a book."""
    title: str
    author: str = ""
    genre: str = ""
    summary: str
    themes: List[str] = Field(default_factory=list)
    
    characters: List[Character]
    locations: List[Location]
    scenes: List[Scene]
    
    # Extracted narrative elements
    plot_points: List[str] = Field(default_factory=list)
    conflicts: List[str] = Field(default_factory=list)
    resolutions: List[str] = Field(default_factory=list)


class GameConfiguration(BaseModel):
    """Configuration for the generated game."""
    game_type: GameType
    difficulty_level: int = Field(ge=1, le=10, default=5)
    target_age_group: str = "13+"
    estimated_play_time: int = 60  # minutes
    
    objectives: List[GameObjective]
    puzzles: List[Puzzle]
    interactive_objects: List[InteractiveObject]
    
    # Progression system
    levels: List[Dict[str, Any]] = Field(default_factory=list)
    achievements: List[Dict[str, str]] = Field(default_factory=list)


class ARConfiguration(BaseModel):
    """Configuration for AR experience."""
    ar_type: ARExperienceType
    tracking_requirements: List[str] = Field(default_factory=list)
    device_requirements: Dict[str, Any] = Field(default_factory=dict)
    
    # AR-specific content
    ar_scenes: List[Dict[str, Any]] = Field(default_factory=list)
    marker_images: List[str] = Field(default_factory=list)
    spatial_anchors: List[Dict[str, Any]] = Field(default_factory=list)


class UnityExport(BaseModel):
    """Complete Unity-ready export."""
    project_name: str
    book_analysis: BookAnalysis
    game_config: GameConfiguration
    ar_config: Optional[ARConfiguration] = None
    
    # Unity specific files structure
    scenes_config: Dict[str, Any] = Field(default_factory=dict)
    prefabs_config: Dict[str, Any] = Field(default_factory=dict)
    scripts_suggestions: List[str] = Field(default_factory=list)
    asset_requirements: List[str] = Field(default_factory=list)


# Request/Response models for API
class BookInput(BaseModel):
    """Input for book analysis."""
    text: str
    title: Optional[str] = None
    author: Optional[str] = None
    
    
class GameGenerationRequest(BaseModel):
    """Request for game generation."""
    book_analysis: BookAnalysis
    game_type: GameType
    ar_experience: bool = False
    ar_type: Optional[ARExperienceType] = None
    difficulty_level: int = Field(ge=1, le=10, default=5)
    target_age_group: str = "13+"


class GameGenerationResponse(BaseModel):
    """Response with generated game."""
    game_config: GameConfiguration
    ar_config: Optional[ARConfiguration] = None
    unity_export: UnityExport


class AnalysisResponse(BaseModel):
    """Response with book analysis."""
    analysis: BookAnalysis
    processing_time: float
    word_count: int
    scene_count: int
