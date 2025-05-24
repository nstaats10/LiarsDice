import React, { useEffect, useRef, useState } from 'react';

interface AdBannerProps {
  position: 'sidebar' | 'footer';
}

const AdBanner: React.FC<AdBannerProps> = ({ position }) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isAdInitialized, setIsAdInitialized] = useState(false);

  useEffect(() => {
    // Only initialize the ad if it hasn't been initialized yet
    if (window.adsbygoogle && adRef.current && !isAdInitialized) {
      try {
        // Remove any existing ad
        const existingAd = adRef.current.querySelector('.adsbygoogle');
        if (existingAd) {
          existingAd.remove();
        }

        // Create new ad element
        const adElement = document.createElement('ins');
        adElement.className = 'adsbygoogle';
        adElement.style.display = 'block';
        adElement.style.width = position === 'sidebar' ? '300px' : '728px';
        adElement.style.height = position === 'sidebar' ? '250px' : '90px';
        adElement.setAttribute('data-ad-client', 'ca-pub-YOURPUBLISHERID');
        adElement.setAttribute('data-ad-slot', position === 'sidebar' ? 'SIDEBAR_SLOT_ID' : 'FOOTER_SLOT_ID');
        adElement.setAttribute('data-ad-format', 'auto');
        adElement.setAttribute('data-full-width-responsive', 'true');

        // Add the ad element to the container
        adRef.current.appendChild(adElement);

        // Initialize the ad
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsAdInitialized(true);
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }

    // Cleanup function
    return () => {
      if (adRef.current) {
        const existingAd = adRef.current.querySelector('.adsbygoogle');
        if (existingAd) {
          existingAd.remove();
        }
      }
      setIsAdInitialized(false);
    };
  }, [position]);

  return (
    <div 
      ref={adRef}
      style={{
        width: position === 'sidebar' ? '300px' : '728px',
        height: position === 'sidebar' ? '250px' : '90px',
        margin: '0 auto',
        backgroundColor: '#f5ecd9',
        border: '2px solid #8b4513',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Placeholder for development only - remove in production */}
      {!isAdInitialized && (
        <div className="text-center text-[#5d4037] p-2">
          <p className="text-sm">{position === 'sidebar' ? '300x250' : '728x90'} Ad Space</p>
          <p className="text-xs italic">Replace with your AdSense code</p>
        </div>
      )}
    </div>
  );
};

export default AdBanner;