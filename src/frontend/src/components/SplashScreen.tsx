import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Auto-complete after animation duration (shorter for reduced motion)
    const duration = prefersReducedMotion ? 2000 : 4000;
    const timer = setTimeout(() => {
      handleComplete();
    }, duration);

    return () => {
      clearTimeout(timer);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [prefersReducedMotion]);

  const handleComplete = () => {
    if (hasCompleted) return; // Prevent double invocation
    setHasCompleted(true);
    setIsVisible(false);
    // Small delay for fade-out animation
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const handleSkipClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    handleComplete();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center splash-galaxy-bg transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleComplete}
    >
      {/* Company name area with galaxy background */}
      <div className={`text-center ${prefersReducedMotion ? '' : 'animate-fade-in'}`}>
        <div className="splash-name-area">
          <h1 className="splash-company-title text-4xl font-bold tracking-wide text-white font-display sm:text-5xl md:text-6xl lg:text-7xl">
            GALAXY INTERNET
          </h1>
        </div>
      </div>

      {/* Skip button */}
      <Button
        variant="outline"
        size="lg"
        onClick={handleSkipClick}
        className="absolute bottom-12 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 border-white/20"
      >
        Skip
      </Button>

      {/* Decorative floating circles */}
      <div className={`absolute left-1/4 top-1/4 h-32 w-32 rounded-full bg-white/10 blur-3xl ${prefersReducedMotion ? '' : 'animate-float'}`}></div>
      <div className={`absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-white/10 blur-3xl ${prefersReducedMotion ? '' : 'animate-float'}`} style={{ animationDelay: '1s' }}></div>
    </div>
  );
}
