# NarrativeMorph - Book to Interactive Game Platform

🚀 **Transform literary content into interactive Unity games and AR experiences powered by AI**

NarrativeMorph is an AI-powered platform that transforms books and stories into interactive Unity games with visual assets, AR features, and educational content.

## 🌟 Features

- **📚 Text-to-Game Transformation**: Convert any book or story into interactive Unity projects
- **🎨 AI Visual Asset Generation**: Automatic creation of images and videos using Replicate API
- **🔮 AR/VR Support**: Built-in AR Foundation integration for immersive experiences
- **🎓 Educational Focus**: Standards-compliant content for educational environments
- **📱 Multi-Platform**: Support for mobile, desktop, AR, and VR platforms
- **⚡ Fast Processing**: Optimized workflow with parallel processing
- **📦 Complete Downloads**: Get fully structured Unity projects as ZIP files

## 🏗️ Architecture

```
NarrativeMorph/
├── text-chunker/          # Text analysis and scene extraction service
├── book-to-game/          # Unity project generation service  
├── gateway-service/       # API gateway and orchestration
├── frontend/              # React-based web interface
└── Image_to_video/        # Visual asset generation pipeline
```

## 🔧 Prerequisites

- **Python 3.11+**
- **Node.js 18+** (for frontend)
- **API Keys**:
  - OpenAI API Key (for text processing)
  - Replicate API Token (for visual assets)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd NarrativeMorph
```

### 2. Setup Environment Variables

Create `.env` files in the required services:

#### Text-Chunker Service (text-chunker/.env)
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

#### Book-to-Game Service (book-to-game/.env)
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
REPLICATE_API_TOKEN=your_replicate_token_here
```

### 3. Install Dependencies

#### Text-Chunker Service
```bash
cd text-chunker
pip install -r requirements.txt
```

#### Book-to-Game Service
```bash
cd book-to-game
pip install -e .
```

#### Frontend (Optional)
```bash
cd frontend
npm install
```

### 4. Start Services

#### Option A: Start Individual Services

**Terminal 1 - Text-Chunker Service:**
```bash
cd text-chunker
python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Book-to-Game Service:**
```bash
cd book-to-game
python start_server.py
```

**Terminal 3 - Frontend (Optional):**
```bash
cd frontend
npm start
```

#### Option B: Docker Compose (Recommended)

```bash
docker-compose up -d
```

### 5. Verify Installation

Check that services are running:

- **Text-Chunker**: http://localhost:8000/health
- **Book-to-Game**: http://localhost:8002/health
- **Frontend**: http://localhost:3000 (if running)

## 📋 API Usage

### Basic Workflow

1. **Process Text** → Extract scenes from book content
2. **Generate Game** → Transform scenes into Unity project
3. **Download ZIP** → Get complete Unity project files

### Example: Complete Book-to-Game Transformation

```python
import requests
import json

# 1. Process book text
text_data = {
    "text": "Your book content here...",
    "chunk_size": 1000,
    "overlap": 200
}

response = requests.post(
    "http://localhost:8000/process", 
    json=text_data
)
scenes = response.json()["scenes"]

# 2. Transform to Unity project with Replicate assets
game_config = {
    "scenes": scenes,
    "project_config": {
        "project_name": "MyBookGame",
        "target_platforms": ["mobile", "ar"],
        "ar_features_enabled": True,
        "minigames_enabled": True
    }
}

response = requests.post(
    "http://localhost:8002/transform/book-to-game-with-replicate",
    json=game_config
)

# 3. Download ZIP file
response = requests.post(
    "http://localhost:8002/transform/book-to-game/download",
    json=game_config
)

with open("MyBookGame.zip", "wb") as f:
    f.write(response.content)
```

## 🎯 API Endpoints

### Text-Chunker Service (Port 8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/process` | POST | Extract scenes from text |
| `/health` | GET | Service health check |
| `/chunk` | POST | Advanced text chunking |

