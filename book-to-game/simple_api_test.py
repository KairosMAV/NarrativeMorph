"""
FastAPI application semplificata per test Book to Game service
"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI(
    title="Book to Game API",
    description="Transform literary content into interactive Unity games and AR experiences",
    version="1.0.0"
)

class SimpleSceneData(BaseModel):
    """Dati semplificati di una scena"""
    elementi_narrativi: str
    personaggi: str
    ambientazione: str
    mood_vibe: str
    azione_in_corso: str

class TransformRequest(BaseModel):
    """Request per trasformare un libro in gioco"""
    scenes: List[SimpleSceneData]
    project_name: str = "BookToGameProject"

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Book to Game API is running", 
        "version": "1.0.0",
        "status": "✅ Sistema pronto per trasformare l'output del text-chunker in progetti Unity!"
    }

@app.get("/health")
async def health_check():
    """Endpoint per il controllo dello stato del servizio"""
    return {
        "status": "healthy",
        "service": "book-to-game",
        "agents_available": [
            "unity_code_agent",
            "game_design_agent", 
            "asset_generation_agent",
            "quality_assurance_agent"
        ],
        "integration_status": "✅ Pronto per ricevere output del text-chunker"
    }

@app.post("/transform/book-to-game")
async def transform_book_to_game(request: TransformRequest):
    """
    Trasforma un libro (output del text-chunker) in un progetto Unity
    Questa è una demo - in produzione userebbe i veri agenti AI
    """
    try:
        # Simula la trasformazione con dati mock
        mock_unity_project = {
            "project_name": request.project_name,
            "total_scenes": len(request.scenes),
            "unity_project_files": {
                "Assets/Scripts/GameManager.cs": generate_game_manager_script(request.project_name),
                "Assets/Scripts/SceneManager.cs": "// Scene manager code...",
                "ProjectSettings/ProjectSettings.asset": "// Unity project settings..."
            },
            "project_summary": {
                "project_statistics": {
                    "total_scenes_processed": len(request.scenes),
                    "total_unity_files_generated": 25 + len(request.scenes) * 3,
                    "unique_characters": count_unique_characters(request.scenes),
                    "file_types_generated": {
                        "C# Scripts": 15 + len(request.scenes),
                        "Scene Files": len(request.scenes), 
                        "Prefabs": 8,
                        "Materials": 5,
                        "Audio": 3
                    }
                },
                "features_implemented": [
                    "Scene Manager per navigazione narrativa",
                    "Character Controller per personaggi principali", 
                    "AR Foundation per esperienze immersive",
                    "Minigame per decision-making",
                    "Sistema di progressione narrativa",
                    "Audio spaziale per atmosfere",
                    "UI accessibile"
                ],
                "scenes_analysis": [
                    {
                        "scene_index": i,
                        "mood": scene.mood_vibe,
                        "characters_detected": len(scene.personaggi.split(",")),
                        "narrative_elements": len(scene.elementi_narrativi.split(",")),
                        "generated_files": [
                            f"Assets/Scripts/Scenes/Scene_{i:02d}Controller.cs",
                            f"Assets/Scenes/Scene_{i:02d}.unity",
                            f"Assets/Prefabs/Characters/Scene_{i:02d}_Characters.prefab"
                        ]
                    }
                    for i, scene in enumerate(request.scenes)
                ]
            },
            "integration_info": {
                "text_chunker_compatibility": "✅ Compatible",
                "input_format": "Scenes with elementi_narrativi, personaggi, ambientazione, mood_vibe, azione_in_corso",
                "output_format": "Complete Unity project with C# scripts, scenes, and assets"
            }
        }
        
        return JSONResponse(content=mock_unity_project)
        
    except Exception as e:
        return JSONResponse(
            status_code=500, 
            content={"error": f"Transformation failed: {str(e)}"}
        )

def generate_game_manager_script(project_name: str) -> str:
    """Genera uno script GameManager per Unity"""
    return f"""using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Game Manager principale per {project_name}
/// Generato automaticamente dal sistema book-to-game
/// </summary>
public class GameManager : MonoBehaviour
{{
    [Header("Project Configuration")]
    public string projectName = "{project_name}";
    public bool arEnabled = true;
    public bool educationalMode = true;
    
    [Header("Scene Management")]
    public int currentSceneIndex = 0;
    public int totalScenes = 10;
    
    public static GameManager Instance {{ get; private set; }}
    
    void Awake()
    {{
        if (Instance == null)
        {{
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log($"GameManager inizializzato per {{projectName}}");
        }}
        else
        {{
            Destroy(gameObject);
        }}
    }}
    
    public void NextScene()
    {{
        if (currentSceneIndex < totalScenes - 1)
        {{
            currentSceneIndex++;
            LoadScene(currentSceneIndex);
        }}
    }}
    
    void LoadScene(int sceneIndex)
    {{
        SceneManager.LoadScene($"Scene_{{sceneIndex:D2}}");
    }}
}}"""

def count_unique_characters(scenes: List[SimpleSceneData]) -> int:
    """Conta i personaggi unici nelle scene"""
    all_characters = set()
    for scene in scenes:
        characters = [char.strip() for char in scene.personaggi.split(",")]
        all_characters.update(characters)
    return len(all_characters)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
