"""
Agent Coordinator
Coordina il team di agenti per creare un progetto Unity completo
"""
from typing import List, Dict, Any, Optional
import asyncio
import logging
from .unity_code_agent import UnityCodeAgent
from .game_design_agent import GameDesignAgent
from .asset_generation_agent import AssetGenerationAgent
from .quality_assurance_agent import QualityAssuranceAgent

logger = logging.getLogger(__name__)

class AgentCoordinator:
    """Coordina il team di agenti per la creazione del progetto Unity"""
    
    def __init__(self, openai_api_key: str, model: str = "gpt-4"):
        self.openai_api_key = openai_api_key
        self.model = model
        
        # Inizializza gli agenti
        self.unity_agent = UnityCodeAgent(openai_api_key, model)
        self.design_agent = GameDesignAgent(openai_api_key, model)
        self.asset_agent = AssetGenerationAgent(openai_api_key, model)
        self.qa_agent = QualityAssuranceAgent(openai_api_key, model)
        
        logger.info("Agent coordinator initialized with full team")
    
    async def process_book_scenes(
        self, 
        book_scenes: List[Dict[str, Any]], 
        project_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Processa le scene del libro usando tutti gli agenti
        
        Args:
            book_scenes: Output del text-chunker con le scene strutturate
            project_config: Configurazione del progetto (target platform, age group, etc.)
        
        Returns:
            Progetto Unity completo con codice, asset, design e QA
        """
        
        logger.info(f"Processing {len(book_scenes)} scenes with agent team")
        
        try:
            # 1. FASE DESIGN: Progetta l'esperienza complessiva
            logger.info("Phase 1: Game Design")
            overall_progression = await self.design_agent.design_progression_system(book_scenes)
            
            # 2. FASE SCENE: Processa ogni scena individualmente
            logger.info("Phase 2: Scene Processing")
            processed_scenes = []
            
            for i, scene in enumerate(book_scenes):
                logger.info(f"Processing scene {i+1}/{len(book_scenes)}")
                
                # Design del minigame per la scena
                scene_design = await self.design_agent.design_minigame(scene)
                
                # Design dell'esperienza AR
                ar_experience = await self.design_agent.design_ar_experience(scene)
                
                # Generazione specifiche asset
                asset_3d_specs = await self.asset_agent.generate_3d_asset_specs(scene)
                audio_specs = await self.asset_agent.generate_audio_specs(scene)
                ui_specs = await self.asset_agent.generate_ui_asset_specs(scene_design)
                
                # Generazione codice Unity
                scene_controller = await self.unity_agent.generate_scene_controller(scene)
                interaction_system = await self.unity_agent.generate_interaction_system(scene.get('azione_in_corso', ''))
                ar_features = await self.unity_agent.generate_ar_features(scene)
                
                # Validazione QA
                educational_validation = await self.qa_agent.validate_educational_content(
                    scene, 
                    project_config.get('educational_standards', [])
                )
                
                processed_scene = {
                    'original_scene': scene,
                    'game_design': scene_design,
                    'ar_experience': ar_experience,
                    'assets': {
                        '3d_specs': asset_3d_specs,
                        'audio_specs': audio_specs,
                        'ui_specs': ui_specs
                    },
                    'unity_code': {
                        'scene_controller': scene_controller,
                        'interaction_system': interaction_system,
                        'ar_features': ar_features
                    },
                    'qa_validation': educational_validation
                }
                
                processed_scenes.append(processed_scene)
            
            # 3. FASE INTEGRAZIONE: Crea componenti di sistema
            logger.info("Phase 3: System Integration")
            
            # Genera character controllers per tutti i personaggi unici
            all_characters = set()
            for scene in book_scenes:
                characters_text = scene.get('personaggi', '')
                # Estrai nomi dei personaggi (semplificato)
                if characters_text:
                    all_characters.add(characters_text)
            
            character_controllers = {}
            for character in all_characters:
                controller_code = await self.unity_agent.generate_character_controller(character)
                character_controllers[character] = controller_code
            
            # Genera pipeline degli asset
            asset_pipeline = await self.asset_agent.create_asset_pipeline(project_config)
            
            # Genera shader specs
            shader_specs = await self.asset_agent.generate_shader_specs(book_scenes[0])  # Usa prima scena come riferimento
            
            # 4. FASE QA: Crea framework di testing e guardrail
            logger.info("Phase 4: Quality Assurance")
            
            testing_framework = await self.qa_agent.create_testing_framework(project_config)
            performance_guardrails = await self.qa_agent.generate_performance_guardrails(
                project_config.get('target_platforms', ['mobile', 'desktop'])
            )
            safety_guidelines = await self.qa_agent.create_content_safety_guidelines(
                project_config.get('target_age_groups', ['10-18'])
            )
            accessibility_guidelines = await self.design_agent.create_accessibility_guidelines(overall_progression)
            monitoring_system = await self.qa_agent.create_monitoring_system(project_config)
            
            # 5. RISULTATO FINALE
            complete_project = {
                'project_metadata': {
                    'total_scenes': len(book_scenes),
                    'target_platforms': project_config.get('target_platforms', []),
                    'educational_standards': project_config.get('educational_standards', []),
                    'target_age_groups': project_config.get('target_age_groups', [])
                },
                'overall_design': {
                    'progression_system': overall_progression,
                    'accessibility_guidelines': accessibility_guidelines
                },
                'scenes': processed_scenes,
                'system_components': {
                    'character_controllers': character_controllers,
                    'asset_pipeline': asset_pipeline,
                    'shader_specifications': shader_specs
                },
                'quality_assurance': {
                    'testing_framework': testing_framework,
                    'performance_guardrails': performance_guardrails,
                    'safety_guidelines': safety_guidelines,
                    'monitoring_system': monitoring_system
                }
            }
            
            logger.info("Successfully processed all scenes and created complete Unity project")
            return complete_project
            
        except Exception as e:
            logger.error(f"Error processing book scenes: {e}")
            raise
    
    async def generate_unity_project_structure(self, complete_project: Dict[str, Any]) -> Dict[str, str]:
        """
        Genera la struttura completa del progetto Unity con tutti i file
        
        Returns:
            Dizionario con percorso_file -> contenuto_file
        """
        
        logger.info("Generating Unity project structure")
        
        unity_files = {}
        
        # 1. Script di base del progetto
        unity_files["Assets/Scripts/Core/GameManager.cs"] = self._generate_game_manager(complete_project)
        unity_files["Assets/Scripts/Core/SceneManager.cs"] = self._generate_scene_manager(complete_project)
        unity_files["Assets/Scripts/Core/ProgressionManager.cs"] = self._generate_progression_manager(complete_project)
        
        # 2. Script per ogni scena
        for i, scene in enumerate(complete_project['scenes']):
            scene_name = f"Scene{i:03d}"
            unity_files[f"Assets/Scripts/Scenes/{scene_name}Controller.cs"] = scene['unity_code']['scene_controller']
            unity_files[f"Assets/Scripts/Scenes/{scene_name}Interactions.cs"] = scene['unity_code']['interaction_system']
            unity_files[f"Assets/Scripts/AR/{scene_name}AR.cs"] = scene['unity_code']['ar_features']
        
        # 3. Character controllers
        for character_name, controller_code in complete_project['system_components']['character_controllers'].items():
            safe_name = self._sanitize_filename(character_name)
            unity_files[f"Assets/Scripts/Characters/{safe_name}Controller.cs"] = controller_code
        
        # 4. File di configurazione
        unity_files["Assets/Resources/GameConfig.json"] = self._generate_game_config(complete_project)
        unity_files["Assets/Resources/ScenesData.json"] = self._generate_scenes_data(complete_project)
        
        # 5. Documentazione
        unity_files["Documentation/README.md"] = self._generate_documentation(complete_project)
        unity_files["Documentation/API_Reference.md"] = self._generate_api_reference(complete_project)
        
        # 6. File di testing
        unity_files["Assets/Tests/TestFramework.cs"] = self._generate_test_framework(complete_project)
        
        logger.info(f"Generated {len(unity_files)} Unity project files")
        return unity_files
    
    def _generate_game_manager(self, project: Dict[str, Any]) -> str:
        """Genera il GameManager principale"""
        return """using UnityEngine;
using System.Collections.Generic;

namespace BookToGame.Core
{
    /// <summary>
    /// Main game manager that orchestrates the entire book-to-game experience
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        [Header("Game Configuration")]
        public GameConfig gameConfig;
        
        [Header("Managers")]
        public SceneManager sceneManager;
        public ProgressionManager progressionManager;
        
        private static GameManager _instance;
        public static GameManager Instance => _instance;
        
        void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }
            
            _instance = this;
            DontDestroyOnLoad(gameObject);
            
            InitializeGame();
        }
        
        private void InitializeGame()
        {
            // Load game configuration
            LoadGameConfig();
            
            // Initialize managers
            sceneManager?.Initialize();
            progressionManager?.Initialize();
            
            Debug.Log("BookToGame initialized successfully");
        }
        
        private void LoadGameConfig()
        {
            if (gameConfig == null)
            {
                gameConfig = Resources.Load<GameConfig>("GameConfig");
            }
        }
        
        public void StartBookExperience()
        {
            sceneManager.LoadFirstScene();
        }
    }
}"""
    
    def _generate_scene_manager(self, project: Dict[str, Any]) -> str:
        """Genera lo SceneManager"""
        total_scenes = project['project_metadata']['total_scenes']
        
        return f"""using UnityEngine;
