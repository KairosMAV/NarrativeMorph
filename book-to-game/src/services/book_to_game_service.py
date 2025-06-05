"""
Main service that integrates with text-chunker output and coordinates agents
"""
from typing import List, Dict, Any, Optional
import asyncio
import logging
from ..agents.agent_coordinator import AgentCoordinator
from ..api.constants import (
    COMMON_CORE, CSTA_STANDARDS, 
    DEFAULT_EDUCATIONAL_STANDARDS, DEFAULT_TARGET_PLATFORMS, 
    DEFAULT_AGE_GROUP
)

logger = logging.getLogger(__name__)

class BookToGameService:
    """Servizio principale che trasforma l'output del text-chunker in progetti Unity"""
    
    def __init__(self, openai_api_key: str, model: str = "gpt-4"):
        self.coordinator = AgentCoordinator(openai_api_key, model)
        logger.info("BookToGameService initialized")
    
    async def transform_book_to_game(
        self, 
        text_chunker_output: List[Dict[str, Any]], 
        project_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Trasforma l'output del text-chunker in un progetto Unity completo
        
        Args:
            text_chunker_output: Lista di scene dal text-chunker
            project_config: Configurazione del progetto
        
        Returns:
            Progetto Unity completo con tutti i file generati
        """
          # Configurazione di default se non fornita
        if project_config is None:
            project_config = {
                'target_platforms': DEFAULT_TARGET_PLATFORMS,
                'educational_standards': [COMMON_CORE, CSTA_STANDARDS],
                'target_age_groups': DEFAULT_AGE_GROUP,
                'project_name': 'BookToGameProject',
                'ar_features_enabled': True,
                'minigames_enabled': True,
                'multiplayer_enabled': False
            }
        
        logger.info(f"Transforming book with {len(text_chunker_output)} scenes")
        
        try:
            # 1. Processa le scene con il team di agenti
            complete_project = await self.coordinator.process_book_scenes(
                text_chunker_output, 
                project_config
            )
            
            # 2. Genera la struttura del progetto Unity
            unity_files = await self.coordinator.generate_unity_project_structure(complete_project)
            
            # 3. Aggiungi i file Unity alla struttura completa
            complete_project['unity_project_files'] = unity_files
            
            # 4. Genera report di riepilogo
            summary_report = self._generate_summary_report(complete_project)
            complete_project['project_summary'] = summary_report
            
            logger.info("Successfully transformed book to Unity project")
            return complete_project
            
        except Exception as e:
            logger.error(f"Error transforming book to game: {e}")
            raise
    
    def _generate_summary_report(self, complete_project: Dict[str, Any]) -> Dict[str, Any]:
        """Genera un report di riepilogo del progetto generato"""
        
        total_scenes = len(complete_project['scenes'])
        total_files = len(complete_project['unity_project_files'])
        
        # Conta i diversi tipi di file generati
        file_types = {}
        for file_path in complete_project['unity_project_files'].keys():
            extension = file_path.split('.')[-1]
            file_types[extension] = file_types.get(extension, 0) + 1
        
        # Conta i personaggi unici
        character_count = len(complete_project['system_components']['character_controllers'])
        
        # Analizza le features generate
        features_enabled = []
        if any('ar_features' in scene['unity_code'] for scene in complete_project['scenes']):
            features_enabled.append('AR Experiences')
        if any('game_design' in scene for scene in complete_project['scenes']):
            features_enabled.append('Minigames')
        if 'accessibility_guidelines' in complete_project['overall_design']:
            features_enabled.append('Accessibility Features')
        
        summary = {
            'project_statistics': {
                'total_scenes_processed': total_scenes,
                'total_unity_files_generated': total_files,
                'unique_characters': character_count,
                'file_types_generated': file_types
            },
            'features_implemented': features_enabled,
            'platforms_supported': complete_project['project_metadata']['target_platforms'],
            'educational_compliance': complete_project['project_metadata']['educational_standards'],
            'quality_assurance': {
                'testing_framework_included': 'testing_framework' in complete_project['quality_assurance'],
                'performance_monitoring_enabled': 'monitoring_system' in complete_project['quality_assurance'],
                'safety_guidelines_implemented': 'safety_guidelines' in complete_project['quality_assurance']
            },
            'estimated_development_time': self._estimate_development_time(complete_project),
            'recommended_next_steps': [
                'Import generated scripts into Unity project',
                'Configure AR Foundation for AR features',
                'Implement asset generation pipeline',
                'Set up automated testing framework',                'Configure performance monitoring',
                'Test accessibility features',
                'Conduct educational content validation'
            ]
        }
        
        return summary
    
    async def transform_scenes_to_game(
        self, 
        scenes: List[Dict[str, Any]], 
        project_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Alias per transform_book_to_game per compatibilità con i test
        """
        return await self.transform_book_to_game(scenes, project_config)
    
    def _estimate_development_time(self, complete_project: Dict[str, Any]) -> Dict[str, str]:
        """Stima i tempi di sviluppo per le diverse fasi"""
        
        total_scenes = len(complete_project['scenes'])
        
        # Stime basate sulla complessità del progetto
        estimates = {
            'script_integration': f"{total_scenes * 2} hours",
            'asset_creation': f"{total_scenes * 4} hours", 
            'testing_and_qa': f"{total_scenes * 1} hours",
            'ar_implementation': "8-12 hours",
            'ui_ux_polish': "6-10 hours",
            'platform_optimization': "4-8 hours",
            'total_estimated': f"{total_scenes * 7 + 30} hours"
        }
        
        return estimates
    
    async def transform_book_to_game_with_replicate(
        self, 
        text_chunker_output: List[Dict[str, Any]], 
        project_config: Optional[Dict[str, Any]] = None,
        generate_visual_assets: bool = True
    ) -> Dict[str, Any]:
        """
        Trasforma l'output del text-chunker in un progetto Unity completo
        con asset visivi generati tramite Replicate API
        
        Args:
            text_chunker_output: Lista di scene dal text-chunker
            project_config: Configurazione del progetto
            generate_visual_assets: Se generare asset visivi con Replicate
        
        Returns:
            Progetto Unity completo con tutti i file generati e asset visivi
        """
        # Configurazione di default se non fornita
        if project_config is None:
            project_config = {
                'target_platforms': DEFAULT_TARGET_PLATFORMS,
                'educational_standards': [COMMON_CORE, CSTA_STANDARDS],
                'target_age_groups': DEFAULT_AGE_GROUP,
                'project_name': 'BookToGameProject',
                'ar_features_enabled': True,
                'minigames_enabled': True,
                'multiplayer_enabled': False
            }
        
        logger.info(f"Transforming book with {len(text_chunker_output)} scenes (Replicate enabled: {generate_visual_assets})")
        
        try:
            # 1. Processa le scene con il team di agenti (processo standard)
            complete_project = await self.coordinator.process_book_scenes(
                text_chunker_output, 
                project_config
            )
            
            # 2. Genera asset visivi con Replicate se richiesto
            if generate_visual_assets:
                logger.info("Generating visual assets using Replicate API...")
                visual_assets = await self._generate_visual_assets_for_scenes(text_chunker_output)
                complete_project['replicate_assets'] = visual_assets
                
                # Aggiorna le specifiche degli asset con quelli generati
                if 'asset_specifications' in complete_project:
                    complete_project['asset_specifications']['generated_visuals'] = visual_assets
            
            # 3. Genera la struttura del progetto Unity
            unity_files = await self.coordinator.generate_unity_project_structure(complete_project)
            
            # 4. Aggiungi i file Unity alla struttura completa
            complete_project['unity_project_files'] = unity_files
            
            # 5. Genera report di riepilogo (aggiornato con asset Replicate)
            summary_report = self._generate_summary_report_with_replicate(complete_project, generate_visual_assets)
            complete_project['project_summary'] = summary_report
            
            logger.info("Successfully transformed book to Unity project with Replicate integration")
            return complete_project
            
        except Exception as e:
            logger.error(f"Error transforming book to game with Replicate: {e}")
            raise
    
    async def _generate_visual_assets_for_scenes(self, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Genera asset visivi per tutte le scene usando Replicate
        Segue il pattern asincrono del text-chunker
        """
        logger.info(f"Generating visual assets for {len(scenes)} scenes")
        
        # Ottieni l'asset generation agent dal coordinator
        asset_agent = self.coordinator.asset_agent
        
        visual_assets = {
            "scenes": [],
            "characters": {},
            "environments": {},
            "generation_summary": {
                "total_scenes_processed": 0,
                "successful_generations": 0,
                "failed_generations": 0,
                "total_assets_generated": 0
            }
        }
        
        try:
            # Processa ogni scena in parallelo (pattern simile a text-chunker)
            scene_tasks = []
            for i, scene in enumerate(scenes):
                scene_id = f"scene_{i+1}"
                scene_copy = scene.copy()
                scene_copy['id'] = scene_id
                
                # Crea task per generazione asset della scena
                task = asset_agent.generate_visual_assets_with_replicate(scene_copy)
                scene_tasks.append((scene_id, task))
            
            # Esegui tutte le generazioni in parallelo
            results = []
            for scene_id, task in scene_tasks:
                try:
                    result = await task
                    results.append((scene_id, result, True))
                    visual_assets["generation_summary"]["successful_generations"] += 1
                except Exception as e:
                    logger.error(f"Error generating assets for {scene_id}: {e}")
                    results.append((scene_id, {"error": str(e)}, False))
                    visual_assets["generation_summary"]["failed_generations"] += 1
            
            # Organizza i risultati
            for scene_id, result, success in results:
                scene_asset_data = {
                    "scene_id": scene_id,
                    "assets": result,
                    "generation_successful": success
                }
                visual_assets["scenes"].append(scene_asset_data)
                
                if success and "generated_assets" in result:
                    gen_assets = result["generated_assets"]
                    if "generation_summary" in gen_assets:
                        visual_assets["generation_summary"]["total_assets_generated"] += gen_assets["generation_summary"].get("total_assets", 0)
            
            visual_assets["generation_summary"]["total_scenes_processed"] = len(scenes)
            
            logger.info(f"Visual asset generation completed: {visual_assets['generation_summary']['successful_generations']}/{len(scenes)} scenes successful")
            return visual_assets
            
        except Exception as e:
            logger.error(f"Error in visual asset generation workflow: {e}")
            visual_assets["error"] = str(e)
            return visual_assets
    
    def _generate_summary_report_with_replicate(self, complete_project: Dict[str, Any], replicate_enabled: bool) -> Dict[str, Any]:
        """Genera un report di riepilogo che include informazioni sui Replicate assets"""
        
        # Genera il report standard
        summary = self._generate_summary_report(complete_project)
        
        # Aggiungi informazioni specifiche per Replicate se abilitato
        if replicate_enabled and 'replicate_assets' in complete_project:
            replicate_assets = complete_project['replicate_assets']
            gen_summary = replicate_assets.get('generation_summary', {})
            
            summary['replicate_integration'] = {
                'visual_assets_generated': True,
                'scenes_processed': gen_summary.get('total_scenes_processed', 0),
                'successful_generations': gen_summary.get('successful_generations', 0),
                'failed_generations': gen_summary.get('failed_generations', 0),
                'total_visual_assets': gen_summary.get('total_assets_generated', 0),
                'success_rate': f"{(gen_summary.get('successful_generations', 0) / max(1, gen_summary.get('total_scenes_processed', 1))) * 100:.1f}%"
            }
            
            # Aggiorna le raccomandazioni
            summary['recommended_next_steps'].extend([
                'Import generated visual assets into Unity project',
                'Configure Replicate-generated images as textures',
                'Set up VideoPlayer components for generated videos',
                'Optimize visual assets for target platforms'
            ])
        else:
            summary['replicate_integration'] = {
                'visual_assets_generated': False,
                'note': 'Visual asset generation was disabled or failed'
            }
        
        return summary

# Esempio di utilizzo
async def example_usage():
    """Esempio di come usare il servizio"""
    
    # Simula l'output del text-chunker (come nell'esempio fornito)
    text_chunker_output = [
        {
            'elementi_narrativi': 'Tuoni e fulmini. Atmosfera tempestosa e tetra.',
            'personaggi': 'Tre streghe: la Prima, la Seconda e la Terza Strega.',
            'ambientazione': "Un luogo desolato e aperto, probabilmente una landa, battuto da tuoni, fulmini e pioggia.",
            'mood_vibe': 'Misterioso, sinistro, inquietante, premonitore.',
            'azione_in_corso': "Le tre streghe si riuniscono in un clima di tempesta e discutono quando si incontreranno di nuovo."
        }
        # ... altre scene dal text-chunker
    ]
      # Configurazione del progetto
    project_config = {
        'target_platforms': ['mobile', 'ar'],
        'educational_standards': [COMMON_CORE],
        'target_age_groups': ['14-18'],
        'project_name': 'MacbethInteractive',
        'ar_features_enabled': True,
        'minigames_enabled': True
    }
    
    # Inizializza il servizio
    service = BookToGameService(openai_api_key="your-api-key")
    
    # Trasforma il libro in gioco
    unity_project = await service.transform_book_to_game(
        text_chunker_output, 
        project_config
    )
    
    print("Progetto Unity generato con successo!")
    print(f"Scene processate: {unity_project['project_summary']['project_statistics']['total_scenes_processed']}")
    print(f"File Unity generati: {unity_project['project_summary']['project_statistics']['total_unity_files_generated']}")
    
    return unity_project
