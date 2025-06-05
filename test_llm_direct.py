#!/usr/bin/env python3
"""
Test the text-chunker LLM functionality directly
"""
import asyncio
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
)

DEFAULT_MODEL = "google/gemini-2.5-flash-preview-05-20"

async def test_llm_direct():
    """Test the LLM directly to see if it's working"""
    
    test_text = """
    Once upon a time, in a magical forest, there lived a young girl named Luna. She had the power to speak with animals and could make flowers bloom with just a touch. One day, Luna discovered that the forest was in danger. An evil sorcerer had cast a dark spell, causing the trees to wither and the animals to fall silent.
    """
    
    initial_prompt = f"""
Sei un esperto analista letterario e un narratore visivo. Il tuo compito è dividere il seguente testo di narrativa in scene individuali.
Per ogni scena, immagina di scattare un'istantanea da utilizzare per un servizio di generazione di immagini.

Pertanto, per ogni scena, fornisci:
Una scomposizione dettagliata delle componenti visive e narrative della scena con le seguenti chiavi:
    *   `elementi_narrativi`: (stringa) Elementi narrativi chiave presenti (ad esempio, oggetti significativi, simboli).
    *   `personaggi`: (stringa) Personaggi coinvolti, dettagliando il loro aspetto, espressioni ed eventuali interazioni se descritte.
    *   `ambientazione`: (stringa) Descrizione dell'ambientazione, dell'atmosfera e dei dettagli ambientali.
    *   `mood_vibe`: (stringa) L'atmosfera emotiva e il tono della scena.
    *   `azione_in_corso`: (stringa) Azione o evento principale che si sta svolgendo.

Ti ricordo che:
    *   Il JSON deve essere un array con al massimo 10 scene (potresti averne meno).
    *   Ogni scena deve includere tutte e 5 le chiavi sopra citate.
    *   Il testo da dividere in scene è il seguente:

{test_text}

Rispondi SOLO con un array JSON. Ogni elemento dell'array deve avere tutti e 5 i campi specificati.
"""

    system_message = "Sei un analista letterario che trasforma il testo in descrizioni di scene strutturate per la generazione di immagini."
    
    print("🧪 Testing LLM API directly...")
    print(f"📝 Text length: {len(test_text)} characters")
    print(f"🤖 Model: {DEFAULT_MODEL}")
    print(f"🔑 API Key: {os.getenv('OPENAI_API_KEY')[:20]}...")
    print()
    
    try:
        print("📤 Sending request to LLM...")
        response = await asyncio.to_thread(
            client.chat.completions.create,
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": initial_prompt},
            ]
        )
        
        content = response.choices[0].message.content
        print(f"✅ LLM responded successfully!")
        print(f"📏 Response length: {len(content)} characters")
        print()
        print("📋 LLM Response:")
        print("-" * 50)
        print(content)
        print("-" * 50)
        
        # Try to parse as JSON
        try:
            # Look for JSON array in the response
            start_idx = content.find('[')
            end_idx = content.rfind(']') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_content = content[start_idx:end_idx]
                parsed = json.loads(json_content)
                print(f"\n✅ Successfully parsed JSON!")
                print(f"📊 Number of scenes: {len(parsed)}")
                
                for i, scene in enumerate(parsed[:2]):
                    print(f"\n🎬 Scene {i+1}:")
                    for key, value in scene.items():
                        print(f"   {key}: {value[:100]}..." if len(str(value)) > 100 else f"   {key}: {value}")
            else:
                print(f"\n❌ No JSON array found in response")
                
        except json.JSONDecodeError as e:
            print(f"\n❌ Failed to parse JSON: {e}")
            
    except Exception as e:
        print(f"❌ LLM request failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_llm_direct())
