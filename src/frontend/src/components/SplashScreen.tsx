import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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
    setIsVisible(false);
    // Small delay for fade-out animation
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center splash-galaxy-bg transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleComplete}
    >
      {/* Company name and tagline container */}
      <div className="splash-content-container flex flex-col items-center justify-center gap-4 px-6">
        {/* Company Name - Stylized Text with Display Font */}
        <div className="splash-company-name">
          <h1 className="splash-company-text text-center text-4xl font-black uppercase tracking-wider font-display sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            <span className="splash-word-star">STAR</span>{' '}
            <span className="splash-word-maharashtra">MAHARASHTRA</span>{' '}
            <span className="splash-word-galaxy">GALAXY</span>{' '}
            <span className="splash-word-internet">INTERNET</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="splash-tagline text-center text-xl font-semibold text-primary-foreground sm:text-2xl md:text-3xl lg:text-4xl">
          Connect to the Future with Internet at Light Speed.
        </p>
      </div>

      {/* Skip button */}
      <Button
        variant="outline"
        size="lg"
        onClick={handleComplete}
        className="splash-skip-button absolute bottom-12 bg-primary-foreground/10 text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/20"
      >
        Skip
      </Button>

      {/* Decorative elements */}
      <div className="splash-circle-1 absolute left-1/4 top-1/4 h-32 w-32 rounded-full bg-primary-foreground/10 blur-3xl"></div>
      <div className="splash-circle-2 absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-primary-foreground/10 blur-3xl"></div>
    </div>
  );
}
