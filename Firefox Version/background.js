// Firefox-specific modifications
const REDIRECT_URL = browser.identity.getRedirectURL();
console.log('[RecFix] Extension initialized with redirect URL:', REDIRECT_URL);
const CLIENT_ID = "150330191959-62vmqd2sn4ntngcor25cmkuuo7u7dt8v.apps.googleusercontent.com";
const SCOPES = ["https://www.googleapis.com/auth/youtube", "https://www.googleapis.com/auth/youtube.force-ssl"];

// Constants
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = 'AIzaSyAzh1u4gCAxIHcP4b7tISgAKJoxhLUXDM8';
const DAILY_LIMIT = 2;
const STORAGE_KEY = 'fixFeedUsage';

// Add cache for video details
const videoCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

console.log('[RecFix] Background script initialized');

// Helper function to check and update rate limit
async function checkRateLimit() {
    console.log('[RecFix] Checking rate limit');
    try {
        const data = await browser.storage.local.get(STORAGE_KEY);
        const usage = data[STORAGE_KEY] || { count: 0, date: null };
        const today = new Date().toDateString();

        console.log('[RecFix] Current usage:', {
            usage,
            today,
            limit: DAILY_LIMIT
        });

        // Reset count if it's a new day
        if (usage.date !== today) {
            usage.count = 0;
            usage.date = today;
        }

        // Check if limit is reached
        if (usage.count >= DAILY_LIMIT) {
            const error = new Error('Daily limit reached (2 fixes per day). Please try again tomorrow.');
            error.code = 'RATE_LIMIT_EXCEEDED';
            throw error;
        }

        // Increment usage count
        usage.count++;
        await browser.storage.local.set({ [STORAGE_KEY]: usage });

        console.log('[RecFix] Updated usage:', {
            newCount: usage.count,
            date: usage.date,
            remaining: DAILY_LIMIT - usage.count
        });

        return {
            allowed: true,
            remaining: DAILY_LIMIT - usage.count
        };
    } catch (error) {
        console.error('[RecFix] Rate limit check error:', error);
        throw error;
    }
}

// Helper function to get remaining daily limit
async function getRemainingLimit() {
    try {
        const data = await browser.storage.local.get(STORAGE_KEY);
        const usage = data[STORAGE_KEY] || { count: 0, date: null };
        const today = new Date().toDateString();

        // Reset count if it's a new day
        if (usage.date !== today) {
            return DAILY_LIMIT;
        }

        return Math.max(0, DAILY_LIMIT - usage.count);
    } catch (error) {
        console.error('[RecFix] Error getting remaining limit:', error);
        return 0;
    }
}

// Helper function to check API key
function validateAPIKey() {
    console.log('[RecFix] Validating API key:', {
        keyExists: !!API_KEY,
        keyLength: API_KEY ? API_KEY.length : 0
    });

    if (!API_KEY) {
        console.error('[RecFix] API key is missing');
        const error = new Error('YouTube API key is missing. Please add your API key in the extension settings.');
        error.code = 'API_KEY_MISSING';
        throw error;
    }

    console.log('[RecFix] API key validation passed');
    return true;
}

// Helper function to handle API errors
function handleAPIError(error, endpoint) {
    console.error(`[RecFix] API Error in ${endpoint}:`, {
        error: error,
        type: typeof error,
        keys: Object.keys(error),
        stringified: JSON.stringify(error)
    });

    if (!error) {
        throw new Error(`Unknown API error in ${endpoint}`);
    }

    let errorMessage = 'Unknown error occurred';

    if (error.errors && error.errors.length > 0) {
        const apiError = error.errors[0];
        console.log('[RecFix] API Error Details:', {
            reason: apiError.reason,
            message: apiError.message,
            domain: apiError.domain,
            location: apiError.location
        });

        switch (apiError.reason) {
            case 'quotaExceeded':
                errorMessage = 'YouTube API quota exceeded. Please try again tomorrow.';
                break;
            case 'keyInvalid':
                errorMessage = 'The API key is invalid. Please check your YouTube Data API v3 key.';
                break;
            case 'keyExpired':
                errorMessage = 'The API key has expired. Please update your YouTube Data API v3 key.';
                break;
            default:
                errorMessage = apiError.message || `YouTube API error: ${apiError.reason}`;
        }
    } else if (error.code) {
        switch (error.code) {
            case 403:
                errorMessage = 'Access denied. Please check if YouTube Data API v3 is enabled for your API key.';
                break;
            case 400:
                errorMessage = 'Invalid request. Please check the video IDs are correct.';
                break;
            case 429:
                errorMessage = 'Too many requests. Please try again later.';
                break;
            default:
                errorMessage = `API error (${error.code}): ${error.message}`;
        }
    } else {
        errorMessage = error.message || 'Unknown YouTube API error';
    }

    throw new Error(errorMessage);
}

