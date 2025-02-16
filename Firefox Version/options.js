document.addEventListener('DOMContentLoaded', () => {
    console.log('[RecFix] Options page loaded');
    
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('save');
    const statusDiv = document.getElementById('status');

    // Verify UI elements
    const requiredElements = { apiKeyInput, saveButton, statusDiv };
    for (const [name, element] of Object.entries(requiredElements)) {
        if (!element) {
            console.error('[RecFix] Required UI element not found:', name);
            return; // Exit if required elements are missing
        }
    }

    // Load saved API key
    chrome.storage.local.get(['youtube_api_key'], result => {
        console.log('[RecFix] Loading saved API key:', result.youtube_api_key ? 'Present' : 'Missing');
        if (result.youtube_api_key) {
            apiKeyInput.value = result.youtube_api_key;
            console.log('[RecFix] API key loaded successfully');
            // Test the loaded API key
            testApiKey(result.youtube_api_key);
        } else {
            console.warn('[RecFix] No API key found in storage');
            showStatus('Please enter your YouTube API key', 'info');
        }
    });

    // Save API key
    saveButton.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        console.log('[RecFix] Save button clicked');

        if (!apiKey) {
            console.warn('[RecFix] Empty API key submitted');
            showStatus('Please enter an API key', 'error');
            return;
        }

        // Validate API key format (basic check)
        if (!apiKey.match(/^[A-Za-z0-9_-]+$/)) {
            console.error('[RecFix] Invalid API key format:', {
                key: apiKey.substring(0, 5) + '...',
                length: apiKey.length
            });
            showStatus('Invalid API key format', 'error');
            return;
        }

        // Test the API key before saving
        const isValid = await testApiKey(apiKey);
        if (!isValid) {
            return; // Don't save if the key is invalid
        }

        console.time('[RecFix] Saving API key');
        // Save to storage
        chrome.storage.local.set({ youtube_api_key: apiKey }, () => {
            console.timeEnd('[RecFix] Saving API key');
            if (chrome.runtime.lastError) {
                console.error('[RecFix] Error saving API key:', chrome.runtime.lastError);
                showStatus('Error saving API key: ' + chrome.runtime.lastError.message, 'error');
                return;
            }

            console.log('[RecFix] API key saved successfully');
            showStatus('API key saved and validated successfully!', 'success');

            // Notify background script of API key update
            chrome.runtime.sendMessage({ 
                action: 'apiKeyUpdated', 
                apiKey: apiKey 
            }).catch(error => {
                console.warn('[RecFix] Could not notify background script:', error);
            });
        });
    });

    // Helper function to show status messages
    function showStatus(message, type = 'success') {
        console.log('[RecFix] Showing status:', { message, type });
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        statusDiv.style.display = 'block';

        // Only auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }

    // Test the API key with a simple request
    async function testApiKey(apiKey) {
        console.log('[RecFix] Testing API key');
        console.time('[RecFix] API key test');
        showStatus('Testing API key...', 'info');
        
        try {
            const params = new URLSearchParams({
                part: 'snippet',
                chart: 'mostPopular',
                maxResults: '1',
                key: apiKey,
                regionCode: 'US' // Add region code to avoid potential errors
            });

            console.log('[RecFix] Making test API request');
            const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
            const data = await response.json();

            console.timeEnd('[RecFix] API key test');
            
            if (response.status !== 200) {
                const errorMessage = data.error?.message || 'Unknown API error';
                console.error('[RecFix] API key test failed:', {
                    status: response.status,
                    error: data.error,
                    message: errorMessage
                });
                showStatus(`API key error: ${errorMessage}`, 'error');
                return false;
            }

            if (!data.items || !data.items.length) {
                console.warn('[RecFix] API key test: No items returned');
                showStatus('API key valid but no data returned', 'warning');
                return true; // Still consider it valid
            }

            console.log('[RecFix] API key test successful:', {
                itemCount: data.items.length,
                pageInfo: data.pageInfo
            });
            showStatus('API key validated successfully!', 'success');
            return true;

        } catch (error) {
            console.error('[RecFix] Error testing API key:', {
                error: error.message,
                stack: error.stack
            });
            showStatus(`Error testing API key: ${error.message}`, 'error');
            return false;
        }
    }
}); 