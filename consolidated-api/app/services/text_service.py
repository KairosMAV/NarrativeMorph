"""
📝 NarrativeMorph - Text Processing Service
Integration of the existing text-chunker functionality
"""
import asyncio
import os
import json
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ValidationError
from openai import OpenAI
import structlog
from app.config import settings

# Configure logging
logger = structlog.get_logger(__name__)

# Initialize OpenAI client (using OpenRouter as in your original code)
client = OpenAI(
    api_key=settings.openai_api_key,
    base_url="https://openrouter.ai/api/v1",
)

DEFAULT_MODEL = "google/gemini-2.5-flash-preview-05-20"

# Configuration from your original text-chunker
TARGET_CHUNK_SIZE_WORDS = settings.target_chunk_size_words
WORD_COUNT_SLACK = settings.chunk_word_slack
MIN_CHUNK_SIZE_WORDS = settings.min_chunk_size_words


class Scene(BaseModel):
    """Scene model matching your original text-chunker output"""
    elementi_narrativi: str
    personaggi: str
    ambientazione: str
    mood_vibe: str
    azione_in_corso: str


class ScenesResponse(BaseModel):
    """Response model for scene extraction"""
    scenes: List[Scene]


class TextProcessingResult(BaseModel):
    """Extended result with processing metadata"""
    scenes: List[Scene]
    total_scenes: int
    total_words: int
    processing_time_seconds: float
    chunks_processed: int
    success: bool
    error_message: Optional[str] = None


async def _call_llm(
    current_client: OpenAI,
    prompt_content: str,
    system_message: str,
    model: str
) -> str:
    """Helper function to make an API call to the LLM."""
    try:
        response = await asyncio.to_thread(
            current_client.chat.completions.create,
            model=model,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt_content},
            ]
        )
        content = response.choices[0].message.content
        if content is None:
            raise ValueError("LLM response content is empty.")
        return content
    except Exception as e:
        logger.error("LLM API call failed", error=str(e))
        raise


def _get_json_payload_from_llm_content(llm_content: str) -> str:
    """Extracts the JSON array string from the LLM's raw text output."""
    json_match = re.search(r"\[.*\]", llm_content, re.DOTALL)
    if json_match:
        return json_match.group(0)
    return llm_content


def _parse_and_validate_scenes(json_payload: str) -> List[Scene]:
    """
    Parses a JSON string and validates it into a list of Scene objects.
    """
    try:
        scenes_data = json.loads(json_payload)
        
        if not isinstance(scenes_data, list):
            raise ValueError(f"Expected a JSON list/array, but got {type(scenes_data).__name__}")

        validated_scenes: List[Scene] = []
        for i, scene_item in enumerate(scenes_data):
            if not isinstance(scene_item, dict):
                raise ValueError(f"Item at index {i} in JSON array is not a dictionary")
            validated_scenes.append(Scene(**scene_item))
        
        return validated_scenes
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {str(e)}")
    except ValidationError as e:
        raise ValueError(f"Scene validation failed: {str(e)}")


def _build_fixer_prompt(original_text: str, malformed_json_payload: str, validation_errors: Any) -> str:
    """Constructs the prompt for the fixer LLM call."""
    return f"""
Sei un assistente AI specializzato nella correzione di JSON malformati in base a uno schema Pydantic.
Il precedente tentativo di estrarre scene da un testo ha prodotto un JSON che non ha superato la validazione.

Testo originale analizzato:
{original_text[:1000]}...

JSON malformato ricevuto:
{malformed_json_payload[:1000]}...

Errori di validazione Pydantic:
{validation_errors}

Il formato JSON corretto DEVE essere un array di oggetti. Ogni oggetto DEVE contenere ESATTAMENTE i seguenti campi come stringhe:
- `elementi_narrativi`
- `personaggi`
- `ambientazione`
- `mood_vibe`
- `azione_in_corso`

Correggi il JSON malformato per conformarlo rigorosamente a questo schema.
Restituisci SOLO l'array JSON corretto, senza testo aggiuntivo o spiegazioni.
"""