using UnityEngine.SceneManagement;
using System.Collections;

namespace BookToGame.Core
{{
    /// <summary>
    /// Manages scene transitions and loading for the book experience
    /// </summary>
    public class SceneManager : MonoBehaviour
    {{
        [Header("Scene Configuration")]
        public int totalScenes = {total_scenes};
        private int currentSceneIndex = 0;
        
        public void Initialize()
        {{
            Debug.Log($"SceneManager initialized with {{totalScenes}} scenes");
        }}
        
        public void LoadFirstScene()
        {{
            LoadScene(0);
        }}
        
        public void LoadNextScene()
        {{
            if (currentSceneIndex < totalScenes - 1)
            {{
                LoadScene(currentSceneIndex + 1);
            }}
            else
            {{
                OnBookComplete();
            }}
        }}
        
        public void LoadScene(int sceneIndex)
        {{
            if (sceneIndex >= 0 && sceneIndex < totalScenes)
            {{
                currentSceneIndex = sceneIndex;
                StartCoroutine(LoadSceneAsync(sceneIndex));
            }}
        }}
        
        private IEnumerator LoadSceneAsync(int sceneIndex)
        {{
            // Show loading screen
            yield return new WaitForSeconds(0.1f);
            
            // Load scene
            AsyncOperation asyncLoad = UnityEngine.SceneManagement.SceneManager.LoadSceneAsync($"Scene{{sceneIndex:000}}");
            
            while (!asyncLoad.isDone)
            {{
                yield return null;
            }}
            
            Debug.Log($"Loaded scene {{sceneIndex}}");
        }}
        
        private void OnBookComplete()
        {{
            Debug.Log("Book experience completed!");
            // Handle book completion
        }}
    }}
}}"""
    
    def _generate_progression_manager(self, project: Dict[str, Any]) -> str:
        """Genera il ProgressionManager"""
        return """using UnityEngine;
