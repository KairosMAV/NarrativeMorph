#!/usr/bin/env python3
"""
Test script per verificare il Book-to-Game system con API reali di OpenAI
"""
import requests
import json
import time
import os
from datetime import datetime

API_BASE_URL = "http://localhost:8000"

def check_api_key_configured():
    """Verifica se la chiave API è configurata"""
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("OPENAI_API_KEY")
    mock_enabled = os.getenv("ENABLE_MOCK_RESPONSES", "true").lower() == "true"
    
    print("🔑 Configurazione API:")
    print(f"   API Key: {'✅ Configurata' if api_key and api_key != 'your-api-key-here' else '❌ Non configurata'}")
    print(f"   Mock Mode: {'❌ Disabilitato' if not mock_enabled else '⚠️ Ancora abilitato'}")
    print(f"   Model: {os.getenv('OPENAI_MODEL', 'gpt-4-turbo-preview')}")
    
    if not api_key or api_key == "your-api-key-here":
        print("\n⚠️ ATTENZIONE: Devi configurare una chiave API reale!")
        print("1. Vai su https://platform.openai.com")
        print("2. Crea una chiave API")
        print("3. Sostituisci 'your-api-key-here' nel file .env")
        return False
    
    if mock_enabled:
        print("\n⚠️ ATTENZIONE: Mock mode ancora abilitato!")
        print("Imposta ENABLE_MOCK_RESPONSES=false nel file .env")
        return False
    
    return True

def test_health_endpoint():
    """Test dell'endpoint di health"""
    print("\n📊 Test Health Endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed")
            print(f"   Status: {data['status']}")
            print(f"   Agents: {data['agents_available']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_real_api_transformation():
    """Test della trasformazione con API reali"""
    print("\n🚀 Test Trasformazione con API Reali...")
    
    # Usa una scena più semplice per il test iniziale
    test_scene = {
        "scenes": [
            {
                "scene_number": 1,
                "title": "Test Scene",
                "content": "Un breve test per verificare la trasformazione con API reali. Un personaggio cammina in un giardino e riflette sulla vita.",
                "characters": ["Protagonista"],
                "setting": "Un giardino tranquillo al tramonto",
                "key_events": ["Passeggiata riflessiva"],
                "educational_content": "Analisi della caratterizzazione",
                "themes": ["Riflessione", "Natura"],
                "mood_vibe": "Tranquillo, contemplativo",
                "elementi_narrativi": "Fiori, tramonto, panchina"
            }
        ],
        "project_config": {
            "target_platforms": ["mobile"],
            "educational_standards": ["Common Core Literature"],
            "target_age_groups": ["14-18"],
            "project_name": "TestAPIReali",            "ar_features_enabled": False,
            "minigames_enabled": True,
            "multiplayer_enabled": False
        }
    }
    
    try:
        print("📤 Invio richiesta di trasformazione...")
        start_time = time.time()
        
        response = requests.post(
            f"{API_BASE_URL}/transform/book-to-game",
            json=test_scene,
            timeout=120  # 2 minuti di timeout per API reali
        )
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Trasformazione completata in {processing_time:.1f} secondi")
            
            # Analizza i risultati
            print("\n📊 Risultati dell'analisi:")
            if 'unity_project_files' in result:
                files = result['unity_project_files']
                print(f"   📁 File generati: {len(files)}")
                
                # Conta i tipi di file
                file_types = {}
                for file_path in files.keys():
                    ext = file_path.split('.')[-1] if '.' in file_path else 'unknown'
                    file_types[ext] = file_types.get(ext, 0) + 1
                
                for ext, count in file_types.items():
                    print(f"   📄 {ext}: {count} files")
            
            # Verifica la qualità del contenuto generato
            print("\n🔍 Verifica qualità contenuto:")
            sample_file = None
            for file_path, content in result.get('unity_project_files', {}).items():
                if file_path.endswith('.cs'):
                    sample_file = file_path
                    print(f"   📝 Esempio file C#: {file_path}")
                    print(f"   📏 Lunghezza: {len(content)} caratteri")
                    
                    # Verifica se contiene codice reale (non mock)
                    if "Mock response" in content:
                        print("   ⚠️ Contiene ancora risposte mock!")
                        return False
                    else:
                        print("   ✅ Contiene codice C# reale generato da AI")
                    break
            
            return True
            
        else:
            print(f"❌ Trasformazione fallita: {response.status_code}")
            print(f"   Errore: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Timeout - le API reali richiedono più tempo")
        return False
    except Exception as e:
        print(f"❌ Errore: {e}")
        return False

def test_macbeth_with_real_apis():
    """Test completo di Macbeth con API reali"""
    print("\n🎭 Test Macbeth Completo con API Reali...")
    
    try:
        # Carica il contenuto di Macbeth
        with open("macbeth_demo.json", "r", encoding="utf-8") as f:
            macbeth_data = json.load(f)
        
        print(f"📚 Caricato Macbeth con {len(macbeth_data['scenes'])} scene")
        
        start_time = time.time()
        
        response = requests.post(
            f"{API_BASE_URL}/transform/book-to-game",
            json=macbeth_data,
            timeout=300  # 5 minuti per il test completo
        )
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Trasformazione Macbeth completata in {processing_time:.1f} secondi")
            
            # Salva il risultato
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"macbeth_real_api_result_{timestamp}.json"
            
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            
            print(f"💾 Risultato salvato in: {output_file}")
            
            # Statistiche finali
            stats = result.get('project_summary', {}).get('project_statistics', {})
            print(f"\n📊 Statistiche finali:")
            print(f"   🎬 Scene processate: {stats.get('total_scenes_processed', 0)}")
            print(f"   📁 File Unity generati: {stats.get('total_unity_files_generated', 0)}")
            print(f"   👥 Personaggi unici: {stats.get('unique_characters', 0)}")
            
            return True
            
        else:
            print(f"❌ Trasformazione Macbeth fallita: {response.status_code}")
            print(f"   Errore: {response.text}")
            return False
            
    except FileNotFoundError:
        print("❌ File macbeth_demo.json non trovato")
        return False
    except Exception as e:
        print(f"❌ Errore: {e}")
        return False

def main():
    """Esegue tutti i test con API reali"""
    print("🧪 TEST BOOK-TO-GAME CON API REALI")
    print("=" * 50)
    
    # 1. Verifica configurazione
    if not check_api_key_configured():
        print("\n❌ Configurazione non valida. Interrotto.")
        return False
    
    # 2. Test health
    if not test_health_endpoint():
        print("\n❌ Health check fallito. Verifica che il server sia avviato.")
        return False
    
    # 3. Test trasformazione semplice
    print("\n" + "="*50)
    if not test_real_api_transformation():
        print("\n❌ Test trasformazione semplice fallito.")
        return False
    
    # 4. Test Macbeth completo (opzionale)
    print("\n" + "="*50)
    user_input = input("Vuoi testare Macbeth completo? (richiede ~3-5 minuti) [y/N]: ")
    if user_input.lower() in ['y', 'yes', 'si', 's']:
        if not test_macbeth_with_real_apis():
            print("\n❌ Test Macbeth fallito.")
            return False
    
    print("\n" + "="*50)
    print("🎉 TUTTI I TEST COMPLETATI CON SUCCESSO!")
    print("Il sistema Book-to-Game funziona perfettamente con API reali!")
    
    return True

if __name__ == "__main__":
    main()