async def split_text_into_scenes_logic(text: str) -> ScenesResponse:
    """Core scene extraction logic (from your original text-chunker)"""
    initial_prompt = f"""
Sei un esperto analista letterario e un narratore visivo. Il tuo compito è dividere il seguente testo di narrativa in scene individuali.
Per ogni scena, immagina di scattare un'istantanea da utilizzare per un servizio di generazione di immagini.

Pertanto, per ogni scena, fornisci:
Una scomposizione dettagliata delle componenti visive e narrative della scena con le seguenti chiavi:
    *   `elementi_narrativi`: (stringa) Elementi narrativi chiave presenti (ad esempio, oggetti significativi, simboli).
    *   `personaggi`: (stringa) Personaggi coinvolti, dettagliando il loro aspetto, espressioni ed eventuali interazioni se descritte.
    *   `ambientazione`: (stringa) L'ambientazione e l'ambiente (ad esempio, luogo, ora del giorno, tempo atmosferico, dettagli specifici dell'ambiente circostante).
    *   `mood_vibe`: (stringa) L'atmosfera o il mood generale della scena (ad esempio, teso, misterioso, calmo, gioioso).
    *   `azione_in_corso`: (stringa) L'azione principale, l'evento o le pose dei personaggi che si svolgono nella scena.

Formatta la tua risposta come un array JSON. Ogni oggetto nell'array deve rappresentare una scena e contenere rigorosamente SOLO i seguenti campi: `elementi_narrativi`, `personaggi`, `ambientazione`, `mood_vibe`, e `azione_in_corso`.

Testo da analizzare:
{text}

Assicurati che le scene siano complete e non vengano interrotte a metà frase. Cerca interruzioni narrative naturali.
Concentrati sull'estrazione di dettagli visivi e descrittivi per ogni campo specificato.
NON includere il testo completo della scena nella tua risposta, ma solo i dati strutturati richiesti.
"""

    system_message_initial = "You are a literary analyst expert at identifying scene boundaries in fiction."

    try:
        logger.info("Starting initial LLM call for scene extraction")
        llm_content_initial = await _call_llm(client, initial_prompt, system_message_initial, DEFAULT_MODEL)
        
        json_payload_initial = _get_json_payload_from_llm_content(llm_content_initial)
        scenes = _parse_and_validate_scenes(json_payload_initial)
        
        logger.info("Scene extraction successful", scene_count=len(scenes))
        return ScenesResponse(scenes=scenes)

    except (json.JSONDecodeError, ValueError) as e_initial:
        logger.warning("Initial scene extraction failed, attempting fix", error=str(e_initial))
        
        # Try fixer LLM
        fixer_input_payload = json_payload_initial if 'json_payload_initial' in locals() else llm_content_initial
        fixer_prompt = _build_fixer_prompt(text, fixer_input_payload, str(e_initial))
        system_message_fixer = "You are an AI assistant specialized in correcting malformed JSON based on a Pydantic schema."

        try:
            llm_content_fixer = await _call_llm(client, fixer_prompt, system_message_fixer, DEFAULT_MODEL)
            json_payload_fixer = _get_json_payload_from_llm_content(llm_content_fixer)
            fixed_scenes = _parse_and_validate_scenes(json_payload_fixer)
            
            logger.info("Scene extraction fixed successfully", scene_count=len(fixed_scenes))
            return ScenesResponse(scenes=fixed_scenes)

        except Exception as e_fixer:
            logger.error("Both initial and fixer attempts failed", 
                        initial_error=str(e_initial), 
                        fixer_error=str(e_fixer))
            raise ValueError(f"Scene extraction failed: {str(e_initial)}, Fixer also failed: {str(e_fixer)}")


