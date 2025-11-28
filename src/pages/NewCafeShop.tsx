import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Star, Coffee, Search, Clock, Heart, Eye, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CafeDialog } from '@/components/admin/CafeDialog';
import { LocationActionsPopover } from '@/components/LocationActionsPopover';

const cuisines = ['All', 'Local', 'Asian', 'Italian', 'American', 'Cafe'];

export default function NewCafeShop() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: cafes, refetch } = useQuery({
    queryKey: ['cafes'],
    queryFn: async () => {
      const { data } = await supabase
        .from('cafes')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('cafes').delete().eq('id', id);
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete cafe.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Cafe deleted successfully.',
      });
      refetch();
    }
  };

  const filteredCafes = cafes?.filter(cafe => {
    const matchesSearch = cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cafe.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = selectedCuisine === 'All' || 
      cafe.cuisine_type?.toLowerCase() === selectedCuisine.toLowerCase();
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col items-center text-center space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-primary">
            Discover Cafes & Restaurants
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover the best dining experiences
          </p>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cafes and restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {cuisines.map((cuisine) => (
            <Button
              key={cuisine}
              variant={selectedCuisine === cuisine ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCuisine(cuisine)}
              className="whitespace-nowrap"
            >
              {cuisine}
            </Button>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => { setSelectedItem(null); setDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Cafe
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCafes?.map((cafe) => (
          <Card key={cafe.id} className="overflow-hidden hover:shadow-lg transition-shadow group relative">
            {cafe.image_url && (
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={cafe.image_url} 
                  alt={cafe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background/90 rounded-full"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                {cafe.cuisine_type && (
                  <Badge className="absolute top-2 left-2 bg-background/90 text-foreground border-0">
                    {cafe.cuisine_type}
                  </Badge>
                )}
              </div>
            )}
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{cafe.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-primary">{cafe.location || 'Location not specified'}</span>
                </div>
              </div>
              
              {cafe.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {cafe.description}
                </p>
              )}

              {cafe.opening_hours && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground pt-2">
                  <Clock className="h-3 w-3" />
                  <span>{cafe.opening_hours}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{cafe.rating || '4.5'}</span>
                </div>
                {cafe.price_range && (
                  <span className="text-sm font-medium text-primary">{cafe.price_range}</span>
                )}
              </div>

              {!isAdmin ? (
                <LocationActionsPopover
                  name={cafe.name}
                  location={cafe.location}
                  trigger={
                    <Button className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  }
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => { setSelectedItem(cafe); setDialogOpen(true); }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDelete(cafe.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCafes?.length === 0 && (
        <div className="text-center py-12">
          <Coffee className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No cafes found</p>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search' : 'Be the first to add one!'}
          </p>
        </div>
      )}

      {dialogOpen && (
        <CafeDialog
          item={selectedItem}
          onClose={() => { setDialogOpen(false); setSelectedItem(null); }}
          onSave={() => {
            refetch();
            setDialogOpen(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}
