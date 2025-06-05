"""
Quality Assurance Agent
Implementa controlli di qualità, testing e guardrail per il progetto Unity
"""
from typing import List, Dict, Any, Optional
from openai import OpenAI
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class QualityAssuranceAgent:
    """Agente specializzato in QA, testing e guardrail"""
    
    def __init__(self, openai_api_key: str, model: str = "gpt-4"):
        self.api_key = openai_api_key
        self.model = model
        self.is_mock_mode = (not openai_api_key or 
                           openai_api_key in ["mock-api-key", "test-api-key", "your-api-key-here"])
        
        if self.is_mock_mode:
            from ..utils.mock_openai import MockOpenAIClient
            self.client = MockOpenAIClient()
            logger.info("Quality Assurance Agent initialized in MOCK mode")
        else:
            # Get base URL from environment for OpenRouter support
            base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
            logger.info(f"Quality Assurance Agent initializing OpenAI client in PRODUCTION mode. Base URL: {base_url}, Model: {self.model}")
            # Adding HTTP-Referer and X-Title headers as per OpenRouter documentation
            self.client = OpenAI(
                api_key=openai_api_key,
                base_url=base_url,
                default_headers={
                    "HTTP-Referer": "http://localhost:8000",
                    "X-Title": "BookToGame"
                }
            )
            logger.info("Quality Assurance Agent OpenAI client configured with custom headers for OpenRouter.")
            
        self.role = "Senior QA Engineer & Test Architect"
        self.goal = "Ensure quality, performance, and safety of Unity games"
        self.backstory = """You are a QA expert with extensive experience in:
        - Game testing methodologies
        - Performance optimization
        - Accessibility testing
        - Security and safety in gaming
        - Automated testing frameworks
        - Cross-platform compatibility
        - User experience validation
        - Content moderation and safety"""
    
    async def create_testing_framework(self, project_specs: Dict[str, Any]) -> Dict[str, Any]:
        """Crea un framework di testing completo"""
        
        prompt = f"""
        Create a comprehensive testing framework for a Unity project that transforms books into games.
        
        Project includes:
        - Narrative-driven minigames
        - AR experiences
        - Educational content
        - Multi-platform deployment (mobile, desktop, AR/VR)
        
        Design testing framework for:
        - Unit testing for core game mechanics
        - Integration testing for scene transitions
        - Performance testing across platforms
        - Accessibility compliance testing
        - Content appropriateness validation
        - User experience testing
        - AR functionality testing
        - Educational effectiveness testing
        
        Return structured JSON with:
        - test_categories: different types of tests needed
        - testing_tools: recommended tools and frameworks
        - test_automation: automated testing strategies
        - performance_benchmarks: target metrics
        - accessibility_standards: compliance requirements
        - content_guidelines: safety and appropriateness rules
        - qa_processes: step-by-step testing procedures
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            import json
            testing_framework = json.loads(response.choices[0].message.content)
            
            logger.info("Created comprehensive testing framework")
            return testing_framework
            
        except Exception as e:
            logger.error(f"Error creating testing framework: {e}")
            raise
    
    async def generate_performance_guardrails(self, target_platforms: List[str]) -> Dict[str, Any]:
        """Genera guardrail per le performance"""
        
        prompt = f"""
        Generate performance guardrails for Unity games targeting these platforms: {', '.join(target_platforms)}
        
        Create guardrails for:
        - Frame rate targets (minimum/target/ideal)
        - Memory usage limits
        - Battery consumption (mobile)
        - Loading time constraints
        - Asset size limitations
        - Network usage (if applicable)
        - CPU/GPU utilization limits
        - AR tracking performance
        
        For each platform, specify:
        - Minimum hardware requirements
        - Performance monitoring metrics
        - Automatic optimization triggers
        - Fallback quality settings
        - Warning and error thresholds
        - Performance profiling requirements
        
        Return structured JSON with platform-specific guardrails.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            import json
            performance_guardrails = json.loads(response.choices[0].message.content)
            
            logger.info(f"Generated performance guardrails for {len(target_platforms)} platforms")
            return performance_guardrails
            
        except Exception as e:
            logger.error(f"Error generating performance guardrails: {e}")
            raise
    
    async def create_content_safety_guidelines(self, target_age_groups: List[str]) -> Dict[str, Any]:
        """Crea linee guida per la sicurezza dei contenuti"""
        
        prompt = f"""
        Create comprehensive content safety guidelines for educational games targeting: {', '.join(target_age_groups)}
        
        Create guidelines that cover:
        - Age-appropriate content filtering
        - Violence and mature themes handling
        - Cultural sensitivity requirements
        - Language and profanity filters
        - Educational value validation
        - Accessibility compliance
        - Data privacy and protection
        - Online safety (if multiplayer)
        
        For each age group, specify:
        - Content restrictions and allowances
        - Parental controls requirements
        - Educational standards alignment
        - Safety monitoring systems
        - Reporting mechanisms
        - Content moderation processes
        
        Return structured JSON with detailed safety guidelines.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            import json
            safety_guidelines = json.loads(response.choices[0].message.content)
            
            logger.info("Created content safety guidelines")
            return safety_guidelines
            
        except Exception as e:
            logger.error(f"Error creating safety guidelines: {e}")
            raise
    
    async def generate_accessibility_tests(self, accessibility_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Genera test per l'accessibilità"""
        
        prompt = f"""
        Generate comprehensive accessibility tests based on these requirements:
        {accessibility_requirements}
        
        Create test cases for:
        - Visual accessibility (colorblind, low vision, blind users)
        - Audio accessibility (deaf, hard of hearing users)
        - Motor accessibility (limited mobility, alternative controls)
        - Cognitive accessibility (learning differences, attention issues)
        - Platform accessibility (different devices and capabilities)
        
        For each accessibility area, create:
        - Automated test scripts
        - Manual testing procedures
        - User testing scenarios
        - Compliance validation checks
        - Performance impact assessments
        - Alternative interaction methods
        
        Return structured JSON with detailed test specifications.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            import json
            accessibility_tests = json.loads(response.choices[0].message.content)
            
            logger.info("Generated accessibility test suite")
            return accessibility_tests
            
        except Exception as e:
            logger.error(f"Error generating accessibility tests: {e}")
            raise
    
    async def create_monitoring_system(self, project_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Crea un sistema di monitoraggio in tempo reale"""
        
        prompt = f"""
        Create a real-time monitoring system for Unity games in production.
        
        Project requirements: {project_requirements}
        
        Design monitoring for:
        - Performance metrics (FPS, memory, battery)
        - User behavior and engagement
        - Error reporting and crash analytics
        - Content safety violations
        - Accessibility usage patterns
        - Educational progress tracking
        - Device compatibility issues
        
        Create system that includes:
        - Real-time dashboards
        - Alert mechanisms
        - Automated responses
        - Data collection strategies
        - Privacy-compliant analytics
        - Performance optimization triggers
        - User feedback integration
        
        Return structured JSON with monitoring specifications.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            import json
            monitoring_system = json.loads(response.choices[0].message.content)
            
            logger.info("Created monitoring system specifications")
            return monitoring_system
            
        except Exception as e:
            logger.error(f"Error creating monitoring system: {e}")
            raise
    
    async def validate_educational_content(self, scene_data: Dict[str, Any], educational_standards: List[str]) -> Dict[str, Any]:
        """Valida i contenuti educativi rispetto agli standard"""
        
        prompt = f"""
        Validate educational content against these standards: {', '.join(educational_standards)}
        
        Scene content to validate:
        Setting: {scene_data.get('ambientazione', '')}
        Characters: {scene_data.get('personaggi', '')}
        Action: {scene_data.get('azione_in_corso', '')}
        Mood: {scene_data.get('mood_vibe', '')}
        
        Validate for:
        - Age appropriateness
        - Educational value and learning objectives
        - Cultural sensitivity and inclusivity
        - Historical/literary accuracy
        - Alignment with curriculum standards
        - Engagement and motivation factors
        - Assessment and progress tracking potential
        
        Return structured JSON with:
        - validation_results: pass/fail for each criterion
        - educational_value_score: 1-10 rating
        - improvement_suggestions: specific recommendations
        - standards_alignment: mapping to educational standards
        - risk_assessment: potential issues and mitigations
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            import json
            validation_results = json.loads(response.choices[0].message.content)
            
            logger.info("Validated educational content")
            return validation_results
            
        except Exception as e:
            logger.error(f"Error validating educational content: {e}")
            raise
