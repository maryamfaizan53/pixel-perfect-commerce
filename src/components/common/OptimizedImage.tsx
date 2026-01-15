import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    containerClassName?: string;
    aspectRatio?: "square" | "video" | "wide" | "auto";
    width?: number;
    mobileWidth?: number;
    quality?: number;
    priority?: boolean;
    fallbackSrc?: string;
}

export const OptimizedImage = ({
    src,
    alt,
    className,
    containerClassName,
    aspectRatio = "auto",
    width,
    mobileWidth,
    quality = 80,
    priority = false,
    fallbackSrc = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    ...props
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: typeof window !== 'undefined' && window.innerWidth < 768 ? '100px 0px' : '300px 0px',
        skip: priority, // Don't skip if priority is needed immediately
    });

    const getAspectRatioClass = () => {
        switch (aspectRatio) {
            case "square": return "aspect-square";
            case "video": return "aspect-video";
            case "wide": return "aspect-[16/9]";
            default: return "";
        }
    };

    // Optimize Shopify or Unsplash URLs
    const optimizedSrc = React.useMemo(() => {
        if (!src) return src;

        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const targetWidth = isMobile && mobileWidth ? mobileWidth : width;
        const targetQuality = isMobile ? Math.min(quality, 75) : quality;

        let url = src;
        if (src.includes('cdn.shopify.com')) {
            const separator = url.includes('?') ? '&' : '?';
            if (targetWidth) url += `${separator}width=${targetWidth}`;
            if (targetQuality) url += `${url.includes('quality') ? '' : `&quality=${targetQuality}`}`;
        } else if (src.includes('images.unsplash.com')) {
            const separator = url.includes('?') ? '&' : '?';
            if (targetWidth) url += `${separator}w=${targetWidth}`;
            if (targetQuality) url += `&q=${targetQuality}`;
            if (!url.includes('auto=format')) url += '&auto=format';
        }
        return url;
    }, [src, width, mobileWidth, quality]);

    const shouldShow = priority || inView;

    return (
        <div
            ref={ref}
            className={cn(
                "relative overflow-hidden bg-muted",
                getAspectRatioClass(),
                containerClassName
            )}
        >
            {!isLoaded && (
                <Skeleton className="absolute inset-0 z-0" />
            )}

            {shouldShow && (
                <img
                    src={error ? fallbackSrc : optimizedSrc}
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
                    {...(priority ? { fetchpriority: "high" } : {})}
                    {...props}
                />
            )}
        </div>
    );
};
