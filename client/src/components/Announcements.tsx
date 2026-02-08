import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Announcement } from "@shared/schema";
import { ChevronRight, ChevronLeft, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Announcements() {
  const { data: activeAnnouncements, isLoading } = useQuery<Announcement[]>({
    queryKey: [api.announcements.active.path],
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!activeAnnouncements || activeAnnouncements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeAnnouncements]);

  if (isLoading) {
    return (
      <div className="w-full h-48 md:h-64 flex items-center justify-center bg-card rounded-3xl border border-border shadow-xl">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!activeAnnouncements || activeAnnouncements.length === 0) return null;

  const current = activeAnnouncements[currentIndex];

  const next = () => setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + activeAnnouncements.length) % activeAnnouncements.length);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-card border border-border shadow-2xl mb-12">
      <div className="flex flex-col md:flex-row min-h-[300px]">
        {/* Image Section */}
        <div className="w-full md:w-1/2 relative h-48 md:h-auto overflow-hidden">
          <img 
            src={current.imageUrl} 
            alt={current.title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-card/90 via-card/20 to-transparent" />
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center text-right">
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4 leading-tight">
            {current.title}
          </h2>
          {current.description && (
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {current.description}
            </p>
          )}
          
          {current.buttonText && current.buttonLink && (
            <a href={current.buttonLink} target="_blank" rel="noreferrer" className="inline-block">
              <Button size="lg" className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold px-8 rounded-xl gap-2">
                {current.buttonText}
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      {activeAnnouncements.length > 1 && (
        <>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {activeAnnouncements.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentIndex ? "bg-cyan-500 w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/20 backdrop-blur-sm text-foreground hover:bg-background/40"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/20 backdrop-blur-sm text-foreground hover:bg-background/40"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}
    </div>
  );
}
