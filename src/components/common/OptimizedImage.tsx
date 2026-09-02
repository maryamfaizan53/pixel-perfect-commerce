import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'width' | 'height'> {
    src: string;
    alt: string;
    className?: string;
    containerClassName?: string;
    aspectRatio?: "square" | "video" | "wide" | "auto";
    /** Intrinsic display width used to size the CDN request / srcSet. */
    width?: number;
    mobileWidth?: number;
    quality?: number;
    priority?: boolean;
    /** Passed straight through to the <img sizes> attribute. */
    sizes?: string;
    /** Optional pre-generated WebP source (e.g. a /public sibling). Rendered via <picture>. */
    webpSrc?: string;
    fallbackSrc?: string;
}

const RESPONSIVE_WIDTHS = [320, 480, 640, 768, 960, 1280, 1600];

/** Build a resized CDN URL for the providers we know how to talk to. */
const buildCdnUrl = (src: string, w: number, q: number): string => {
    try {
        const url = new URL(src, typeof window !== 'undefined' ? window.location.origin : 'https://a.b');

        if (url.hostname.includes('cdn.shopify.com')) {
            url.searchParams.set('width', String(w));
            if (!url.searchParams.has('quality')) url.searchParams.set('quality', String(q));
            return url.toString();
        }
        if (url.hostname.includes('images.unsplash.com')) {
            url.searchParams.set('w', String(w));
            url.searchParams.set('q', String(q));
            if (!url.searchParams.has('auto')) url.searchParams.set('auto', 'format');
            return url.toString();
        }
        return src;
    } catch {
        return src;
    }
};

const isResizable = (src: string) =>
    !!src && (src.includes('cdn.shopify.com') || src.includes('images.unsplash.com'));

export const OptimizedImage = ({
    src,
    alt,
    className,
    containerClassName,
    aspectRatio = "auto",
    width = 800,
    mobileWidth,
    quality = 78,
    priority = false,
    sizes,
    webpSrc,
    fallbackSrc = "/placeholder.svg",
    ...props
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '400px 0px',
        skip: priority,
    });

    const getAspectRatioClass = () => {
        switch (aspectRatio) {
            case "square": return "aspect-square";
            case "video": return "aspect-video";
            case "wide": return "aspect-[16/9]";
            default: return "";
        }
    };

    const resizable = isResizable(src);

    const mainSrc = resizable ? buildCdnUrl(src, width, quality) : src;

    const srcSet = resizable
        ? RESPONSIVE_WIDTHS
            .filter((w) => w <= width * 2)
            .map((w) => `${buildCdnUrl(src, w, quality)} ${w}w`)
            .join(', ')
        : undefined;

    const resolvedSizes =
        sizes ?? (resizable ? `(max-width: 768px) ${mobileWidth ?? Math.min(width, 640)}px, ${width}px` : undefined);

    const shouldShow = priority || inView;

    const imgEl = (
        <img
            src={error ? fallbackSrc : mainSrc}
            srcSet={error ? undefined : srcSet}
            sizes={error ? undefined : resolvedSizes}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
                setError(true);
                setIsLoaded(true);
            }}
            className={cn(
                "w-full h-full object-cover transition-opacity duration-500",
                isLoaded ? "opacity-100" : "opacity-0",
                className
            )}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "auto" : "async"}
            {...(priority ? { fetchpriority: "high" } : {})}
            {...props}
        />
    );

    return (
        <div
            ref={ref}
            className={cn(
                "relative overflow-hidden bg-muted",
                getAspectRatioClass(),
                containerClassName
            )}
        >
            {!isLoaded && <Skeleton className="absolute inset-0 z-0" />}

            {shouldShow && (
                webpSrc && !error ? (
                    <picture>
                        <source srcSet={webpSrc} type="image/webp" />
                        {imgEl}
                    </picture>
                ) : (
                    imgEl
                )
            )}
        </div>
    );
};
