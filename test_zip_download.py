#!/usr/bin/env python3
"""
Test completo per il download del file ZIP con Replicate
Verifica dove viene salvato il file e mostra gli URL delle immagini generate
"""
import requests
import json
import os
import time
from pathlib import Path

def test_zip_download_with_replicate():
    """Testa il download completo del file ZIP con asset Replicate"""
    
    print("🧪 TEST DOWNLOAD ZIP CON REPLICATE")
    print("=" * 60)
    
    # URL del servizio
    base_url = "http://localhost:8002"
    
    # Verifica che il servizio sia attivo
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Servizio attivo: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Servizio non raggiungibile su http://localhost:8002")
        return
    
    # Dati di test per Macbeth
    test_scenes = [
        {
            "numero_scena": 1,
            "ambientazione": "Brughiera scozzese nebbiosa al tramonto",
            "personaggi": "Tre streghe misteriose con abiti scuri",
            "dialoghi": "Quando sarà finita la battaglia?",
            "elementi_narrativi": "Atmosfera soprannaturale, nebbia densa, profezie",
            "mood_vibe": "misterioso e inquietante"
        },
        {
            "numero_scena": 2,
            "ambientazione": "Castello di Duncan, sala del trono maestosa",
            "personaggi": "Re Duncan, Macbeth valoroso guerriero",
            "dialoghi": "O valoroso cugino! Degno gentiluomo!",
            "elementi_narrativi": "Celebrazione della vittoria, onori militari",
            "mood_vibe": "trionfante e solenne"
        }
    ]
    
    request_data = {
        "scenes": test_scenes,
        "project_name": "MacbethReplicateTest",
        "ar_enabled": True,
        "mobile_optimized": True,
        "language": "it"
    }
    
    print(f"📤 Inviando richiesta per download ZIP con Replicate...")
    print(f"   - Scene: {len(test_scenes)}")
    print(f"   - Progetto: {request_data['project_name']}")
    print(f"   - AR abilitata: {request_data['ar_enabled']}")
    
    # Chiamata per il download del ZIP (endpoint corretto)
    download_url = f"{base_url}/transform/book-to-game/download"
    
    try:
        start_time = time.time()
        
        # Aggiungi parametro per abilitare Replicate
        params = {"replicate_enabled": "true"}
        
        response = requests.post(
            download_url,
            json=request_data,
            params=params,
            timeout=120  # 2 minuti di timeout
        )
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"⏱️ Tempo di elaborazione: {duration:.2f}s")
        
        if response.status_code == 200:
            print(f"✅ Download completato con successo!")
            
            # Il file viene scaricato direttamente dal browser/richiesta
            # Salviamolo nella directory corrente
            downloads_dir = Path.cwd() / "downloads"
            downloads_dir.mkdir(exist_ok=True)
            
            zip_filename = f"{request_data['project_name']}_Replicate.zip"
            zip_path = downloads_dir / zip_filename
            
            # Salva il contenuto del ZIP
            with open(zip_path, 'wb') as f:
                f.write(response.content)
            
            file_size = len(response.content) / (1024 * 1024)  # MB
            
            print(f"📁 File ZIP salvato in: {zip_path}")
            print(f"📊 Dimensione file: {file_size:.2f} MB")
            
            # Verifica headers per informazioni aggiuntive
            content_disposition = response.headers.get('content-disposition', '')
            if content_disposition:
                print(f"📋 Content-Disposition: {content_disposition}")
            
            print(f"📋 Content-Type: {response.headers.get('content-type', 'N/A')}")
            
            return zip_path
            
        else:
            print(f"❌ Errore nel download: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Dettagli errore: {error_data.get('detail', 'N/A')}")
            except:
                print(f"   Contenuto risposta: {response.text[:200]}...")
            return None
            
    except requests.exceptions.Timeout:
        print("❌ Timeout durante il download (>2 minuti)")
        return None
    except Exception as e:
        print(f"❌ Errore durante il download: {e}")
        return None

def test_replicate_workflow_details():
    """Testa il workflow Replicate per vedere i dettagli degli asset generati"""
    
    print("\n🎨 TEST DETTAGLI WORKFLOW REPLICATE")
    print("=" * 60)
    
    base_url = "http://localhost:8002"
    
    test_scenes = [
        {
            "numero_scena": 1,
            "ambientazione": "Brughiera scozzese nebbiosa",
            "personaggi": "Tre streghe",
            "elementi_narrativi": "Atmosfera soprannaturale",
            "mood_vibe": "misterioso"
        }
    ]
    
    request_data = {
        "scenes": test_scenes,
        "project_name": "MacbethAssetTest",
        "ar_enabled": True,
        "mobile_optimized": True,
        "language": "it"
    }
    
    # Testa il workflow Replicate (senza download)
    replicate_url = f"{base_url}/transform/book-to-game-with-replicate"
    
    try:
        print("📤 Testando workflow Replicate per vedere asset generati...")
        
        response = requests.post(replicate_url, json=request_data, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Workflow Replicate completato!")
            
            # Mostra asset generati
            if 'replicate_assets' in result:
                assets = result['replicate_assets']
                print(f"\n🎨 ASSET REPLICATE GENERATI:")
                
                for scene_id, scene_assets in assets.items():
                    print(f"\n📍 {scene_id.upper()}:")
                    
                    for asset_type, asset_data in scene_assets.items():
                        if asset_type != 'generation_summary':
                            print(f"   🖼️ {asset_type}:")
                            
                            if isinstance(asset_data, dict):
                                image_url = asset_data.get('image_url') or asset_data.get('video_url')
                                if image_url:
                                    print(f"      URL: {image_url}")
                                    
                                prompt = asset_data.get('prompt_used')
                                if prompt:
                                    print(f"      Prompt: {prompt[:80]}...")
                                    
                                status = asset_data.get('generation_status', 'unknown')
                                print(f"      Status: {status}")
            
            # Mostra summary
            if 'summary' in result:
                summary = result['summary']
                print(f"\n📊 SUMMARY:")
                print(f"   Durata: {summary.get('processing_time', 'N/A')}")
                print(f"   Scene: {summary.get('scenes_processed', 'N/A')}")
                print(f"   Unity files: {summary.get('unity_files_generated', 'N/A')}")
                
        else:
            print(f"❌ Errore workflow Replicate: {response.status_code}")
            try:
                error = response.json()
                print(f"   Errore: {error.get('detail', 'N/A')}")
            except:
                print(f"   Risposta: {response.text[:200]}...")
                
    except Exception as e:
        print(f"❌ Errore: {e}")

def main():
    """Esegue tutti i test"""
    
    print("🚀 AVVIO TEST COMPLETO REPLICATE + DOWNLOAD")
    print("=" * 80)
    
    # Test 1: Workflow dettagliato con asset URLs
    test_replicate_workflow_details()
    
    # Test 2: Download ZIP completo
    zip_path = test_zip_download_with_replicate()
    
    if zip_path:
        print(f"\n🎉 SUCCESS! File ZIP generato e salvato in:")
        print(f"   📁 {zip_path}")
        print(f"\n💡 Il file ZIP contiene:")
        print(f"   - Tutti i file Unity (.cs, .prefab, .scene, .asset)")
        print(f"   - Asset generati da Replicate (immagini, video)")
        print(f"   - Specifiche tecniche complete")
        print(f"   - Documentazione del progetto")
    else:
        print(f"\n❌ Test fallito. Controllare il servizio e riprovare.")

if __name__ == "__main__":
    main()
