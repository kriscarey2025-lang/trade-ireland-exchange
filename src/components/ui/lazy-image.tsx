import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  wrapperClassName?: string;
  /** Explicit width to prevent CLS */
  width?: number | string;
  /** Explicit height to prevent CLS */
  height?: number | string;
  /** Aspect ratio for container (e.g., "16/9", "1/1") - prevents CLS */
  aspectRatio?: string;
}

export function LazyImage({
  src,
  alt,
  className,
  fallback,
  wrapperClassName,
  width,
  height,
  aspectRatio,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Start loading 100px before entering viewport
        threshold: 0,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  // Build aspect ratio style to prevent CLS
  const containerStyle: React.CSSProperties = {};
  if (aspectRatio) {
    containerStyle.aspectRatio = aspectRatio;
  }

  return (
    <div 
      ref={imgRef} 
      className={cn("relative overflow-hidden", wrapperClassName)}
      style={containerStyle}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" aria-hidden="true" />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "transition-opacity duration-200",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}
