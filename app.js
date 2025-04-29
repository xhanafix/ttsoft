// DOM Elements
const settingsBtn = document.getElementById('settings-btn');
const apiModalOverlay = document.getElementById('api-modal-overlay');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const topicInput = document.getElementById('topic-input');
const generateBtn = document.getElementById('generate-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const resultsSection = document.getElementById('results-section');
const resultsContent = document.getElementById('results-content');
const copyBtn = document.getElementById('copy-btn');

// Constants
const API_KEY_STORAGE_KEY = 'tiktok_script_generator_api_key';
const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

// State
let apiKey = localStorage.getItem(API_KEY_STORAGE_KEY) || '';

// Initialize the application
function init() {
    // Show API key modal if no API key is stored
    if (!apiKey) {
        showApiKeyModal();
    }
    
    // Set up event listeners
    settingsBtn.addEventListener('click', showApiKeyModal);
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    generateBtn.addEventListener('click', generateScript);
    copyBtn.addEventListener('click', copyToClipboard);
    
    // Input validation for enabling/disabling the generate button
    topicInput.addEventListener('input', validateInputs);
    document.querySelectorAll('input[name="language"]').forEach(radio => {
        radio.addEventListener('change', validateInputs);
    });
    
    // Close modal when clicking outside
    apiModalOverlay.addEventListener('click', function(e) {
        if (e.target === apiModalOverlay) {
            hideApiKeyModal();
        }
    });

    // Allow closing modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !apiModalOverlay.classList.contains('hidden')) {
            hideApiKeyModal();
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

// Copy to clipboard
function copyToClipboard() {
    const text = resultsContent.textContent;
    
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback for copy
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 