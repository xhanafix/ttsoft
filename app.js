// DOM Elements
const settingsBtn = document.getElementById('settings-btn');
const historyBtn = document.getElementById('history-btn');
const apiModalOverlay = document.getElementById('api-modal-overlay');
const historyModalOverlay = document.getElementById('history-modal-overlay');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const topicInput = document.getElementById('topic-input');
const generateBtn = document.getElementById('generate-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const resultsSection = document.getElementById('results-section');
const resultsContent = document.getElementById('results-content');
const copyBtn = document.getElementById('copy-btn');
const printBtn = document.getElementById('print-btn');
const exportBtn = document.getElementById('export-btn');
const exportAllBtn = document.getElementById('export-all-btn');
const importHistoryBtn = document.getElementById('import-history-btn');
const importFileInput = document.getElementById('import-file-input');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const closeHistoryBtn = document.getElementById('close-history-btn');
const historyList = document.getElementById('history-list');

// Constants
const API_KEY_STORAGE_KEY = 'tiktok_script_generator_api_key';
const HISTORY_STORAGE_KEY = 'tiktok_content_history';
const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

// State
let apiKey = localStorage.getItem(API_KEY_STORAGE_KEY) || '';
let contentHistory = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
let currentContent = null;

// Initialize the application
function init() {
    // Show API key modal if no API key is stored
    if (!apiKey) {
        showApiKeyModal();
    }
    
    // Set up event listeners
    settingsBtn.addEventListener('click', showApiKeyModal);
    historyBtn.addEventListener('click', showHistoryModal);
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    generateBtn.addEventListener('click', generateScript);
    copyBtn.addEventListener('click', copyToClipboard);
    printBtn.addEventListener('click', printContent);
    exportBtn.addEventListener('click', exportCurrentContent);
    exportAllBtn.addEventListener('click', exportAllHistory);
    importHistoryBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importHistory);
    clearHistoryBtn.addEventListener('click', clearHistory);
    closeHistoryBtn.addEventListener('click', hideHistoryModal);
    
    // Input validation for enabling/disabling the generate button
    topicInput.addEventListener('input', validateInputs);
    document.querySelectorAll('input[name="language"]').forEach(radio => {
        radio.addEventListener('change', validateInputs);
    });
    
    // Close modals when clicking outside
    apiModalOverlay.addEventListener('click', function(e) {
        if (e.target === apiModalOverlay) {
            hideApiKeyModal();
        }
    });
    
    historyModalOverlay.addEventListener('click', function(e) {
        if (e.target === historyModalOverlay) {
            hideHistoryModal();
        }
    });

    // Allow closing modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (!apiModalOverlay.classList.contains('hidden')) {
                hideApiKeyModal();
            }
            if (!historyModalOverlay.classList.contains('hidden')) {
                hideHistoryModal();
            }
        }
    });
}

// Validate inputs and enable/disable generate button
function validateInputs() {
    const topic = topicInput.value.trim();
    const language = document.querySelector('input[name="language"]:checked');
    
    generateBtn.disabled = !topic || !language;
}

// Show API key modal
function showApiKeyModal() {
    apiModalOverlay.classList.remove('hidden');
    apiKeyInput.value = apiKey;
    apiKeyInput.focus();
}

// Hide API key modal
function hideApiKeyModal() {
    apiModalOverlay.classList.add('hidden');
}

// Show history modal
function showHistoryModal() {
    historyModalOverlay.classList.remove('hidden');
    renderHistoryList();
}

// Hide history modal
function hideHistoryModal() {
    historyModalOverlay.classList.add('hidden');
}

// Render history list
function renderHistoryList() {
    if (contentHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-history-message">No history yet. Generate some content to see it here.</p>';
        return;
    }
    
    historyList.innerHTML = '';
    
    // Sort history by date (newest first)
    contentHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create elements for each history item
    contentHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        historyItem.dataset.index = index;
        
        const preview = item.content.split('\n')[0].substring(0, 100) + '...';
        
        historyItem.innerHTML = `
            <div class="history-item-header">
                <strong>${item.topic}</strong>
                <span class="history-item-date">${formatDate(new Date(item.date))}</span>
            </div>
            <div class="history-item-preview">${preview}</div>
        `;
        
        historyItem.addEventListener('click', () => {
            loadHistoryItem(index);
            hideHistoryModal();
        });
        
        historyList.appendChild(historyItem);
    });
}