// Update message listener for Firefox
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[RecFix] Received message in background:', {
        action: request.action,
        sender: sender.id,
        timestamp: new Date().toISOString()
    });

    // Convert Chrome's callback-style to Promise-style for Firefox
    const handleMessage = async () => {
    switch (request.action) {
        case 'checkAPIKey':
                return { hasKey: true };

        case 'getRemainingLimit':
                try {
                    const remaining = await getRemainingLimit();
                    return { remaining };
                } catch (error) {
                    return { error: error.message };
                }

        case 'apiKeyUpdated':
            API_KEY = request.apiKey;
                return { success: true };

        case 'processManualUrls':
            try {
                    validateAPIKey();
                    const response = await handleManualUrls(request.urls);
                    return response;
            } catch (error) {
                    return { error: error.message };
            }

        case 'fixFeed':
                try {
                    const { remaining } = await checkRateLimit();
                    validateAPIKey();
                    const response = await generateImprovedRecommendations(request.selectedVideos);
                    return { ...response, remainingLimit: remaining };
                } catch (error) {
                    return { error: error.message };
                }

        case 'saveRecommendations':
                try {
                    const response = await saveRecommendationsToPlaylist(request.recommendations);
                    return response;
                } catch (error) {
                    return { error: error.message };
                }

        case 'handleOAuthCode':
                try {
                    const response = await handleOAuthCallback(request.code);
                    return response;
                } catch (error) {
                    return { error: error.message };
                }

        case 'initAuth':
                try {
                    const response = await initializeAuth();
                    return response;
                } catch (error) {
                    return { error: error.message };
                }

        default:
            console.warn('[RecFix] Unknown action received:', request.action);
                return { error: 'Unknown action' };
    }
    };

    // Return a Promise to Firefox
    return handleMessage();
});

// Handle manually input URLs
async function handleManualUrls(urls) {
    console.log('[RecFix] Processing manual URLs:', {
        count: urls.length,
        urls: urls.slice(0, 3) // Log first 3 URLs for debugging
    });
    
    if (!API_KEY) {
        console.error('[RecFix] API key not set');
        throw new Error('YouTube API key not set. Please configure it in the options.');
    }

    const videoIds = urls.map(url => extractVideoId(url)).filter(id => id);
    console.log('[RecFix] Extracted video IDs:', {
        total: urls.length,
        valid: videoIds.length,
        invalid: urls.length - videoIds.length
    });

    if (videoIds.length === 0) {
        throw new Error('No valid YouTube URLs found');
    }

    try {
        // Fetch video details
        console.time('[RecFix] Fetching video details');
        const videos = await fetchVideoDetails(videoIds);
        console.timeEnd('[RecFix] Fetching video details');
        console.log('[RecFix] Video details fetched:', {
            requested: videoIds.length,
            received: videos.length
        });

        // Get related videos
        console.time('[RecFix] Fetching related videos');
        const relatedVideos = await fetchRelatedVideos(videoIds[0]);
        console.timeEnd('[RecFix] Fetching related videos');
        console.log('[RecFix] Related videos fetched:', {
            count: relatedVideos.length,
            sourceVideo: videoIds[0]
        });

        return {
            recommendations: [...videos, ...relatedVideos]
        };
    } catch (error) {
        console.error('[RecFix] Error in handleManualUrls:', {
            error: error.message,
            stack: error.stack,
            videoIds
        });
        throw error;
    }
}

