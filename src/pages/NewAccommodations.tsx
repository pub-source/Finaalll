import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Star, Building2, Search, Heart, Eye, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AccommodationDialog } from '@/components/admin/AccommodationDialog';
import { LocationActionsPopover } from '@/components/LocationActionsPopover';

const types = ['All', 'Hotel', 'Resort', 'Hostel', 'Apartment', 'Villa'];

export default function NewAccommodations() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: accommodations, refetch } = useQuery({
    queryKey: ['accommodations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('accommodations')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('accommodations').delete().eq('id', id);
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete accommodation.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Accommodation deleted successfully.',
      });
      refetch();
    }
  };

  const filteredAccommodations = accommodations?.filter(acc => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === 'All' || acc.type?.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-6">
        <h1 className="text-4xl font-bold text-primary">Discover Accommodations</h1>
        <p className="text-muted-foreground">Find the perfect place to stay</p>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accommodations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {types.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="whitespace-nowrap"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setSelectedItem(null);
              setDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Hotel
          </Button>
        </div>
      )}

      {/* ---------- GRID FIXED ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">

        {filteredAccommodations?.map((acc) => (
          <Card
            key={acc.id}
            className="overflow-hidden hover:shadow-lg transition-shadow group relative h-full flex flex-col"
          >

            {/* Image */}
            {acc.image_url && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={acc.image_url}
                  alt={acc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />
              </div>
            )}

            {/* ---------- CONTENT ---------- */}
            <CardContent className="p-4 flex flex-col flex-1">

              <h3 className="font-semibold text-lg">{acc.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 text-primary" />
                <span className="text-primary">
                  {acc.location || 'Location not specified'}
                </span>
              </div>

              {acc.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {acc.description}
                </p>
              )}

              {acc.amenities && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {acc.amenities.slice(0, 3).map((a: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {a}
                    </Badge>
                  ))}
                </div>
              )}

              {/* ---------- BOTTOM AREA (ALWAYS ALIGNED) ---------- */}
              <div className="mt-auto pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{acc.rating || '4.5'}</span>
                  </div>

                  {acc.price_per_night && (
                    <span className="text-sm font-medium text-primary">
                      ₱{acc.price_per_night}/night
                    </span>
                  )}
                </div>

                {/* Buttons */}
                {!isAdmin ? (
                  <LocationActionsPopover
                    name={acc.name}
                    location={acc.location}
                    trigger={
                      <Button className="w-full mt-3 gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedItem(acc);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDelete(acc.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAccommodations?.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No accommodations found</p>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search' : 'Be the first to add one!'}
          </p>
        </div>
      )}

      {dialogOpen && (
        <AccommodationDialog
          item={selectedItem}
          onClose={() => {
            setDialogOpen(false);
            setSelectedItem(null);
          }}
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