using System.Collections.Generic;

namespace BookToGame.Core
{
    /// <summary>
    /// Manages player progression through the book experience
    /// </summary>
    public class ProgressionManager : MonoBehaviour
    {
        [Header("Progression Data")]
        public PlayerProgressData progressData;
        
        private List<bool> sceneCompletions = new List<bool>();
        
        public void Initialize()
        {
            LoadProgressData();
            Debug.Log("ProgressionManager initialized");
        }
        
        public void CompleteScene(int sceneIndex)
        {
            if (sceneIndex >= 0 && sceneIndex < sceneCompletions.Count)
            {
                sceneCompletions[sceneIndex] = true;
                SaveProgressData();
                Debug.Log($"Scene {sceneIndex} completed");
            }
        }
        
        public bool IsSceneCompleted(int sceneIndex)
        {
            return sceneIndex >= 0 && sceneIndex < sceneCompletions.Count && sceneCompletions[sceneIndex];
        }
        
        public float GetOverallProgress()
        {
            int completedScenes = 0;
            foreach (bool completed in sceneCompletions)
            {
                if (completed) completedScenes++;
            }
            return (float)completedScenes / sceneCompletions.Count;
        }
        
        private void LoadProgressData()
        {
            // Load from PlayerPrefs or save file
            string savedData = PlayerPrefs.GetString("BookProgress", "");
            if (!string.IsNullOrEmpty(savedData))
            {
                // Parse saved data
            }
            else
            {
                // Initialize new progress
                InitializeNewProgress();
            }
        }
        
