'use client';

import { useEffect } from 'react';

interface AdUnitProps {
    slotId: string;
    clientId: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    responsive?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export default function AdUnit({
    slotId,
    clientId,
    format = 'auto',
    responsive = true,
    className = '',
    style = { display: 'block' }
}: AdUnitProps) {

    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    if (!clientId || !slotId) return null;

    return (
        <div className={`adsense-container ${className}`}>
            <ins
                className="adsbygoogle"
                style={style}
                data-ad-client={clientId}
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            />
        </div>
    );
}