// Format date for display
function formatDate(date) {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Load history item
function loadHistoryItem(index) {
    const item = contentHistory[index];
    
    // Set form values
    topicInput.value = item.topic;
    document.querySelector(`input[name="language"][value="${item.language}"]`).checked = true;
    
    // Display content
    resultsContent.textContent = item.content;
    resultsSection.classList.remove('hidden');
    
    // Set current content
    currentContent = {
        topic: item.topic,
        language: item.language,
        content: item.content,
        date: item.date
    };
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Save API key
function saveApiKey() {
    const newApiKey = apiKeyInput.value.trim();
    
    if (newApiKey) {
        apiKey = newApiKey;
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        hideApiKeyModal();
    } else {
        apiKeyInput.focus();
    }
}

// Generate script
async function generateScript() {
    // Get input values
    const topic = topicInput.value.trim();
    const language = document.querySelector('input[name="language"]:checked').value;
    
    // Check if API key exists
    if (!apiKey) {
        showApiKeyModal();
        return;
    }
    
    // Show loading overlay
    loadingOverlay.classList.remove('hidden');
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [
                    { 
                        role: 'system', 
                        content: `You are a creative TikTok content creator who specializes in subtle, authentic content frameworks. You create content that doesn't feel like marketing or hard-selling. You must write ONLY in ${language}, no mixing of languages.` 
                    },
                    { 
                        role: 'user', 
                        content: `Create a subtle, authentic framework and script for a TikTok video (<60s) on the topic: ${topic}. Write EXCLUSIVELY in ${language} - do not mix languages or use any words from other languages.

The output should feel natural and not overly promotional. Include:

1. CONTENT APPROACH: A thoughtful, authentic way to present the topic that feels relatable
2. NARRATIVE FLOW: How the video naturally progresses
3. TALKING POINTS: Key ideas to mention in a conversational way
4. VISUALS: Subtle visual elements that enhance without overwhelming
5. AUTHENTIC HOOKS: Natural ways to capture interest
6. GENTLE INVITATION: A soft call-to-action that feels like a genuine suggestion

Focus on authenticity and subtlety rather than hard-selling or overly structured marketing approaches. The content should feel like a natural conversation or storytelling.` 
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        let scriptContent = '';
        
        // Handle different API response formats
        if (data.choices && data.choices[0] && data.choices[0].message) {
            scriptContent = data.choices[0].message.content;
        } else if (data.choices && data.choices[0] && data.choices[0].text) {
            scriptContent = data.choices[0].text;
        } else if (data.output && data.output.content) {
            scriptContent = data.output.content;
        } else {
            console.error('Unexpected API response format:', data);
            throw new Error('Unexpected API response format');
        }
        
        // Create content object
        currentContent = {
            topic,
            language,
            content: scriptContent,
            date: new Date().toISOString()
        };
        
        // Add to history and save
        addToHistory(currentContent);
        
        // Display results
        resultsContent.textContent = scriptContent;
        resultsSection.classList.remove('hidden');
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error generating script:', error);
        alert('Error generating script. Please check your API key and try again.');
    } finally {
        // Hide loading overlay
        loadingOverlay.classList.add('hidden');
    }
}

// Add to history
function addToHistory(content) {
    // Add to beginning of array (newest first)
    contentHistory.unshift(content);
    
    // Limit history to 50 items
    if (contentHistory.length > 50) {
        contentHistory = contentHistory.slice(0, 50);
    }
    
    // Save to localStorage
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(contentHistory));
}

// Copy to clipboard
function copyToClipboard() {
    const text = resultsContent.textContent;
    
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback for copy
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Print content
function printContent() {
    window.print();
}

// Export current content
function exportCurrentContent() {
    if (!currentContent) return;
    
    const filename = `tiktok-content-${currentContent.topic.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    const content = JSON.stringify(currentContent, null, 2);
    
    downloadJSON(content, filename);
}

// Export all history
function exportAllHistory() {
    if (contentHistory.length === 0) {
        alert('No history to export.');
        return;
    }
    
    const filename = `tiktok-content-history-${new Date().toISOString().split('T')[0]}.json`;
    const content = JSON.stringify(contentHistory, null, 2);
    
    downloadJSON(content, filename);
}

// Download JSON
function downloadJSON(content, filename) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Import history
function importHistory(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            
            // Check if it's an array (full history) or a single item
            if (Array.isArray(imported)) {
                // Validate each item in the array
                const validItems = imported.filter(item => 
                    item.topic && item.language && item.content && item.date
                );
                
                if (validItems.length === 0) {
                    throw new Error('No valid content items found.');
                }
                
                // Add valid items to history
                validItems.forEach(item => {
                    // Check if item already exists
                    const exists = contentHistory.some(existing => 
                        existing.topic === item.topic && 
                        existing.language === item.language && 
                        existing.content === item.content
                    );
                    
                    if (!exists) {
                        contentHistory.push(item);
                    }
                });
                
            } else if (imported.topic && imported.language && imported.content && imported.date) {
                // It's a single item
                
                // Check if item already exists
                const exists = contentHistory.some(existing => 
                    existing.topic === imported.topic && 
                    existing.language === imported.language && 
                    existing.content === imported.content
                );
                
                if (!exists) {
                    contentHistory.push(imported);
                }
            } else {
                throw new Error('Invalid import format.');
            }
            
            // Save updated history
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(contentHistory));
            
            // Re-render history list
            renderHistoryList();
            
            alert('Import successful!');
            
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing file. Please check the file format.');
        }
        
        // Reset file input
        importFileInput.value = '';
    };
    
    reader.readAsText(file);
}

// Clear history
function clearHistory() {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
        contentHistory = [];
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(contentHistory));
        renderHistoryList();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 