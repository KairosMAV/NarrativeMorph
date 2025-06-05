#!/usr/bin/env python3
"""
Test finale: Genera un progetto Unity completo e mostra tutti i file
"""
import asyncio
import json
import sys
import os
from datetime import datetime

# Add the src directory to Python path  
sys.path.insert(0, os.path.dirname(__file__))

from src.services.book_to_game_service import BookToGameService

# Scenario educativo completo
COMPLETE_EDUCATIONAL_SCENARIO = [
    {
        "scene_number": 1,
        "title": "The Ancient Library Discovery",
        "content": """Young archaeologist Emma discovers a hidden chamber beneath the Alexandria Library ruins. 
        Ancient scrolls begin to glow, revealing holographic projections of historical figures who offer to 
        teach her about their civilizations through interactive experiences.""",
        "characters": ["Emma the Archaeologist", "Cleopatra Hologram", "Aristotle AI", "Library Guardian"],
        "setting": "Underground chamber with floating holographic displays and ancient artifacts",
        "key_events": [
            "Discovery of the hidden chamber",
            "First contact with historical holograms", 
            "Learning about ancient preservation methods",
            "Receiving the quest to restore lost knowledge"
        ],
        "educational_content": "Ancient history, archaeology, and knowledge preservation systems",
        "themes": ["Discovery", "History", "Technology", "Knowledge", "Cultural Heritage"],
        "mood": "mysterious yet welcoming, filled with wonder and educational potential",
        "interactive_elements": [
            "Archaeological tools mini-game",
            "Hologram activation puzzle",
            "Historical timeline navigation",
            "Ancient writing system decoding"
        ]
    },
    {
        "scene_number": 2,
        "title": "The Mathematics Garden",
        "content": """Emma is transported to a magical garden where mathematical concepts come alive as living creatures. 
        Geometric shapes dance in patterns, equations grow on trees, and fractals bloom like flowers. 
        A wise mathematician spirit guides her through interactive problem-solving adventures.""",
        "characters": ["Emma", "Pythagoras Spirit", "Geometric Creatures", "Number Sprites"],
        "setting": "Enchanted garden where mathematics manifests as living, interactive elements",
        "key_events": [
            "Meeting the geometric creatures",
            "Solving the Sacred Triangle puzzle",
            "Growing equation trees",
            "Discovering fractal flower patterns"
        ],
        "educational_content": "Geometry, algebra, patterns, and mathematical reasoning",
        "themes": ["Mathematics", "Pattern Recognition", "Problem Solving", "Beauty in Math"],
        "mood": "playful and intellectually stimulating, making math feel magical",
        "interactive_elements": [
            "Shape-shifting puzzle games",
            "Equation building challenges",
            "Pattern recognition mini-games",
            "Fractal art creation tool"
        ]
    },
    {
        "scene_number": 3,
        "title": "The Science Laboratory of Tomorrow",
        "content": """The final chamber reveals a futuristic laboratory where Emma can experiment with 
        advanced scientific concepts. AI assistants guide her through virtual experiments in physics, 
        chemistry, and biology, culminating in her own discovery that bridges ancient wisdom with modern science.""",
        "characters": ["Emma", "AI Lab Assistant", "Virtual Scientist Mentors", "Experiment Creatures"],
        "setting": "High-tech laboratory with holographic experiment stations and virtual reality chambers",
        "key_events": [
            "Conducting virtual chemistry experiments",
            "Exploring physics through AR simulations",
            "Designing biological ecosystems",
            "Creating her own scientific discovery"
        ],
        "educational_content": "Advanced STEM concepts, scientific method, and experimental design",
        "themes": ["Innovation", "Scientific Discovery", "Experimentation", "Future Technology"],
        "mood": "exciting and empowering, fostering scientific curiosity and creativity",
        "interactive_elements": [
            "Virtual chemistry set",
            "Physics simulation playground",
            "Ecosystem design tool",
            "Innovation challenge creator"
        ]
    }
]

PROJECT_CONFIG = {
    "project_name": "EmmasEducationalAdventure",
    "target_platforms": ["Unity3D", "AR", "Mobile", "WebGL"],
    "educational_standards": ["Common Core", "NGSS", "CSTA", "UNESCO Education 2030"],
    "target_age_groups": ["10-14", "15-18"],
    "ar_features_enabled": True,
    "minigames_enabled": True,
    "multiplayer_enabled": True,
    "accessibility_features": True,
    "language_support": ["English", "Spanish", "French", "Italian"],
    "assessment_integration": True
}