// Generate improved recommendations based on selected videos
async function generateImprovedRecommendations(selectedVideoIds) {
    console.log('[RecFix] Generating improved recommendations:', {
        selectedCount: selectedVideoIds.length,
        videos: selectedVideoIds
    });

    if (!selectedVideoIds.length) {
        throw new Error('No videos selected');
    }

    try {
        // Process videos in batches to avoid overwhelming the API
        const batchSize = 4;
        const batches = [];
        for (let i = 0; i < selectedVideoIds.length; i += batchSize) {
            batches.push(selectedVideoIds.slice(i, i + batchSize));
        }

        console.time('[RecFix] Fetching related videos');
        const allResults = [];
        
        for (const batch of batches) {
            const batchPromises = batch.map(videoId => 
                retryOperation(async () => {
                    try {
                        return await fetchRelatedVideos(videoId);
                    } catch (error) {
                        console.warn(`[RecFix] Failed to fetch related videos for ${videoId}:`, error);
                        return [];
                    }
                }, 2, 1000)
            );

            const batchResults = await Promise.all(batchPromises);
            allResults.push(...batchResults);

            // Add a small delay between batches
            if (batches.indexOf(batch) < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        console.timeEnd('[RecFix] Fetching related videos');

        // Combine all videos and remove duplicates
        const allVideos = allResults.flat();
        const uniqueVideos = Array.from(new Map(
            allVideos.map(video => [video.id, video])
        ).values());

        // Calculate relevance score based on multiple factors
        const videoScores = uniqueVideos.map(video => {
            const frequency = allVideos.filter(v => v.id === video.id).length;
            const recency = new Date(video.publishedAt).getTime();
            return {
                ...video,
                score: frequency * 10 + recency / 1000000000
            };
        });

        const recommendations = videoScores
            .sort((a, b) => b.score - a.score)
            .map(({ score, ...video }) => video)
            .slice(0, 50);

        console.log('[RecFix] Generated recommendations:', {
            sourceVideos: selectedVideoIds.length,
            totalVideos: allVideos.length,
            uniqueVideos: uniqueVideos.length,
            finalRecommendations: recommendations.length
        });

        if (recommendations.length === 0) {
            throw new Error('Could not generate any recommendations. Please try different videos.');
        }

        return { 
            recommendations,
            stats: {
                total: selectedVideoIds.length,
                processed: allResults.filter(r => r.length > 0).length,
                failed: allResults.filter(r => r.length === 0).length
            }
        };
    } catch (error) {
        console.error('[RecFix] Error generating recommendations:', {
            error: {
                message: error.message,
                name: error.name,
                stack: error.stack
            },
            selectedVideoIds
        });
        throw error;
    }
}

// Helper function to add retry logic with exponential backoff
async function retryOperation(operation, maxRetries = 3, initialDelay = 1000) {
    let lastError;
    let delay = initialDelay;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Add jitter to prevent thundering herd
                const jitter = Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay + jitter));
            delay *= 2; // Exponential backoff
        }
    }
    throw lastError;
}

