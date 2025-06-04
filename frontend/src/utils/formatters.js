import { format, formatDistance } from 'date-fns';
import { it } from 'date-fns/locale';

/**
 * Formatta una data ISO in formato localizzato
 * @param {string} isoDate - Data in formato ISO 
 * @param {string} formatString - Formato della data (default: 'dd/MM/yyyy HH:mm')
 * @returns {string} Data formattata
 */
export const formatDate = (isoDate, formatString = 'dd/MM/yyyy HH:mm') => {
  if (!isoDate) return '';
  try {
    const date = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return isoDate?.toString() || '';
  }
};

/** 
 * Formatta una data ISO come "tempo fa" (es. "5 minuti fa")
 * @param {string} isoDate - Data in formato ISO 
 * @returns {string} Tempo relativo
 */
export const formatTimeAgo = (isoDate) => {
  if (!isoDate) return '';
  try {
    const date = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;
    return formatDistance(date, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return isoDate?.toString() || '';
  }
};

/**
 * Trunca un testo alla lunghezza specificata e aggiunge '...' se necessario
 * @param {string} text - Testo da troncare
 * @param {number} maxLength - Lunghezza massima
 * @returns {string} Testo troncato
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Formatta un numero con separatore di migliaia
 * @param {number} number - Numero da formattare
 * @returns {string} Numero formattato
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '';
  return number.toLocaleString('it-IT');
};

/**
 * Formatta un numero come percentuale
 * @param {number} number - Numero da formattare (0-1 o 0-100)
 * @param {boolean} convertFrom0to1 - Se true, moltiplica per 100
 * @returns {string} Percentuale formattata
 */
export const formatPercentage = (number, convertFrom0to1 = false, decimals = 1) => {
  if (number === null || number === undefined) return '';
  
  // Se il numero è già in percentuale (0-100)
  let percentage = number;
  
  // Se il numero è in frazione (0-1) e vogliamo convertirlo
  if (convertFrom0to1 && number <= 1) {
    percentage = number * 100;
  }
  
  return percentage.toFixed(decimals) + '%';
};

/**
 * Determina il colore in base a un punteggio
 * @param {number} score - Punteggio (0-100)
 * @returns {string} Codice colore
 */
export const getScoreColor = (score) => {
  if (score >= 80) return '#4caf50'; // green
  if (score >= 60) return '#8bc34a'; // light green
  if (score >= 40) return '#ffeb3b'; // yellow
  if (score >= 20) return '#ff9800'; // orange
  return '#f44336'; // red
};

/**
 * Estrae il nome del repository da un URL
 * @param {string} url - URL del repository
 * @returns {string} Nome del repository
 */
export const extractRepoNameFromUrl = (url) => {
  if (!url) return '';
  
  try {
    // Rimuovi eventuali .git alla fine
    url = url.replace(/\.git$/, '');
    
    // Dividi l'URL per gli slash e prendi gli ultimi due segmenti
    const parts = url.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return parts[parts.length - 2] + '/' + parts[parts.length - 1];
    } else if (parts.length === 1) {
      return parts[0];
    }
    
    return url;
  } catch (error) {
    console.error('Error extracting repo name:', error);
    return url;
  }
};

/**
 * Converte un timestamp in secondi in formato ore:minuti:secondi
 * @param {number} seconds - Secondi totali
 * @returns {string} Formato ore:minuti:secondi
 */
export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};