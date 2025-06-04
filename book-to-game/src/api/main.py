"""
FastAPI application for Book to Game service
"""
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager
import logging
import json
import tempfile
import zipfile
import os
from io import BytesIO
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from ..services.book_to_game_service import BookToGameService
from ..models.game_models import GameProject, SceneData
from .constants import (
    DEFAULT_EDUCATIONAL_STANDARDS, DEFAULT_TARGET_PLATFORMS, 
    DEFAULT_AGE_GROUP, DEFAULT_MODEL, COMMON_CORE, CSTA_STANDARDS, 
    NGSS_STANDARDS
)

logger = logging.getLogger(__name__)

# Global service instance
service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestisce il ciclo di vita dell'applicazione"""
    global service
    
    try:
        logger.info("🚀 Starting Book to Game API initialization...")
        
        # Get API key from environment
        api_key = os.getenv("OPENAI_API_KEY")
        model = os.getenv("OPENAI_MODEL", DEFAULT_MODEL)
        
        logger.info(f"🔑 API key status: {'Found' if api_key and api_key != 'your-api-key-here' else 'Not found or default'}")
        logger.info(f"🤖 Model: {model}")
        
        if not api_key or api_key == "your-api-key-here":
            logger.warning("⚠️ No valid OpenAI API key found. Service will use mock responses.")
            logger.warning("Set OPENAI_API_KEY environment variable for production use.")
            # Initialize with mock key for development
            service = BookToGameService("mock-api-key", model)
        else:
            logger.info("✅ OpenAI API key found. Initializing production service.")
            service = BookToGameService(api_key, model)
        
        logger.info(f"✅ Book to Game API started successfully with model: {model}")
        logger.info(f"🎯 Service type: {'Mock' if hasattr(service, 'coordinator') and service.coordinator.unity_agent.is_mock_mode else 'Production'}")
        
        # Application is ready
        yield
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize Book to Game API: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise
    finally:
        # Cleanup
        logger.info("📤 Shutting down Book to Game API...")

app = FastAPI(
    title="Book to Game API",
    description="Transform literary content into interactive Unity games and AR experiences",
    version="1.0.0",
    lifespan=lifespan
)

class ProjectConfig(BaseModel):
    """Configurazione del progetto"""
    target_platforms: List[str] = DEFAULT_TARGET_PLATFORMS
    educational_standards: List[str] = DEFAULT_EDUCATIONAL_STANDARDS
    target_age_groups: List[str] = DEFAULT_AGE_GROUP
    project_name: str = 'BookToGameProject'
    ar_features_enabled: bool = True
    minigames_enabled: bool = True
    multiplayer_enabled: bool = False

class TransformRequest(BaseModel):
    """Request per trasformare un libro in gioco"""
    scenes: List[Dict[str, Any]]
    project_config: Optional[ProjectConfig] = None

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Book to Game API is running", "version": "1.0.0"}

@app.post("/transform/book-to-game")
async def transform_book_to_game(request: TransformRequest):
    """
    Trasforma un libro (output del text-chunker) in un progetto Unity
    """
    try:
        logger.info(f"Received request to transform {len(request.scenes)} scenes")
        
        # Converti la configurazione in dizionario se fornita
        config_dict = None
        if request.project_config:
            config_dict = request.project_config.dict()
        
        # Trasforma il libro usando il servizio
        unity_project = await service.transform_book_to_game(
            request.scenes, 
            config_dict
        )
        
        logger.info("Successfully transformed book to Unity project")
        return JSONResponse(content=unity_project)
        
    except Exception as e:
        logger.error(f"Error transforming book: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transform/book-to-game/download")