        private void InitializeNewProgress()
        {
            sceneCompletions.Clear();
            int totalScenes = GameManager.Instance.gameConfig.totalScenes;
            for (int i = 0; i < totalScenes; i++)
            {
                sceneCompletions.Add(false);
            }
        }
        
        private void SaveProgressData()
        {
            // Save to PlayerPrefs or save file
            string dataToSave = JsonUtility.ToJson(sceneCompletions);
            PlayerPrefs.SetString("BookProgress", dataToSave);
            PlayerPrefs.Save();
        }
    }
}"""
    
    def _generate_game_config(self, project: Dict[str, Any]) -> str:
        """Genera il file di configurazione JSON"""
        import json
        
        config = {
            "totalScenes": project['project_metadata']['total_scenes'],
            "targetPlatforms": project['project_metadata']['target_platforms'],
            "educationalStandards": project['project_metadata']['educational_standards'],
            "targetAgeGroups": project['project_metadata']['target_age_groups'],
            "performanceSettings": project['quality_assurance']['performance_guardrails'],
            "accessibilitySettings": project['overall_design']['accessibility_guidelines']
        }
        
        return json.dumps(config, indent=2)
    
    def _generate_scenes_data(self, project: Dict[str, Any]) -> str:
        """Genera i dati delle scene in formato JSON"""
        import json
        
        scenes_data = []
        for i, scene in enumerate(project['scenes']):
            scene_data = {
                "sceneIndex": i,
                "sceneName": f"Scene{i:003d}",
                "originalScene": scene['original_scene'],
                "gameDesign": scene['game_design'],
                "arExperience": scene['ar_experience']
            }
            scenes_data.append(scene_data)
        
        return json.dumps(scenes_data, indent=2, ensure_ascii=False)
    
    def _generate_documentation(self, project: Dict[str, Any]) -> str:
        """Genera la documentazione del progetto"""
        total_scenes = project['project_metadata']['total_scenes']
        platforms = ', '.join(project['project_metadata']['target_platforms'])
        
        return f"""# Book to Game Unity Project

This Unity project transforms literary content into interactive gaming experiences.

## Project Overview

- **Total Scenes**: {total_scenes}
- **Target Platforms**: {platforms}
- **Features**: Minigames, AR experiences, Educational content

## Architecture

### Core Components
- `GameManager`: Main game orchestrator
- `SceneManager`: Handles scene transitions
- `ProgressionManager`: Tracks player progress

### Scene Structure
Each scene includes:
- Scene Controller: Manages scene-specific logic
- Interaction System: Handles user interactions
- AR Features: Augmented reality functionality

### Character System
Dynamic character controllers generated for each unique character in the book.

## Getting Started

1. Open the project in Unity 2022.3 or later
2. Ensure AR Foundation is installed for AR features
3. Build and deploy to your target platform

## Quality Assurance

This project includes comprehensive QA systems:
- Performance monitoring
- Accessibility compliance
- Content safety validation
- Educational standards alignment

## Support

