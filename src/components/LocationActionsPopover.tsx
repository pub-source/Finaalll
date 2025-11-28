import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MapPin, Map, History, Navigation } from 'lucide-react';

interface LocationActionsPopoverProps {
  name: string;
  location?: string;
  trigger: React.ReactNode;
}

export function LocationActionsPopover({ name, location, trigger }: LocationActionsPopoverProps) {
  const handleGetRoute = () => {
    if (location) {
      const query = encodeURIComponent(location);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
    }
  };

  const handleViewOnMap = () => {
    if (location) {
      const query = encodeURIComponent(location);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-background border shadow-lg z-[100]" align="center">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary border-b pb-3">
            <MapPin className="h-5 w-5" />
            <h3 className="font-semibold">Locations</h3>
          </div>
          
          <div className="space-y-2">
            <p className="font-semibold text-foreground text-sm">{name}</p>
            <p className="text-xs text-muted-foreground">{location || 'Location not specified'}</p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleGetRoute}
              className="w-full justify-start gap-3 h-10 bg-primary hover:bg-primary/90"
              disabled={!location}
            >
              <Navigation className="h-4 w-4" />
              Get Route from Current Location
            </Button>
            
            <Button 
              onClick={handleViewOnMap}
              variant="secondary"
              className="w-full justify-start gap-3 h-10"
              disabled={!location}
            >
              <Map className="h-4 w-4" />
              View on Map
            </Button>
            
            <Button 
              variant="outline"
              className="w-full justify-start gap-3 h-10"
            >
              <History className="h-4 w-4" />
              View History
            </Button>
          </div>

          {!location && (
            <p className="text-xs text-muted-foreground text-center">
              Route requires location permission for accurate directions
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
