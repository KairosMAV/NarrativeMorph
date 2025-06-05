#!/usr/bin/env python3
"""
Debug script to test text-chunker service in detail
"""
import requests
import json

def test_text_chunker_debug():
    url = "http://127.0.0.1:8001"
    
    # Test short story
    short_story = """
    Once upon a time, in a magical forest, there lived a young girl named Luna. She had the power to speak with animals and could make flowers bloom with just a touch. One day, Luna discovered that the forest was in danger. An evil sorcerer had cast a dark spell, causing the trees to wither and the animals to fall silent.
    
    Luna knew she had to act quickly. She journeyed to the heart of the forest where the ancient Oak Tree stood. The tree was dying, its leaves turning black with dark magic. Luna placed her hands on the bark and channeled all her power into healing the tree.
    
    As light flowed from her hands, the dark magic began to fade. The tree's leaves turned green again, and life returned to the forest. The animals rejoiced, and Luna became known as the Guardian of the Forest.
    """
    
    # Test longer story
    long_story = """
    In a distant realm where magic flows like rivers through the land, there lived a young apprentice wizard named Aria. Her mentor, the great wizard Eldron, had been teaching her the ancient arts for three years. But today was different—today, Eldron was nowhere to be found.
    
    Aria searched the tower from top to bottom. In Eldron's study, she found his journal open to a page about the "Shadow Prophecy." The entry spoke of a coming darkness that would consume all light unless stopped by one pure of heart. The final line made her blood run cold: "The time has come. I must face the Shadow Lord alone."
    
    Without hesitation, Aria gathered her supplies: her crystal staff, a pouch of healing herbs, and the Map of Whispered Paths that would lead her to the Shadow Realm. She knew the journey would be perilous, but she couldn't let her mentor face this evil alone.
    
    The path to the Shadow Realm twisted through the Whispering Woods, where trees spoke in riddles and the ground shifted beneath her feet. Strange creatures watched her from the shadows—some friendly, others decidedly not. At the border between worlds, a massive stone archway marked the entrance to the Shadow Realm.
    
    As Aria stepped through the archway, the world around her changed. The sky turned a deep purple, and the air itself seemed thick with malevolent energy. In the distance, she could see a dark fortress where flashes of magical combat lit up the windows. She had found where Eldron was making his stand.
    
    Racing toward the fortress, Aria encountered the Shadow Lord's minions—creatures made of living darkness that attacked with claws of pure shadow. Using her training, she fought them off with bursts of light magic, each spell draining her energy but clearing her path forward.
    
    Inside the fortress, she found Eldron locked in magical combat with the Shadow Lord, a being of immense power whose very presence seemed to drain the light from the room. Eldron was weakening, his spells growing dimmer with each passing moment.
    
    "Master!" Aria called out, raising her crystal staff. The Shadow Lord turned toward her, and she felt the weight of his ancient malice. But she also felt something else—the love and training Eldron had given her, the hope of everyone who depended on the light to survive.
    
    Together, master and apprentice combined their powers. Aria's pure heart amplified Eldron's wisdom, creating a brilliant beam of light that pierced through the Shadow Lord's defenses. With a final, earth-shaking scream, the darkness was banished.
    
    As they emerged from the crumbling fortress, Eldron smiled at his apprentice. "You have become a true wizard today, Aria. Not because of your power, but because of your courage and love." From that day forward, Aria was known throughout the realm as the Light Bringer, protector of all who dwelt in the magical lands.
    """
    
    print("🔍 DEBUGGING TEXT-CHUNKER SERVICE")
    print("=" * 50)
    
    # Test 1: Health check
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{url}/")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
        return
    
    # Test 2: Short story
    print("\n2. Testing with short story...")
    test_with_story(url, short_story, "short")
    
    # Test 3: Long story
    print("\n3. Testing with long story...")
    test_with_story(url, long_story, "long")
    
    # Test 4: Very simple text
    print("\n4. Testing with very simple text...")
    simple_text = "Once upon a time. There was a princess. She lived in a castle. The end."
    test_with_story(url, simple_text, "simple")

def test_with_story(url, story, story_type):
    """Test text-chunker with a specific story"""
    print(f"   📝 Story type: {story_type}")
    print(f"   📏 Length: {len(story)} characters")
    print(f"   📊 Word count: {len(story.split())} words")
    
    try:
        response = requests.post(
            f"{url}/split-scenes",
            json={"text": story},
            timeout=60
        )
        
        print(f"   🔄 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            scenes = result.get('scenes', [])
            print(f"   📊 Scenes generated: {len(scenes)}")
            
            if scenes:
                print("   📋 Scene details:")
                for i, scene in enumerate(scenes[:2]):  # Show first 2 scenes
                    print(f"      Scene {i+1}:")
                    print(f"        Elementi narrativi: {scene.get('elementi_narrativi', 'N/A')[:100]}...")
                    print(f"        Personaggi: {scene.get('personaggi', 'N/A')[:50]}...")
                    print(f"        Ambientazione: {scene.get('ambientazione', 'N/A')[:50]}...")
            else:
                print("   ⚠️ No scenes were generated")
        else:
            print(f"   ❌ Error: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")

if __name__ == "__main__":
    test_text_chunker_debug()
