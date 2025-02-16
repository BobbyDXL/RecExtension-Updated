document.addEventListener('DOMContentLoaded', () => {
    console.log('[RecFix] Popup initialized');
    
    // UI Elements
    const tabs = document.querySelectorAll('.tab');
    const scanContent = document.getElementById('scan-content');
    const manualContent = document.getElementById('manual-content');
    const scanBtn = document.getElementById('scan-btn');
    const processUrlsBtn = document.getElementById('process-urls-btn');
    const fixFeedBtn = document.getElementById('fix-feed-btn');
    const saveBtn = document.getElementById('save-btn');
    const recommendationsList = document.getElementById('recommendations-list');
    const manualInput = document.getElementById('manual-input');
    const loadingElement = document.querySelector('.loading');
    const statusMessage = document.querySelector('.status-message');
    const videoTemplate = document.getElementById('video-item-template');

    // Verify required elements
    const requiredElements = {
        scanContent,
        manualContent,
        scanBtn,
        processUrlsBtn,
        fixFeedBtn,
        saveBtn,
        recommendationsList,
        manualInput,
        loadingElement,
        statusMessage,
        videoTemplate
    };

    // Check if all required elements exist
    for (const [name, element] of Object.entries(requiredElements)) {
        if (!element) {
            console.error(`[RecFix] Required element not found: ${name}`);
            showStatus(`UI Error: ${name} element not found`, 'error');
            return;
        }
    }

    // Animation configurations
    const fadeIn = {
        opacity: [0, 1],
        y: [20, 0],
        transition: { duration: 0.3 }
    };

    const fadeOut = {
        opacity: [1, 0],
        y: [0, 20],
        transition: { duration: 0.2 }
    };

    // Check if content script is loaded and inject if necessary
    async function ensureContentScriptLoaded(tabId) {
        console.log('[RecFix] Checking content script status for tab:', tabId);
        
        try {
            // Try to send a ping message first
            await browser.tabs.sendMessage(tabId, { action: 'ping' });
            console.log('[RecFix] Content script is already loaded');
            return true;
        } catch (error) {
            console.log('[RecFix] Content script not loaded, attempting to inject');
            
            try {
                await browser.tabs.executeScript(tabId, {
                    file: 'content.js'
                });
                console.log('[RecFix] Content script injected successfully');
                return true;
            } catch (error) {
                console.error('[RecFix] Failed to inject content script:', error);
                return false;
            }
        }
    }

    // Send message to content script with retry
    async function sendMessageToContentScript(tabId, message, maxRetries = 3) {
        console.log('[RecFix] Sending message to content script:', {
            tabId,
            message,
            maxRetries
        });

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Ensure content script is loaded before sending message
                const isLoaded = await ensureContentScriptLoaded(tabId);
                if (!isLoaded) {
                    throw new Error('Could not load content script');
                }

                // Send message and wait for response
                const response = await browser.tabs.sendMessage(tabId, message);
                console.log('[RecFix] Message sent successfully:', {
                    attempt,
                    response
                });
                return response;
            } catch (error) {
                console.warn(`[RecFix] Attempt ${attempt} failed:`, error);
                
                if (attempt === maxRetries) {
                    throw new Error('Failed to communicate with the content script after multiple attempts');
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    // Tab switching with animation
    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            console.log('[RecFix] Tab clicked:', {
                tab: tab.dataset.tab,
                previousActive: document.querySelector('.tab.active')?.dataset.tab
            });
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Animate content switch
            if (tab.dataset.tab === 'scan') {
                await animateElement(manualContent, fadeOut);
                manualContent.classList.add('hidden');
                scanContent.classList.remove('hidden');
                animateElement(scanContent, fadeIn);
            } else {
                await animateElement(scanContent, fadeOut);
                scanContent.classList.add('hidden');
                manualContent.classList.remove('hidden');
                animateElement(manualContent, fadeIn);
            }
        });
    });

    // Helper function for animations
    async function animateElement(element, animation) {
        await motion.animate(element, animation).finished;
    }

    // Show/hide loading state with animation
    function showLoading(show) {
        console.log('[RecFix] Show loading:', show);
        if (show) {
            loadingElement.classList.remove('hidden');
            animateElement(loadingElement, fadeIn);
        } else {
            animateElement(loadingElement, fadeOut).then(() => {
                loadingElement.classList.add('hidden');
            });
        }
    }

    // Show status message with animation
    function showStatus(message, type = 'info') {
        console.log('[RecFix] Show status:', { message, type });
        statusMessage.textContent = message;
        statusMessage.className = 'status-message p-4 rounded-lg mb-4 text-sm';
        
        switch (type) {
            case 'error':
                statusMessage.classList.add('bg-red-100', 'text-red-800', 'dark:bg-red-900', 'dark:text-red-200');
                break;
            case 'success':
                statusMessage.classList.add('bg-green-100', 'text-green-800', 'dark:bg-green-900', 'dark:text-green-200');
                break;
            case 'warning':
                statusMessage.classList.add('bg-yellow-100', 'text-yellow-800', 'dark:bg-yellow-900', 'dark:text-yellow-200');
                break;
            default:
                statusMessage.classList.add('bg-blue-100', 'text-blue-800', 'dark:bg-blue-900', 'dark:text-blue-200');
        }

        statusMessage.classList.remove('hidden');
        animateElement(statusMessage, fadeIn);

        if (type === 'success') {
            setTimeout(() => {
                animateElement(statusMessage, fadeOut).then(() => {
                    statusMessage.classList.add('hidden');
                });
            }, 3000);
        }
    }

    // Display recommendations with animation
    function displayRecommendations(recommendations) {
        console.log('[RecFix] Displaying recommendations:', {
            count: recommendations.length,
            first: recommendations[0],
            last: recommendations[recommendations.length - 1]
        });

        try {
            recommendationsList.innerHTML = '';

            recommendations.forEach((video, index) => {
                try {
                    const videoElement = videoTemplate.content.cloneNode(true);
                    const container = videoElement.querySelector('.card');
                    const checkbox = videoElement.querySelector('input[type="checkbox"]');
                    const img = videoElement.querySelector('img');
                    const title = videoElement.querySelector('h3');
                    const channel = videoElement.querySelector('p');

                    checkbox.id = `video-${video.id}`;
                    checkbox.value = video.id;
                    
                    img.src = video.thumbnail;
                    img.alt = video.title;
                    
                    title.textContent = video.title;
                    channel.textContent = video.channel;

                    // Add click event listener to the card container
                    container.addEventListener('click', (e) => {
                        // Don't toggle if clicking the checkbox directly
                        if (e.target !== checkbox) {
                            checkbox.checked = !checkbox.checked;
                            // Trigger change event manually
                            checkbox.dispatchEvent(new Event('change'));
                            console.log('[RecFix] Card clicked:', {
                                videoId: video.id,
                                checked: checkbox.checked
                            });
                        }
                    });

                    // Add animation delay based on index
                    container.style.opacity = '0';
                    container.style.transform = 'translateY(20px)';
                    
                    recommendationsList.appendChild(videoElement);

                    // Animate each card with stagger
                    setTimeout(() => {
                        motion.animate(container, {
                            opacity: [0, 1],
                            y: [20, 0]
                        }, {
                            duration: 0.3,
                            delay: index * 0.05
                        });
                    }, 0);

                    // Add change event listener to checkbox
                    checkbox.addEventListener('change', () => {
                        console.log('[RecFix] Checkbox changed:', {
                            videoId: video.id,
                            checked: checkbox.checked
                        });
                        updateButtonStates();
                    });
                } catch (error) {
                    console.error('[RecFix] Error creating video element:', {
                        error: error.message,
                        video,
                        index
                    });
                }
            });

            // Initialize button states
            updateButtonStates();
            console.log('[RecFix] Successfully displayed recommendations');
        } catch (error) {
            console.error('[RecFix] Error displaying recommendations:', {
                error: error.message,
                stack: error.stack
            });
            showStatus('Error displaying recommendations', 'error');
        }
    }

    // Update button states with animation
    function updateButtonStates() {
        console.log('[RecFix] Updating button states');
        const selectedCount = getSelectedVideos().length;
        
        [fixFeedBtn, saveBtn].forEach(btn => {
            const wasDisabled = btn.disabled;
            btn.disabled = selectedCount === 0;
            
            if (wasDisabled !== btn.disabled) {
                motion.animate(btn, {
                    scale: [0.95, 1],
                    opacity: btn.disabled ? [1, 0.5] : [0.5, 1]
                }, {
                    duration: 0.2
                });
            }
        });

        console.log('[RecFix] Buttons updated:', { selectedCount, fixFeedDisabled: fixFeedBtn.disabled });
    }

    // Get selected videos
    function getSelectedVideos() {
        const checkboxes = recommendationsList.querySelectorAll('input[type="checkbox"]:checked');
        const selectedVideos = Array.from(checkboxes).map(checkbox => checkbox.value);
        
        console.log('[RecFix] Getting selected videos:', {
            total: checkboxes.length,
            selected: selectedVideos.length,
            videos: selectedVideos.slice(0, 3)
        });

        return selectedVideos;
    }

    // Scan button click handler
    scanBtn.addEventListener('click', async () => {
        console.log('[RecFix] Scan button clicked');
        showLoading(true);
        showStatus('Scanning YouTube page...', 'info');

        try {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            const activeTab = tabs[0];

            if (!activeTab.url.includes('youtube.com')) {
                throw new Error('Please navigate to YouTube first');
            }

            const response = await sendMessageToContentScript(activeTab.id, { action: 'scrapeRecommendations' });
            
            if (response.error) {
                throw new Error(response.error);
            }

            if (!response.recommendations?.length) {
                throw new Error('No recommendations found. Try scrolling the page to load more videos.');
            }

            displayRecommendations(response.recommendations);
            showStatus(`Found ${response.recommendations.length} recommendations`, 'success');
        } catch (error) {
            console.error('[RecFix] Scan error:', error);
            showStatus(error.message, 'error');
        } finally {
            showLoading(false);
        }
    });

    processUrlsBtn.addEventListener('click', async () => {
        const urls = manualInput.value.trim().split('\n').filter(url => url.trim());
        
        if (urls.length === 0) {
            showStatus('Please enter at least one YouTube URL', 'error');
            return;
        }

        showLoading(true);
        showStatus('Processing URLs...', 'info');

        try {
            const response = await browser.runtime.sendMessage({
                action: 'processManualUrls',
                urls: urls
            });

            if (response.error) {
                throw new Error(response.error);
            }

            if (!response.recommendations?.length) {
                throw new Error('No recommendations found for the provided URLs.');
            }

            displayRecommendations(response.recommendations);
            showStatus('Successfully processed URLs!', 'success');
        } catch (error) {
            showStatus(error.message, 'error');
        } finally {
            showLoading(false);
        }
    });

    fixFeedBtn.addEventListener('click', async () => {
        const selectedVideos = getSelectedVideos();
        
        if (selectedVideos.length === 0) {
            showStatus('Please select at least one video', 'error');
            return;
        }

        showLoading(true);
        showStatus('Generating improved recommendations...', 'info');

        try {
            const response = await browser.runtime.sendMessage({
                action: 'fixFeed',
                selectedVideos: selectedVideos
            });

            if (response.error) {
                throw new Error(response.error);
            }

            displayRecommendations(response.recommendations);
            showStatus('Feed has been optimized!', 'success');

            // Update remaining limit display after successful fix
            if (response.remainingLimit !== undefined) {
                fixFeedBtn.innerHTML = `Fix Feed <span class="text-xs opacity-75">(${response.remainingLimit} left today)</span>`;
                if (response.remainingLimit === 0) {
                    fixFeedBtn.disabled = true;
                    fixFeedBtn.title = 'Daily limit reached. Please try again tomorrow.';
                }
            }
        } catch (error) {
            showStatus(error.message, 'error');
        } finally {
            showLoading(false);
        }
    });

    saveBtn.addEventListener('click', async () => {
        const selectedVideos = getSelectedVideos();
        showLoading(true);
        showStatus('Saving recommendations...', 'info');

        try {
            const response = await browser.runtime.sendMessage({
                action: 'saveRecommendations',
                recommendations: selectedVideos
            });

            if (response.error) {
                throw new Error(response.error);
            }

            showStatus('Recommendations saved successfully!', 'success');
        } catch (error) {
            showStatus(error.message, 'error');
        } finally {
            showLoading(false);
        }
    });

    // Check remaining limit on popup open
    async function updateRemainingLimit() {
        try {
            const response = await browser.runtime.sendMessage({ action: 'getRemainingLimit' });
            if (response.error) {
                console.error('[RecFix] Error getting remaining limit:', response.error);
                return;
            }

            const remaining = response.remaining;
            console.log('[RecFix] Remaining daily limit:', remaining);

            // Update fix feed button text
            fixFeedBtn.innerHTML = `Fix Feed <span class="text-xs opacity-75">(${remaining} left today)</span>`;

            // Disable button if no fixes remaining
            if (remaining === 0) {
                fixFeedBtn.disabled = true;
                fixFeedBtn.title = 'Daily limit reached. Please try again tomorrow.';
            }
        } catch (error) {
            console.error('[RecFix] Error updating limit display:', error);
        }
    }

    // Initialize
    updateRemainingLimit();
}); 