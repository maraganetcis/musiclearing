import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

const YouTubePlayer = forwardRef(({ videoId, onPlay, onPause, onEnd }, ref) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    playVideo: () => {
      if (playerRef.current) {
        playerRef.current.playVideo();
      }
    },
    pauseVideo: () => {
      if (playerRef.current) {
        playerRef.current.pauseVideo();
      }
    },
    seekTo: (seconds) => {
      if (playerRef.current) {
        playerRef.current.seekTo(seconds);
      }
    }
  }));

  useEffect(() => {
    if (!videoId || !window.YT) return;

    // 기존 플레이어 제거
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    // 새 플레이어 생성
    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0
      },
      events: {
        onReady: () => {
          // 플레이어를 거의 안보이게 설정 (오디오만 재생)
          const iframe = containerRef.current.querySelector('iframe');
          if (iframe) {
            iframe.style.opacity = '0.01';
            iframe.style.position = 'absolute';
            iframe.style.zIndex = '-1';
            iframe.style.pointerEvents = 'none';
          }
        },
        onStateChange: (event) => {
          switch (event.data) {
            case window.YT.PlayerState.PLAYING:
              onPlay?.();
              break;
            case window.YT.PlayerState.PAUSED:
              onPause?.();
              break;
            case window.YT.PlayerState.ENDED:
              onEnd?.();
              break;
            default:
              break;
          }
        }
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, onPlay, onPause, onEnd]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '0', paddingBottom: '56.25%' }}>
      <div 
        ref={containerRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          overflow: 'hidden'
        }} 
      />
      {!videoId && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6c757d',
          fontSize: '14px'
        }}>
          YouTube 동영상을 불러오는 중...
        </div>
      )}
    </div>
  );
});

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;
