import { Heart, Leaf } from 'lucide-react';

export function MinimalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border/30">
      <div className="container py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Leaf className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">HomeoClinic</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-border" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {currentYear} All rights reserved
          </p>
          <div className="hidden sm:block h-4 w-px bg-border" />
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
            Made with 
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 animate-pulse" /> 
            for better health
          </p>
        </div>
      </div>
    </footer>
  );
}