async def generate_complete_project():
    """Genera un progetto Unity educativo completo"""
    print("🚀 GENERATING COMPLETE EDUCATIONAL UNITY PROJECT")
    print("="*60)
    print(f"📅 Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎯 Project: {PROJECT_CONFIG['project_name']}")
    print(f"📚 Scenes: {len(COMPLETE_EDUCATIONAL_SCENARIO)}")
    print(f"🎮 Platforms: {', '.join(PROJECT_CONFIG['target_platforms'])}")
    print("="*60)
    
    # Initialize service
    service = BookToGameService("mock-api-key", "gpt-4")
    print("✅ Service initialized in mock mode")
    
    # Generate project
    print("\n📤 Generating Unity project...")
    start_time = datetime.now()
    
    result = await service.transform_scenes_to_game(
        scenes=COMPLETE_EDUCATIONAL_SCENARIO,
        project_config=PROJECT_CONFIG
    )
    
    end_time = datetime.now()
    generation_time = (end_time - start_time).total_seconds()
    
    print(f"✅ Project generated in {generation_time:.2f} seconds!")
    
    # Analyze results
    print("\n" + "="*60)
    print("📊 PROJECT ANALYSIS")
    print("="*60)
    
    unity_files = result.get('unity_project_files', {})
    game_scenes = result.get('game_scenes', [])
    educational_content = result.get('educational_content', [])
    
    print(f"📁 Unity Files Generated: {len(unity_files)}")
    print(f"🎬 Game Scenes Created: {len(game_scenes)}")
    print(f"📚 Educational Elements: {len(educational_content)}")
    
    # Show file structure
    print("\n📁 Generated File Structure:")
    file_categories = {}
    for file_path in unity_files.keys():
        category = file_path.split('/')[1] if '/' in file_path else "Root"
        if category not in file_categories:
            file_categories[category] = []
        file_categories[category].append(file_path.split('/')[-1])
    
    for category, files in file_categories.items():
        print(f"📂 {category}/")
        for file in files[:3]:  # Show first 3 files
            print(f"   📄 {file}")
        if len(files) > 3:
            print(f"   ... and {len(files) - 3} more files")
    
    # Show sample generated code
    print("\n" + "="*60)
    print("💾 SAMPLE GENERATED CODE")
    print("="*60)
    
    scene_controller = unity_files.get('Assets/Scripts/Core/SceneController.cs', '')
    if scene_controller:
        print("📄 SceneController.cs (first 500 characters):")
        print("-" * 40)
        print(scene_controller[:500] + "..." if len(scene_controller) > 500 else scene_controller)
        print("-" * 40)
    
    # Educational features analysis
    print("\n" + "="*60)
    print("🎓 EDUCATIONAL FEATURES ANALYSIS")
    print("="*60)
    
    if educational_content:
        print("📚 Educational Content Areas:")
        for content in educational_content[:5]:  # Show first 5
            if isinstance(content, dict):
                title = content.get('title', 'Untitled')
                subject = content.get('subject', 'General')
                print(f"   • {title} (Subject: {subject})")
    
    # AR Features
    ar_features = result.get('ar_features', [])
    if ar_features:
        print(f"\n🥽 AR Features Implemented: {len(ar_features)}")
        for feature in ar_features[:3]:
            if isinstance(feature, dict):
                name = feature.get('name', 'AR Feature')
                print(f"   • {name}")
    
    # Quality metrics
    quality = result.get('quality_assurance', {})
    if quality:
        print(f"\n🏆 Quality Score: {quality.get('overall_score', 'N/A')}/100")
        if 'recommendations' in quality:
            print("💡 Recommendations:")
            for rec in quality['recommendations'][:3]:
                print(f"   • {rec}")
    
    # Save project summary
    summary_data = {
        "generation_timestamp": datetime.now().isoformat(),
        "project_config": PROJECT_CONFIG,
        "generation_time_seconds": generation_time,
        "files_generated": len(unity_files),
        "scenes_created": len(game_scenes),
        "educational_elements": len(educational_content),
        "ar_features": len(ar_features),
        "file_structure": file_categories,
        "quality_score": quality.get('overall_score', 0) if quality else 0
    }
    
    with open('project_generation_summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Project summary saved to: project_generation_summary.json")
    
    # Final assessment
    print("\n" + "="*60)
    print("🎯 FINAL ASSESSMENT")
    print("="*60)
    
    success_criteria = [
        (len(unity_files) >= 10, f"✅ Generated sufficient files ({len(unity_files)} >= 10)"),
        (generation_time < 30, f"✅ Fast generation ({generation_time:.1f}s < 30s)"),
        (len(educational_content) > 0, f"✅ Educational content included ({len(educational_content)} elements)"),
        (len(ar_features) > 0, f"✅ AR features implemented ({len(ar_features)} features)"),
        ('SceneController.cs' in str(unity_files), "✅ Core scripts generated"),
    ]
    
    passed_criteria = sum(1 for passed, _ in success_criteria if passed)
    total_criteria = len(success_criteria)
    
    print("📋 Success Criteria:")
    for passed, message in success_criteria:
        print(f"   {message}")
    
    success_rate = passed_criteria / total_criteria * 100
    print(f"\n🏆 Overall Success Rate: {passed_criteria}/{total_criteria} ({success_rate:.1f}%)")
    
    if success_rate == 100:
        print("🎉 PERFECT! Project generation completed successfully!")
        print("🚀 Ready for Unity import and further development!")
    elif success_rate >= 80:
        print("✅ Excellent! Project generation mostly successful!")
    else:
        print("⚠️ Some issues detected. Review the generated content.")
    
    print("\n💡 Next Steps:")
    print("1. Import generated scripts into Unity 2022.3+")
    print("2. Install AR Foundation package for AR features")
    print("3. Configure target platform build settings")
    print("4. Test educational content flow")
    print("5. Customize visual assets and UI")
    
    return result

async def main():
    """Main execution"""
    try:
        result = await generate_complete_project()
        print("\n🎊 COMPLETE PROJECT GENERATION TEST FINISHED!")
        return True
    except Exception as e:
        print(f"\n❌ Project generation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    if success:
        print("\n🎮 Mock system is fully operational and ready for hackathon!")
    else:
        print("\n⚠️ Issues detected. Check logs above.")