def _find_natural_break_point(text_segment: str, start_offset: int, end_offset: int) -> int:
    """Tries to find a paragraph or sentence break within a range."""
    # Prioritize double newline (paragraph)
    for i in range(end_offset, start_offset - 1, -1):
        if i >= 2 and text_segment[i-2:i] == "\n\n":
            return i
    
    # Then single newline
    for i in range(end_offset, start_offset - 1, -1):
        if i >= 1 and text_segment[i-1:i] == "\n":
            return i
    
    # Then sentence-ending punctuation
    for i in range(end_offset, start_offset - 1, -1):
        if i >= 1 and text_segment[i-1] in ('.', '?', '!'):
            return i
    
    return end_offset


def _create_non_overlapping_major_chunks(full_text: str, target_chunk_size_words: int, slack: int) -> List[str]:
    """Creates non-overlapping chunks of text for processing."""
    logger.info("Creating text chunks", 
                text_length=len(full_text), 
                target_words=target_chunk_size_words,
                slack=slack)
    
    chunks: List[str] = []
    word_tokens = re.findall(r'\S+\s*', full_text)
    
    if not word_tokens:
        return [full_text] if full_text.strip() else []

    current_char_idx = 0
    processed_words_count = 0

    while current_char_idx < len(full_text):
        target_word_end_idx = min(processed_words_count + target_chunk_size_words, len(word_tokens))
        
        if target_word_end_idx > 0:
            estimated_additional_chars = sum(len(wt) for wt in word_tokens[processed_words_count:target_word_end_idx])
            estimated_char_end_offset = current_char_idx + estimated_additional_chars
        else:
            estimated_char_end_offset = current_char_idx

        # If remaining words are small, take everything
        if (len(word_tokens) - processed_words_count) < (target_chunk_size_words + slack):
            estimated_char_end_offset = len(full_text)

        # Find natural break point
        slack_chars_approx = slack * 6  # Average word length estimate
        search_start_char = max(current_char_idx, estimated_char_end_offset - slack_chars_approx)
        search_end_char = min(len(full_text), estimated_char_end_offset + slack_chars_approx)
        
        actual_break_char_offset = _find_natural_break_point(full_text, search_start_char, search_end_char)
        actual_break_char_offset = max(current_char_idx + 1, actual_break_char_offset)
        actual_break_char_offset = min(actual_break_char_offset, len(full_text))

        chunk_text = full_text[current_char_idx:actual_break_char_offset].strip()
        
        if chunk_text:
            num_words_in_chunk = len(re.findall(r'\b\w+\b', chunk_text))
            
            if num_words_in_chunk >= MIN_CHUNK_SIZE_WORDS:
                chunks.append(chunk_text)
                logger.debug("Created chunk", 
                           chunk_number=len(chunks), 
                           words=num_words_in_chunk, 
                           chars=len(chunk_text))
            elif chunks and num_words_in_chunk > 0:
                chunks[-1] += "\n\n" + chunk_text
                logger.debug("Appended small chunk to previous")
            elif num_words_in_chunk > 0:
                chunks.append(chunk_text)

        # Update position tracking
        if actual_break_char_offset > current_char_idx:
            consumed_text_len = actual_break_char_offset - current_char_idx
            temp_consumed_chars = 0
            words_advanced_this_iteration = 0
            
            for k_idx in range(processed_words_count, len(word_tokens)):
                temp_consumed_chars += len(word_tokens[k_idx])
                words_advanced_this_iteration += 1
                if temp_consumed_chars >= consumed_text_len:
                    break
            
            processed_words_count += words_advanced_this_iteration
        elif current_char_idx < len(full_text):
            actual_break_char_offset = current_char_idx + 1

        current_char_idx = actual_break_char_offset

        if current_char_idx >= len(full_text):
            break

    logger.info("Text chunking complete", total_chunks=len(chunks))
    return chunks


async def _process_single_chunk_for_scenes(text_chunk: str, chunk_index: int) -> List[Scene]:
    """Process a single text chunk to extract scenes."""
    logger.info("Processing chunk for scenes", 
                chunk_index=chunk_index, 
                chunk_size=len(text_chunk))
    
    if not text_chunk.strip():
        return []
    
    try:
        scene_response = await split_text_into_scenes_logic(text_chunk)
        logger.info("Chunk processing complete", 
                   chunk_index=chunk_index, 
                   scenes_extracted=len(scene_response.scenes))
        return scene_response.scenes
    except Exception as e:
        logger.error("Chunk processing failed", 
                    chunk_index=chunk_index, 
                    error=str(e))
        return []


