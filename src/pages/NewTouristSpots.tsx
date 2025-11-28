"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Star, MapPin, Search, Heart, Eye, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TouristSpotDialog } from '@/components/admin/TouristSpotDialog';
import { LocationActionsPopover } from '@/components/LocationActionsPopover';

const categories = ['All', 'Beach', 'Mountain', 'Nature', 'Historical', 'Adventure', 'Cultural'];

export default function NewTouristSpots() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: spots, refetch } = useQuery({
    queryKey: ['tourist-spots'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tourist_spots')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('tourist_spots').delete().eq('id', id);
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tourist spot.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Tourist spot deleted successfully.',
      });
      refetch();
    }
  };

  const filteredSpots = spots?.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' ||
      spot.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col items-center text-center space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-primary">
            Discover Tourist Spots
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore amazing destinations and create unforgettable memories
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tourist spots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* CATEGORIES */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* ADD SPOT BUTTON */}
      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => { setSelectedItem(null); setDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Spot
          </Button>
        </div>
      )}

      {/* SPOTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpots?.map((spot) => (
          <Card
            key={spot.id}
            className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col min-h-[450px]"
          >
            {/* IMAGE */}
            <div className="aspect-video relative overflow-hidden bg-gray-100">
              {spot.image_url ? (
                <img
                  src={spot.image_url}
                  alt={spot.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 hover:bg-background/90 rounded-full"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Badge className="absolute top-2 left-2 bg-background/90 text-foreground border-0">
                {spot.category || 'N/A'}
              </Badge>
            </div>

            {/* CONTENT */}
            <CardContent className="p-4 flex flex-col flex-1">
              <div>
                <h3 className="font-semibold text-lg">{spot.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-primary">{spot.location || 'Location not specified'}</span>
                </div>
              </div>

              {spot.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1">
                  {spot.description}
                </p>
              )}

              {/* BOTTOM ACTIONS */}
              <div className="flex flex-col gap-2 mt-auto">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Half day</span>
                </div>

                {!isAdmin ? (
                  <LocationActionsPopover
                    name={spot.name}
                    location={spot.location}
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
                      onClick={() => { setSelectedItem(spot); setDialogOpen(true); }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDelete(spot.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* RATING */}
                <div className="text-center pt-2 border-t">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{spot.rating || '4.7'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">210 reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredSpots?.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No tourist spots found</p>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search' : 'Be the first to add one!'}
          </p>
        </div>
      )}

      {/* DIALOG */}
      {dialogOpen && (
        <TouristSpotDialog
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