// Save recommendations to a YouTube playlist
async function saveRecommendationsToPlaylist(videoIds) {
    console.log('[RecFix] Saving recommendations to playlist:', {
        count: videoIds.length,
        videos: videoIds.slice(0, 3)
    });

    try {
        // Get auth token
        const authHeader = await getAuthToken();
        if (!authHeader) {
            throw new Error('Not authenticated. Please try again.');
        }

        console.log('[RecFix] Using auth header:', {
            headerPresent: !!authHeader,
            headerLength: authHeader?.length,
            headerStart: authHeader?.substring(0, 12) + '...'
        });

        // Create a new playlist with retry
        const playlist = await retryOperation(async () => {
            const playlistResponse = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    snippet: {
                        title: `RecFix Recommendations ${new Date().toLocaleDateString()}`,
                        description: 'Curated recommendations by RecFix',
                        defaultLanguage: 'en'
                    },
                    status: {
                        privacyStatus: 'private'
                    }
                })
            });

            const responseData = await playlistResponse.json();
            
            if (!playlistResponse.ok) {
                console.error('[RecFix] Playlist creation failed:', {
                    status: playlistResponse.status,
                    statusText: playlistResponse.statusText,
                    response: responseData,
                    headers: {
                        sent: {
                            auth: !!authHeader,
                            contentType: true
                        },
                        received: Object.fromEntries(playlistResponse.headers.entries())
                    }
                });
                const error = new Error(`Failed to create playlist: ${playlistResponse.status} ${playlistResponse.statusText} - ${JSON.stringify(responseData.error || {})}`);
                error.status = playlistResponse.status;
                error.response = responseData;
                throw error;
            }

            console.log('[RecFix] Playlist creation response:', {
                id: responseData.id,
                title: responseData.snippet?.title,
                status: responseData.status?.privacyStatus,
                response: responseData
            });

            return responseData;
        });

        const playlistId = playlist.id;
        const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
        
        console.log('[RecFix] Successfully created playlist:', {
            playlistId,
            playlistUrl,
            title: playlist.snippet?.title,
            status: playlist.status?.privacyStatus
        });

        // Add videos to playlist with individual retries and rate limiting
        const results = [];
        for (const videoId of videoIds) {
            try {
                // Add a small delay between requests to avoid rate limiting
                if (results.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                await retryOperation(async () => {
                    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet`, {
                        method: 'POST',
                        headers: {
                            'Authorization': authHeader,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            snippet: {
                                playlistId: playlistId,
                                resourceId: {
                                    kind: 'youtube#video',
                                    videoId: videoId
                                }
                            }
                        })
                    });

                    const itemData = await response.json();

                    if (!response.ok) {
                        const error = new Error(`Failed to add video ${videoId}: ${response.status} ${response.statusText} - ${JSON.stringify(itemData.error || {})}`);
                        error.status = response.status;
                        error.response = itemData;
                        throw error;
                    }

                    console.log('[RecFix] Successfully added video to playlist:', {
                        videoId,
                        playlistId,
                        itemId: itemData.id
                    });

                    return itemData;
                });
                results.push({ videoId, success: true });
            } catch (error) {
                console.error('[RecFix] Failed to add video after retries:', {
                    videoId,
                    error: {
                        message: error.message,
                        status: error.status,
                        response: error.response
                    }
                });
                results.push({ videoId, success: false, error: error.message });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failureCount = videoIds.length - successCount;

        console.log('[RecFix] Playlist creation summary:', {
            total: videoIds.length,
            successful: successCount,
            failed: failureCount,
            playlistId,
            results
        });

        if (successCount === 0) {
            throw new Error('Failed to add any videos to the playlist');
        }

        return {
            success: true,
            playlistId,
            totalVideos: videoIds.length,
            addedVideos: successCount,
            failedVideos: failureCount
        };

    } catch (error) {
        console.error('[RecFix] Error saving recommendations:', {
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
                status: error.status
            }
        });
        throw new Error(`Failed to save recommendations: ${error.message}`);
    }
}

// Helper function to fetch video details from YouTube API
async function fetchVideoDetails(videoIds) {
    console.log('[RecFix] Fetching video details:', {
        count: videoIds.length,
        ids: videoIds
    });

    try {
        validateAPIKey();

        const params = new URLSearchParams({
            part: 'snippet',
            id: videoIds.join(','),
            key: API_KEY
        });

        console.time('[RecFix] YouTube API request - video details');
        const response = await fetch(`${YOUTUBE_API_BASE_URL}/videos?${params}`);
        const data = await response.json();
        console.timeEnd('[RecFix] YouTube API request - video details');

        if (!response.ok || data.error) {
            handleAPIError(data.error || { code: response.status, message: response.statusText }, 'videos');
        }

        const videos = data.items.map(item => ({
            id: item.id,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium.url,
            url: `https://www.youtube.com/watch?v=${item.id}`
        }));

        console.log('[RecFix] Video details fetched successfully:', {
            requested: videoIds.length,
            received: videos.length
        });

        return videos;
    } catch (error) {
        console.error('[RecFix] Error fetching video details:', {
            error: error.message,
            stack: error.stack,
            videoIds
        });
        throw error;
    }
}