async def process_large_text(full_text: str, target_chunk_size_words: int, word_slack: int) -> ScenesResponse:
    """Process large text by chunking and merging scenes."""
    import time
    start_time = time.time()
    
    logger.info("Starting large text processing", text_length=len(full_text))
    
    major_chunks = _create_non_overlapping_major_chunks(full_text, target_chunk_size_words, word_slack)
    
    if not major_chunks:
        return ScenesResponse(scenes=[])

    all_chunks_scenes: List[List[Scene]] = []
    for i, chunk_text in enumerate(major_chunks):
        scenes_from_chunk = await _process_single_chunk_for_scenes(chunk_text, i)
        all_chunks_scenes.append(scenes_from_chunk)

    # Flatten scenes from all chunks
    final_scenes: List[Scene] = []
    for chunk_scenes in all_chunks_scenes:
        final_scenes.extend(chunk_scenes)

    processing_time = time.time() - start_time
    
    logger.info("Large text processing complete", 
                total_scenes=len(final_scenes),
                chunks_processed=len(major_chunks),
                processing_time=processing_time)
    
    return ScenesResponse(scenes=final_scenes)


async def extract_scenes_from_text(text: str) -> TextProcessingResult:
    """
    Main entry point for text processing service.
    Extracts scenes from text with full metadata.
    """
    import time
    start_time = time.time()
    
    try:
        logger.info("Starting text scene extraction", text_length=len(text))
        
        if not text.strip():
            return TextProcessingResult(
                scenes=[],
                total_scenes=0,
                total_words=0,
                processing_time_seconds=0.0,
                chunks_processed=0,
                success=False,
                error_message="Empty text provided"
            )
        
        word_count = len(re.findall(r'\b\w+\b', text))
        
        # Use large text processing for all texts to ensure consistency
        scene_response = await process_large_text(text, TARGET_CHUNK_SIZE_WORDS, WORD_COUNT_SLACK)
        
        processing_time = time.time() - start_time
        
        result = TextProcessingResult(
            scenes=scene_response.scenes,
            total_scenes=len(scene_response.scenes),
            total_words=word_count,
            processing_time_seconds=processing_time,
            chunks_processed=1 if word_count <= TARGET_CHUNK_SIZE_WORDS else len(text) // (TARGET_CHUNK_SIZE_WORDS * 6),  # Rough estimate
            success=True
        )
        
        logger.info("Text scene extraction complete", 
                   scenes=result.total_scenes,
                   words=result.total_words,
                   time=result.processing_time_seconds)
        
        return result
        
    except Exception as e:
        processing_time = time.time() - start_time
        error_msg = f"Text processing failed: {str(e)}"
        
        logger.error("Text scene extraction failed", 
                    error=error_msg,
                    processing_time=processing_time)
        
        return TextProcessingResult(
            scenes=[],
            total_scenes=0,
            total_words=len(re.findall(r'\b\w+\b', text)) if text else 0,
            processing_time_seconds=processing_time,
            chunks_processed=0,
            success=False,
            error_message=error_msg
        )


class TextChunkingService:
    """
    Service class for text chunking and scene extraction
    Wrapper around the text processing functions
    """
    
    def __init__(self):
        self.client = client
        self.logger = logger
    
    async def process_text(self, text: str) -> TextProcessingResult:
        """
        Process text and extract scenes
        
        Args:
            text: Input text to process
            
        Returns:
            TextProcessingResult with scenes and metadata
        """
        return await split_text_into_scenes_logic(text)
    
    async def extract_scenes(self, text: str) -> List[Scene]:
        """
        Extract scenes from text (simplified interface)
        
        Args:
            text: Input text to process
            
        Returns:
            List of Scene objects
        """
        result = await self.process_text(text)
        return result.scenes if result.success else []
