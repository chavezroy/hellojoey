'use client';

import { useEffect, useRef, useState } from 'react';

interface BackgroundVideoProps {
  videoUrl: string;
}

// Detect Safari browser
const isSafari = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isSafariUA = ua.indexOf('safari') > -1 && ua.indexOf('chrome') === -1;
  // Also check for Safari on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isSafariUA || isIOS;
};

export default function BackgroundVideo({ videoUrl }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const hasInteractedRef = useRef(false);
  const playAttemptedRef = useRef(false);

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set up video properties for Safari compatibility
    video.muted = true;
    video.volume = 0;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('playsinline', 'true');
    video.setAttribute('x-webkit-airplay', 'allow');
    video.preload = 'auto';
    
    // Check codec support (important for Safari)
    const canPlayH264 = video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
    const canPlayMP4 = video.canPlayType('video/mp4');
    console.log('Codec support check:', {
      H264: canPlayH264,
      MP4: canPlayMP4,
      browser: isSafari() ? 'Safari' : 'Other',
    });
    
    if (isSafari() && !canPlayH264 && !canPlayMP4) {
      console.warn('⚠️ Safari may not support this video codec. Video should be H.264 encoded.');
      setVideoError('Video codec not supported. The video needs to be encoded in H.264 format for Safari.');
    }
    
    // Log video source for debugging
    console.log('Video URL from props:', videoUrl);
    
    // Verify video URL is accessible (after a short delay to let the source tag set)
    setTimeout(() => {
      const fullVideoUrl = window.location.origin + videoUrl;
      fetch(fullVideoUrl, { method: 'HEAD' })
        .then((response) => {
          if (response.ok) {
            console.log('✓ Video file is accessible:', fullVideoUrl);
          } else {
            console.error('✗ Video file returned status:', response.status, fullVideoUrl);
            setVideoError(`Video file not found (HTTP ${response.status}). Please check the file exists at: ${videoUrl}`);
          }
        })
        .catch((error) => {
          console.warn('Could not verify video URL:', error);
          // Don't set error on fetch failure - let the video element handle it
        });
    }, 100);

    // Function to play video with better error handling
    const playVideo = async (): Promise<boolean> => {
      try {
        // Ensure video is loaded
        if (video.readyState < 2) {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Video load timeout'));
            }, 5000);
            
            const handleReady = () => {
              clearTimeout(timeout);
              resolve(true);
            };
            
            video.addEventListener('canplay', handleReady, { once: true });
            video.addEventListener('loadeddata', handleReady, { once: true });
            video.load();
          });
        }

        // For Safari, wait a bit more
        if (isSafari() && video.readyState < 3) {
          await new Promise((resolve) => {
            video.addEventListener('canplaythrough', resolve, { once: true });
            // Fallback timeout
            setTimeout(resolve, 2000);
          });
        }

        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
          setNeedsInteraction(false);
          setVideoError(null);
          return true;
        }
      } catch (error: any) {
        console.warn('Video play failed:', error);
        setVideoError(error.message || 'Failed to play video');
        if (error.name === 'NotAllowedError' || isSafari()) {
          setNeedsInteraction(true);
        }
        return false;
      }
      return false;
    };

    // Try to play initially (non-Safari browsers)
    if (!isSafari()) {
      const tryPlay = async () => {
        if (!playAttemptedRef.current) {
          playAttemptedRef.current = true;
          await playVideo();
        }
      };
      
      if (video.readyState >= 2) {
        tryPlay();
      } else {
        video.addEventListener('loadeddata', tryPlay, { once: true });
        video.addEventListener('canplay', tryPlay, { once: true });
      }
    } else {
      // Safari: always show interaction overlay
      setNeedsInteraction(true);
    }

    // Handle video events to keep it playing
    const handlePause = () => {
      if (!video.ended && hasInteractedRef.current && !isSafari()) {
        // Only auto-resume for non-Safari
        video.play().catch(() => {});
      }
    };

    const handleEnded = () => {
      video.currentTime = 0;
      if (hasInteractedRef.current) {
        video.play().catch(() => {});
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && video.paused && hasInteractedRef.current) {
        video.play().catch(() => {});
      }
    };

    // Set up event listeners
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle user interaction for all browsers (especially Safari)
    const handleInteraction = async (e: Event) => {
      if (hasInteractedRef.current) return;
      
      // For Safari, we need direct user interaction with the video element
      // So we'll handle it in the overlay click instead
      if (isSafari()) return;
      
      hasInteractedRef.current = true;
      const success = await playVideo();
      if (success) {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('mousedown', handleInteraction);
      }
    };

    // Add interaction listeners for non-Safari browsers
    if (!isSafari()) {
      document.addEventListener('click', handleInteraction, { passive: true });
      document.addEventListener('touchstart', handleInteraction, { passive: true });
      document.addEventListener('mousedown', handleInteraction, { passive: true });
    }

    // Periodic check to ensure video is playing (only after interaction)
    const playCheckInterval = setInterval(() => {
      if (video.paused && !video.ended && hasInteractedRef.current && !isSafari()) {
        video.play().catch(() => {});
      }
    }, 2000);

    return () => {
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (!isSafari()) {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('mousedown', handleInteraction);
      }
      clearInterval(playCheckInterval);
    };
  }, [videoUrl]);

  const handleOverlayClick = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const video = videoRef.current;
    if (!video) {
      console.error('Video element not found');
      return;
    }

    hasInteractedRef.current = true;
    
    try {
      // Ensure video is ready
      if (video.readyState < 2) {
        video.load();
        await new Promise((resolve) => {
          video.addEventListener('canplay', resolve, { once: true });
          setTimeout(resolve, 3000); // Timeout fallback
        });
      }

      // Play the video
      await video.play();
      setNeedsInteraction(false);
      setVideoError(null);
      console.log('Video started playing successfully');
    } catch (error: any) {
      console.error('Failed to play video:', error);
      setVideoError(error.message || 'Failed to play video. Please try again.');
      // Keep overlay visible so user can try again
    }
  };

  return (
    <>
      <video
        ref={videoRef}
        id="bg-video"
        autoPlay={!isSafari()}
        muted
        loop
        playsInline
        preload="auto"
        className="fixed top-0 left-0 w-full h-full object-cover -z-[2] opacity-35"
        style={{
          mixBlendMode: 'screen',
          WebkitMixBlendMode: 'screen',
          willChange: 'opacity',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          pointerEvents: 'none',
          backgroundColor: '#000000',
        } as React.CSSProperties & { WebkitMixBlendMode?: string; WebkitTransform?: string }}
        onError={(e) => {
          const video = e.currentTarget;
          const error = video.error;
          let errorMsg = 'Video failed to load';
          
          if (error) {
            const errorCodes: { [key: number]: string } = {
              1: 'MEDIA_ERR_ABORTED - Video loading aborted',
              2: 'MEDIA_ERR_NETWORK - Network error while loading video',
              3: 'MEDIA_ERR_DECODE - Video decoding error (codec issue)',
              4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Video format/codec not supported by this browser',
            };
            errorMsg = errorCodes[error.code] || `Error code ${error.code}: ${error.message}`;
            
            // Special handling for format not supported
            if (error.code === 4) {
              errorMsg = 'Video format not supported. The video may need to be re-encoded in H.264 format for Safari compatibility.';
            }
          }
          
          console.error('Video error details:', {
            error,
            errorCode: error?.code,
            errorMessage: error?.message,
            src: video.src,
            currentSrc: video.currentSrc,
            networkState: video.networkState,
            readyState: video.readyState,
            canPlayTypeMP4: video.canPlayType('video/mp4'),
            canPlayTypeH264: video.canPlayType('video/mp4; codecs="avc1.42E01E"'),
            userAgent: navigator.userAgent,
          });
          
          setVideoError(errorMsg);
          setNeedsInteraction(true);
        }}
        onLoadStart={() => {
          console.log('Video load started:', videoUrl);
        }}
        onProgress={() => {
          const video = videoRef.current;
          if (video && video.buffered.length > 0) {
            const buffered = video.buffered.end(video.buffered.length - 1);
            const duration = video.duration;
            if (duration > 0) {
              console.log(`Video loading: ${((buffered / duration) * 100).toFixed(1)}%`);
            }
          }
        }}
        onLoadedData={() => {
          console.log('Video loaded, readyState:', videoRef.current?.readyState);
        }}
        onCanPlay={() => {
          console.log('Video can play');
        }}
      >
        {/* Try H.264 codec first (Safari compatible) */}
        <source src={videoUrl} type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
        {/* Fallback to generic MP4 */}
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {isMounted && needsInteraction && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/70 pointer-events-auto z-[9999]"
          onClick={handleOverlayClick}
          onTouchStart={handleOverlayClick}
        >
          <div className="text-center p-8">
            <div className="text-neon-green text-lg sm:text-xl px-6 py-4 border-2 border-neon-green/50 rounded-lg bg-black/50 mb-4 cursor-pointer hover:bg-black/70 transition-colors">
            {videoError ? (
              <>
                <div className="mb-2">⚠️ {videoError}</div>
                {videoError.includes('codec') || videoError.includes('not supported') ? (
                  <div className="text-xs mt-2 text-neon-green/70" style={{ textTransform: 'none' }}>
                    <div className="mb-1">The video may need to be re-encoded in H.264 format.</div>
                    <div>Use: ffmpeg -i input.mp4 -c:v libx264 -c:a aac -movflags +faststart output.mp4</div>
                  </div>
                ) : null}
                <div className="text-sm mb-2" style={{ textTransform: 'none' }}>Video URL: {videoUrl}</div>
                <div className="text-sm">Click to retry</div>
              </>
            ) : (
              'Click anywhere to play video'
            )}
            </div>
            {isSafari() && (
              <div className="text-neon-green/70 text-xs mt-2">
                Safari requires user interaction to play video
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
