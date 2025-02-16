console.log('[RecFix] Content script loaded');

// Add message listener
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[RecFix] Message received in content script:', {
        action: request.action,
        sender: sender.id
    });

    // Handle ping message
    if (request.action === 'ping') {
        console.log('[RecFix] Ping received, sending pong');
        return Promise.resolve({ status: 'pong' });
    }

    if (request.action === 'scrapeRecommendations') {
        return scrapeRecommendations()
            .then(recommendations => {
                console.log('[RecFix] Scraped recommendations:', {
                    count: recommendations.length,
                    first: recommendations[0],
                    last: recommendations[recommendations.length - 1]
                });
                return { recommendations };
            })
            .catch(error => {
                console.error('[RecFix] Error scraping recommendations:', error);
                return { error: error.message };
            });
    }

    return Promise.resolve({ error: 'Unknown action' });
});

// Function to wait for elements to load with retry
async function waitForElements(selector, timeout = 2000, maxRetries = 3) {
    for (let retry = 0; retry < maxRetries; retry++) {
        try {
            const result = await new Promise((resolve) => {
                if (document.querySelectorAll(selector).length > 0) {
                    return resolve(document.querySelectorAll(selector));
                }

                const observer = new MutationObserver((mutations) => {
                    if (document.querySelectorAll(selector).length > 0) {
                        observer.disconnect();
                        resolve(document.querySelectorAll(selector));
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    resolve(document.querySelectorAll(selector));
                }, timeout);
            });

            if (result.length > 0) {
                return result;
            }

            console.log(`[RecFix] Retry ${retry + 1}/${maxRetries} for selector: ${selector}`);
            // Increase timeout for next retry
            timeout *= 1.5;
        } catch (error) {
            console.warn(`[RecFix] Error in retry ${retry + 1}:`, error);
        }
    }
    return document.querySelectorAll(selector);
}

// Function to wait for specific element with content and retry
async function waitForElementContent(element, selector, timeout = 1000, maxRetries = 3) {
    for (let retry = 0; retry < maxRetries; retry++) {
        try {
            const result = await new Promise((resolve) => {
                const check = () => {
                    const el = element.querySelector(selector);
                    if (el && el.textContent.trim()) {
                        resolve(el);
                        return true;
                    }
                    return false;
                };

                if (check()) {
                    return;
                }

                const observer = new MutationObserver(() => {
                    if (check()) {
                        observer.disconnect();
                    }
                });

                observer.observe(element, {
                    childList: true,
                    subtree: true,
                    characterData: true,
                    attributes: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    resolve(element.querySelector(selector));
                }, timeout);
            });

            if (result && result.textContent.trim()) {
                return result;
            }

            console.log(`[RecFix] Retry ${retry + 1}/${maxRetries} for content in selector: ${selector}`);
            await new Promise(resolve => setTimeout(resolve, 100 * (retry + 1)));
        } catch (error) {
            console.warn(`[RecFix] Error in content retry ${retry + 1}:`, error);
        }
    }
    return null;
}

// Function to ensure video element is loaded
async function ensureVideoElementLoaded(element) {
    // Skip if element is hidden
    if (element.hasAttribute('hidden')) {
        return false;
    }

    try {
        // Try to scroll element into view to trigger lazy loading
        element.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
        
        // Wait a bit for lazy loading
        await new Promise(resolve => setTimeout(resolve, 300));

        // Wait for the title to be loaded
        const title = await waitForElementContent(
            element,
            '#video-title, .title, [title], yt-formatted-string.ytd-rich-grid-media, h3 a#video-title-link'
        );

        return Boolean(title && title.textContent.trim());
    } catch (error) {
        console.warn('[RecFix] Error ensuring video element is loaded:', error);
        return false;
    }
}

// Function to get video link from element
async function getVideoLink(element) {
    try {
        // Try direct link selectors first
        const directLink = element.querySelector('a#thumbnail, a.ytd-thumbnail, a[href*="watch?v="]');
        if (directLink) {
            return directLink;
        }

        // Try to find link in wrapper elements
        const wrappers = element.querySelectorAll('#dismissible, #content, #details, #meta');
        for (const wrapper of wrappers) {
            const link = wrapper.querySelector('a[href*="watch?v="]');
            if (link) {
                return link;
            }
        }

        // Try to find any link that contains a video ID
        const allLinks = element.querySelectorAll('a');
        for (const link of allLinks) {
            const href = link.href;
            if (href && (href.includes('watch?v=') || href.includes('youtu.be/'))) {
                return link;
            }
        }

        // Wait for lazy-loaded links
        await new Promise(resolve => setTimeout(resolve, 200));
        const lazyLink = element.querySelector('a[href*="watch?v="]');
        if (lazyLink) {
            return lazyLink;
        }

        return null;
    } catch (error) {
        console.warn('[RecFix] Error getting video link:', error);
        return null;
    }
}

// Function to get thumbnail URL from various YouTube sources
function getThumbnailUrl(videoId, element) {
    try {
        // Try getting from img tag first
        const thumbnailImg = element.querySelector('img#img, img#thumbnail');
        if (thumbnailImg) {
            // Try src attribute first
            if (thumbnailImg.src && !thumbnailImg.src.includes('empty.png')) {
                console.log('[RecFix] Found thumbnail from img src:', thumbnailImg.src);
                return thumbnailImg.src;
            }
            // Try data-thumb attribute next
            if (thumbnailImg.dataset.thumb) {
                console.log('[RecFix] Found thumbnail from data-thumb:', thumbnailImg.dataset.thumb);
                return thumbnailImg.dataset.thumb;
            }
        }

        // Try getting from background image
        const thumbnailDiv = element.querySelector('yt-image, #thumbnail');
        if (thumbnailDiv) {
            const style = window.getComputedStyle(thumbnailDiv);
            const bgImage = style.backgroundImage;
            if (bgImage && bgImage !== 'none') {
                const thumbnailUrl = bgImage.slice(5, -2); // Remove url() wrapper
                console.log('[RecFix] Found thumbnail from background image:', thumbnailUrl);
                return thumbnailUrl;
            }
        }

        // Fallback to YouTube's thumbnail URL pattern
        const fallbackUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        console.log('[RecFix] Using fallback thumbnail URL:', fallbackUrl);
        return fallbackUrl;
    } catch (error) {
        console.error('[RecFix] Error getting thumbnail URL:', {
            videoId,
            error: error.message,
            stack: error.stack
        });
        return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
}

// Function to check if an element is visible
function isElementVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && window.getComputedStyle(element).display !== 'none';
}

// Function to get channel name from element
function getChannelName(link) {
    try {
        // Try different container levels
        const containers = [
            link.closest('ytd-rich-item-renderer'),
            link.closest('ytd-compact-video-renderer'),
            link.closest('ytd-grid-video-renderer'),
            link.closest('[id*="video"]'),
            link.closest('[class*="video"]'),
            link.parentElement
        ].filter(Boolean); // Remove null/undefined

        for (const container of containers) {
            // Try all possible channel selectors
            const channelSelectors = [
                'a[href*="/channel/"]',
                'a[href*="/user/"]',
                'a[href*="/@"]',
                '#channel-name a',
                '#text.ytd-channel-name a',
                '.ytd-channel-name a',
                '#byline a',
                'ytd-channel-name a',
                '.yt-formatted-string[href*="/@"]',
                '.yt-formatted-string[href*="/channel/"]',
                '.yt-formatted-string[href*="/user/"]'
            ];

            for (const selector of channelSelectors) {
                const channelEl = container.querySelector(selector);
                if (channelEl && channelEl.textContent.trim()) {
                    const channelName = channelEl.textContent.trim();
                    console.log('[RecFix] Found channel name:', channelName);
                    return channelName;
                }
            }

            // Try finding any element with channel-related text
            const possibleChannelElements = container.querySelectorAll('[id*="channel"], [class*="channel"], [id*="author"], [class*="author"]');
            for (const el of possibleChannelElements) {
                if (el.textContent.trim()) {
                    const channelName = el.textContent.trim();
                    console.log('[RecFix] Found channel name from related element:', channelName);
                    return channelName;
                }
            }
        }

        console.warn('[RecFix] Could not find channel name for video');
        return 'Unknown Channel';
    } catch (error) {
        console.warn('[RecFix] Error getting channel name:', error);
        return 'Unknown Channel';
    }
}

// Function to scrape recommendations from YouTube page
async function scrapeRecommendations() {
    console.log('[RecFix] Starting recommendation scraping');
    const recommendations = new Set(); // Use Set to store unique recommendations

    try {
        // Wait for the page to load
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Find all video links
        const videoLinks = Array.from(document.querySelectorAll('a[href*="watch?v="]'))
            .filter(link => isElementVisible(link));

        console.log('[RecFix] Found video links:', videoLinks.length);

        if (videoLinks.length === 0) {
            throw new Error('No video links found on the page');
        }

        // Process each link
        for (const link of videoLinks) {
            try {
                // Get video ID
                const videoId = extractVideoId(link.href);
                if (!videoId) continue;

                // Get title
                let title = '';
                const possibleTitles = [
                    link.getAttribute('title'),
                    link.querySelector('#video-title')?.textContent,
                    link.querySelector('yt-formatted-string')?.textContent,
                    link.closest('[id*="video"]')?.querySelector('[title]')?.getAttribute('title'),
                    link.closest('[class*="video"]')?.querySelector('[title]')?.getAttribute('title')
                ];

                title = possibleTitles.find(t => t?.trim()) || '';
                if (!title) continue;

                // Get thumbnail
                const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

                // Get channel name using the new function
                const channel = getChannelName(link);

                // Create recommendation object
                const recommendation = {
                    id: videoId,
                    title: title.trim(),
                    url: link.href,
                    thumbnail,
                    channel,
                    metadata: ''
                };

                // Try to find metadata
                const container = link.closest('[id*="video"], [class*="video"]');
                if (container) {
                    const metadataSelectors = [
                        '[id*="metadata"]',
                        '[class*="metadata"]',
                        '.ytd-video-meta-block',
                        '.metadata-stats',
                        '.ytd-video-meta'
                    ];

                    for (const selector of metadataSelectors) {
                        const metadataEl = container.querySelector(selector);
                        if (metadataEl && metadataEl.textContent.trim()) {
                            recommendation.metadata = metadataEl.textContent.trim();
                            break;
                        }
                    }
                }

                // Add to recommendations if not already present
                const key = `${videoId}-${title}`; // Use both ID and title as key
                recommendations.add(JSON.stringify(recommendation));

            } catch (error) {
                console.warn('[RecFix] Error processing video link:', {
                    href: link.href,
                    error: error.message
                });
            }
        }

        // Convert recommendations to array
        const finalRecommendations = Array.from(recommendations).map(r => JSON.parse(r));

        console.log('[RecFix] Scraping results:', {
            found: videoLinks.length,
            processed: finalRecommendations.length
        });

        if (finalRecommendations.length === 0) {
            throw new Error('No valid recommendations could be scraped');
        }

        return finalRecommendations;

    } catch (error) {
        console.error('[RecFix] Scraping failed:', error);
        throw error;
    }
}

// Helper function to extract video ID from URL
function extractVideoId(url) {
    console.log('[RecFix] Extracting video ID from URL:', url);
    
    try {
        const urlObj = new URL(url);
        let videoId = null;

        if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        } else if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.slice(1);
        }

        if (!videoId) {
            console.warn('[RecFix] Could not extract video ID from URL:', JSON.stringify({
                url,
                hostname: urlObj.hostname,
                pathname: urlObj.pathname,
                search: urlObj.search
            }, null, 2));
        } else {
            console.log('[RecFix] Successfully extracted video ID:', videoId);
        }

        return videoId;
    } catch (error) {
        console.error('[RecFix] Error extracting video ID:', JSON.stringify({
            url,
            error: {
                message: error.message,
                stack: error.stack
            }
        }, null, 2));
        return null;
    }
}