async def transform_and_download(request: TransformRequest):
    """
    Trasforma un libro e restituisce un file ZIP con il progetto Unity
    """
    try:
        logger.info(f"Received download request for {len(request.scenes)} scenes")
        
        # Converti la configurazione in dizionario se fornita
        config_dict = None
        if request.project_config:
            config_dict = request.project_config.dict()
        
        # Trasforma il libro
        unity_project = await service.transform_book_to_game(
            request.scenes, 
            config_dict
        )
        
        # Crea un file ZIP con tutti i file del progetto
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            
            # Aggiungi tutti i file Unity
            for file_path, content in unity_project['unity_project_files'].items():
                zip_file.writestr(file_path, content)
            
            # Aggiungi il file di configurazione del progetto
            project_json = json.dumps(unity_project, indent=2, ensure_ascii=False)
            zip_file.writestr("project_data.json", project_json)
            
            # Aggiungi il report di riepilogo
            summary_json = json.dumps(unity_project['project_summary'], indent=2)
            zip_file.writestr("project_summary.json", summary_json)
        
        zip_buffer.seek(0)
        
        # Crea un file temporaneo per la risposta
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
        temp_file.write(zip_buffer.getvalue())
        temp_file.close()
        
        project_name = config_dict.get('project_name', 'BookToGameProject') if config_dict else 'BookToGameProject'
        
        logger.info("Created Unity project ZIP file")
        return FileResponse(
            temp_file.name,
            media_type='application/zip',
            filename=f"{project_name}.zip"
        )
        
    except Exception as e:
        logger.error(f"Error creating download: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/text-chunker-output")
async def upload_text_chunker_output(
    file: UploadFile = File(...),
    project_config: Optional[str] = None
):
    """
    Carica un file CSV/JSON dal text-chunker e trasforma in progetto Unity
    """
    try:
        logger.info(f"Received file upload: {file.filename}")
        
        # Leggi il contenuto del file
        content = await file.read()
        
        # Determina il formato del file e parsalo
        if file.filename.endswith('.csv'):
            scenes = _parse_csv_content(content.decode('utf-8'))
        elif file.filename.endswith('.json'):
            scenes = json.loads(content.decode('utf-8'))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or JSON")
        
        # Parsa la configurazione del progetto se fornita
        config_dict = None
        if project_config:
            config_dict = json.loads(project_config)
        
        # Trasforma in progetto Unity
        unity_project = await service.transform_book_to_game(scenes, config_dict)
        
        logger.info("Successfully processed uploaded file")
        return JSONResponse(content=unity_project)
        
    except Exception as e:
        logger.error(f"Error processing uploaded file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
        ]
    }

@app.get("/config/templates")
async def get_config_templates():
    """Restituisce template di configurazione predefiniti"""
    templates = {        "mobile_educational": {
            "target_platforms": ["mobile"],
            "educational_standards": [COMMON_CORE, CSTA_STANDARDS],
            "target_age_groups": ["10-14"],
            "ar_features_enabled": False,
            "minigames_enabled": True,
            "multiplayer_enabled": False
        },
        "ar_experience": {
            "target_platforms": ["mobile", "ar"],
            "educational_standards": [COMMON_CORE],
            "target_age_groups": ["13-18"],
            "ar_features_enabled": True,
            "minigames_enabled": True,
            "multiplayer_enabled": False
        },
        "desktop_advanced": {
            "target_platforms": ["desktop", "ar", "vr"],
            "educational_standards": [COMMON_CORE, NGSS_STANDARDS],
            "target_age_groups": ["16-adult"],
            "ar_features_enabled": True,
            "minigames_enabled": True,
            "multiplayer_enabled": True
        }
    }
    
    return templates

def _parse_csv_content(csv_content: str) -> List[Dict[str, Any]]:
    """
    Parsa il contenuto CSV dal text-chunker
    Gestisce il formato dell'esempio fornito
    """
    import ast
    
    try:
        # Il CSV contiene una lista Python serializzata
        # Rimuovi eventuali caratteri di escape e parsa
        csv_content = csv_content.strip()
        if csv_content.startswith('[') and csv_content.endswith(']'):
            # È una lista Python serializzata
            scenes_list = ast.literal_eval(csv_content)
            
            # Converti gli oggetti Scene in dizionari
            scenes = []
            for scene in scenes_list:
                if hasattr(scene, '_asdict'):  # Named tuple
                    scene_dict = scene._asdict()
                elif hasattr(scene, '__dict__'):  # Object with attributes
                    scene_dict = scene.__dict__
                else:
                    # Assumi che sia già un dizionario o prova a convertirlo
                    scene_dict = dict(scene) if hasattr(scene, 'keys') else scene
                
                scenes.append(scene_dict)
            
            return scenes
        else:
            raise ValueError("CSV format not recognized")
            
    except Exception as e:
        logger.error(f"Error parsing CSV content: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")

# Middleware per CORS (se necessario)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In produzione, specifica i domini allowed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