// Helper function to fetch related videos from YouTube API
async function fetchRelatedVideos(videoId) {
    console.log('[RecFix] Fetching related videos for:', videoId);

    try {
        validateAPIKey();

        // Check cache first
        const cachedData = videoCache.get(videoId);
        if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
            console.log('[RecFix] Using cached data for:', videoId);
            return cachedData.videos;
        }

        // First get video details to use as search query
        const videoDetailsParams = new URLSearchParams({
            part: 'snippet',
            id: videoId,
            key: API_KEY
        });

        const videoResponse = await fetch(`${YOUTUBE_API_BASE_URL}/videos?${videoDetailsParams}`);
        const videoData = await videoResponse.json();

        if (!videoResponse.ok || videoData.error) {
            throw new Error('Could not fetch video details');
        }

        if (!videoData.items || videoData.items.length === 0) {
            throw new Error('Video not found');
        }

        const videoTitle = videoData.items[0].snippet.title;
        const channelTitle = videoData.items[0].snippet.channelTitle;
        const categoryId = videoData.items[0].snippet.categoryId;

        // Batch search parameters for efficiency
        const searchParams = new URLSearchParams({
            part: 'snippet',
            q: `${videoTitle} ${channelTitle}`,
            type: 'video',
            maxResults: '25', // Increased for better recommendations
            key: API_KEY,
            order: 'relevance',
            videoCategoryId: categoryId,
            safeSearch: 'none'
        });

        console.time(`[RecFix] YouTube API request - related videos ${videoId}`);
        const response = await fetch(`${YOUTUBE_API_BASE_URL}/search?${searchParams}`);
        const data = await response.json();
        console.timeEnd(`[RecFix] YouTube API request - related videos ${videoId}`);

        // Log the full response for debugging
        console.log('[RecFix] Full API Response:', {
            status: response.status,
            ok: response.ok,
            data: data,
            url: `${YOUTUBE_API_BASE_URL}/search?${searchParams}`
        });

        if (data.error) {
            throw new Error(data.error.message || 'YouTube API error occurred');
        }

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
        }

        if (!data.items) {
            throw new Error('No recommendations available for this video');
        }

        // Process videos with better error handling
        const videos = data.items
            .filter(item => item.id?.videoId !== videoId && item.id?.videoId && item.snippet)
            .map(item => ({
                id: item.id.videoId,
                title: item.snippet.title || 'Untitled',
                channel: item.snippet.channelTitle || 'Unknown Channel',
                thumbnail: item.snippet.thumbnails?.medium?.url || 
                          item.snippet.thumbnails?.default?.url || 
                          `https://i.ytimg.com/vi/${item.id.videoId}/default.jpg`,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                publishedAt: item.snippet.publishedAt,
                categoryId: categoryId
            }))
            .slice(0, 15); // Limit to top 15 most relevant

        console.log('[RecFix] Related videos processed:', {
            sourceVideo: videoId,
            totalItems: data.items.length,
            validVideos: videos.length,
            pageInfo: data.pageInfo,
            firstVideo: videos[0]
        });

        if (videos.length === 0) {
            throw new Error('No valid related videos found for this video');
        }

        // Cache the results
        videoCache.set(videoId, {
            videos,
            timestamp: Date.now()
        });

        return videos;
    } catch (error) {
        console.error('[RecFix] Error fetching related videos:', {
            videoId,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            }
        });
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
            console.warn('[RecFix] Could not extract video ID from URL:', {
                url,
                hostname: urlObj.hostname,
                pathname: urlObj.pathname,
                search: urlObj.search
            });
        } else {
            console.log('[RecFix] Successfully extracted video ID:', videoId);
        }

        return videoId;
    } catch (error) {
        console.error('[RecFix] Error extracting video ID:', {
            url,
            error: error.message,
            stack: error.stack
        });
        return null;
    }
}

// Get OAuth2 token - Firefox implementation
async function getAuthToken() {
    console.log('[RecFix] Getting auth token (Firefox)');
    
    try {
        // Get the redirect URL directly from Firefox
        const redirectURL = browser.identity.getRedirectURL();
        console.log('[RecFix] Using Firefox redirect URL:', redirectURL);
        console.log('[RecFix] Extension ID:', browser.runtime.id);
        
        const authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
        authUrl.searchParams.set('client_id', CLIENT_ID);
        authUrl.searchParams.set('response_type', 'token');
        authUrl.searchParams.set('redirect_uri', redirectURL);
        authUrl.searchParams.set('scope', SCOPES.join(' '));

        console.log('[RecFix] Full auth URL:', authUrl.toString());
        
        const responseUrl = await browser.identity.launchWebAuthFlow({
            interactive: true,
            url: authUrl.toString()
        });
        
        console.log('[RecFix] Got response URL:', responseUrl);
        
        const urlParams = new URLSearchParams(responseUrl.split('#')[1]);
        const accessToken = urlParams.get('access_token');
        
        if (!accessToken) {
            throw new Error('No access token found in response');
        }
        
        return `Bearer ${accessToken}`;
    } catch (error) {
        console.error('[RecFix] Error getting auth token:', error);
        throw error;
    }
}

// Initialize OAuth2 flow
async function initializeAuth() {
    console.log('[RecFix] Initializing OAuth2 flow');
    try {
        const token = await getAuthToken();
        if (token) {
            console.log('[RecFix] Successfully authenticated');
            return true;
        }
    } catch (error) {
        console.error('[RecFix] Authentication failed:', error);
        return false;
    }
}

// Handle OAuth2 callback
async function handleOAuthCallback(code) {
    console.log('[RecFix] Handling OAuth callback');
    try {
        const token = await getAuthToken();
        console.log('[RecFix] OAuth flow completed successfully');
        return { success: true };
    } catch (error) {
        console.error('[RecFix] OAuth callback failed:', error);
        return { success: false, error: error.message };
    }
} 