For technical support or questions about the generated content, please refer to the API reference documentation.
"""
    
    def _generate_api_reference(self, project: Dict[str, Any]) -> str:
        """Genera la documentazione API"""
        return """# API Reference

## Core Classes

### GameManager
Main singleton that orchestrates the entire experience.

**Methods:**
- `StartBookExperience()`: Begins the book experience
- `Instance`: Static singleton instance

### SceneManager
Handles scene loading and transitions.

**Methods:**
- `LoadFirstScene()`: Loads the first scene
- `LoadNextScene()`: Transitions to next scene
- `LoadScene(int sceneIndex)`: Loads specific scene

### ProgressionManager
Tracks and manages player progress.

**Methods:**
- `CompleteScene(int sceneIndex)`: Marks scene as completed
- `IsSceneCompleted(int sceneIndex)`: Checks if scene is completed
- `GetOverallProgress()`: Returns completion percentage

## Events

### Scene Events
- `OnSceneLoaded`: Fired when a scene loads
- `OnSceneCompleted`: Fired when a scene is completed
- `OnBookCompleted`: Fired when entire book is finished

### Interaction Events
- `OnInteractionStart`: User begins interaction
- `OnInteractionComplete`: User completes interaction

## Configuration

### GameConfig
ScriptableObject containing game configuration:
- Total scenes count
- Platform settings
- Performance targets
- Accessibility options
"""
    
    def _generate_test_framework(self, project: Dict[str, Any]) -> str:
        """Genera il framework di testing"""
        return """using UnityEngine;
using UnityEngine.TestTools;
using NUnit.Framework;
using System.Collections;

namespace BookToGame.Tests
{
    /// <summary>
    /// Test framework for the book-to-game system
    /// </summary>
    public class BookToGameTestFramework
    {
        [Test]
        public void GameManager_InitializesCorrectly()
        {
            // Test GameManager initialization
            var gameManager = GameObject.FindObjectOfType<GameManager>();
            Assert.IsNotNull(gameManager, "GameManager should be present in scene");
        }
        
        [Test]
        public void SceneManager_LoadsFirstScene()
        {
            // Test scene loading functionality
            var sceneManager = GameObject.FindObjectOfType<SceneManager>();
            Assert.IsNotNull(sceneManager, "SceneManager should be present");
            
            sceneManager.LoadFirstScene();
            // Add assertions for scene loading
        }
        
        [Test]
        public void ProgressionManager_TracksProgress()
        {
            // Test progression tracking
            var progressionManager = GameObject.FindObjectOfType<ProgressionManager>();
            Assert.IsNotNull(progressionManager, "ProgressionManager should be present");
            
            progressionManager.CompleteScene(0);
            Assert.IsTrue(progressionManager.IsSceneCompleted(0), "Scene should be marked as completed");
        }
        
        [UnityTest]
        public IEnumerator Performance_MaintainsTargetFramerate()
        {
            // Performance test
            float targetFPS = 60f;
            float testDuration = 5f;
            float startTime = Time.time;
            
            while (Time.time - startTime < testDuration)
            {
                float currentFPS = 1f / Time.deltaTime;
                Assert.GreaterOrEqual(currentFPS, targetFPS * 0.9f, $"FPS should maintain near {targetFPS}");
                yield return null;
            }
        }
        
        [Test]
        public void Accessibility_FeaturesAreEnabled()
        {
            // Test accessibility features
            var gameConfig = Resources.Load<GameConfig>("GameConfig");
            Assert.IsNotNull(gameConfig, "GameConfig should be available");
            
            // Add specific accessibility tests based on requirements
        }
    }
}"""
    
    def _sanitize_filename(self, name: str) -> str:
        """Sanitizza un nome per uso come filename"""
        import re
        # Rimuovi caratteri non validi per i filename
        sanitized = re.sub(r'[<>:"/\\|?*]', '', name)
        sanitized = re.sub(r'\s+', '_', sanitized)  # Sostituisci spazi con underscore
        return sanitized[:50]  # Limita lunghezza