### Book-to-Game Service (Port 8002)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/transform/book-to-game` | POST | Basic Unity project generation |
| `/transform/book-to-game-with-replicate` | POST | **Unity + AI visual assets** |
| `/transform/book-to-game/download` | POST | **Download complete ZIP** |
| `/upload/text-chunker-output` | POST | Upload processed scenes |
| `/health` | GET | Service health check |
| `/config/templates` | GET | Project configuration templates |

## 🔑 API Keys Setup

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add to `.env` files as `OPENAI_API_KEY`

### Replicate API Token

1. Go to [Replicate](https://replicate.com/)
2. Sign up and get your API token
3. Add to `book-to-game/.env` as `REPLICATE_API_TOKEN`

## 🎨 Visual Asset Generation

The Replicate integration generates:

- **Environment Images**: Scene backgrounds and settings
- **Character Images**: Character portraits and designs
- **Narrative Scene Images**: Key story moments
- **Videos**: Environmental and character animations

Models used:
- **FLUX.1-dev**: High-quality image generation
- **Stable Video Diffusion**: Image-to-video conversion
- **LLaVA**: Image analysis and description

## 📦 Project Output

Generated Unity projects include:

```
Unity Project/
├── Assets/
│   ├── Scripts/           # C# game logic
│   ├── Scenes/           # Unity scene files
│   └── Resources/        # Visual assets
├── Documentation/
│   ├── README.md         # Project documentation
│   └── API_Reference.md  # Code documentation
├── project_data.json     # Complete project metadata
└── project_summary.json  # Generation statistics
```

## 🎯 Project Configuration

### Available Templates

- **Mobile Educational**: Optimized for mobile devices and learning
- **AR Experience**: Full AR/VR capabilities
- **Desktop Advanced**: High-end desktop features

### Custom Configuration

```json
{
  "project_name": "MyGame",
  "target_platforms": ["mobile", "desktop", "ar"],
  "educational_standards": ["Common Core", "CSTA"],
  "target_age_groups": ["13-18"],
  "ar_features_enabled": true,
  "minigames_enabled": true,
  "multiplayer_enabled": false
}
```

## 🧪 Testing

Run the test suite to verify everything works:

```bash
# Test complete workflow
python test_zip_download.py

# Test Replicate integration
python test_replicate_integration.py

# Test both services
python test_both_services.py
```

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Find and kill process using port
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

**Import Errors:**
```bash
# Set Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
# or on Windows
set PYTHONPATH=%PYTHONPATH%;%cd%
```

**API Key Issues:**
- Verify `.env` files are in correct directories
- Check API key format and validity
- Ensure no extra spaces in environment variables

### Logs and Debugging

- **Text-Chunker logs**: Check terminal output on port 8000
- **Book-to-Game logs**: Check terminal output on port 8002
- **File outputs**: Check `downloads/` directory for generated files

## 📊 Performance

### Typical Processing Times

- **Text Processing**: 2-5 seconds per 1000 words
- **Basic Unity Generation**: 10-15 seconds
- **With Replicate Assets**: 20-30 seconds
- **ZIP Creation**: 1-2 seconds

### Optimization Tips

- Use smaller chunk sizes for faster processing
- Enable parallel processing for multiple scenes
- Cache frequently used assets
- Use appropriate models for your use case

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

[Add your license information here]

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section
2. Review the logs for error messages
3. Test with the provided examples
4. Create an issue with detailed information

## 🎉 Demo Content

Try the system with the included Macbeth demo:

```bash
# Use the included demo scenes
python -c "
import requests
import json

with open('book-to-game/macbeth_scenes.json', 'r') as f:
    scenes = json.load(f)

response = requests.post(
    'http://localhost:8002/transform/book-to-game/download',
    json={'scenes': scenes, 'project_config': {'project_name': 'MacbethDemo'}}
)

with open('MacbethDemo.zip', 'wb') as f:
    f.write(response.content)
    
print('Demo project created: MacbethDemo.zip')
"
```

---

🚀 **Ready to transform books into games!** Start with the Quick Start guide and create your first interactive experience.
