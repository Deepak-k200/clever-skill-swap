
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Search, MapPin, Clock, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  location: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isPublic: boolean;
  rating?: number;
}

const Browse = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Sample profile photos for demo purposes
  const profilePhotos = [
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face'
  ];

  useEffect(() => {
    loadProfiles();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          loadProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_public', true)
      .neq('user_id', user?.id || '');

    if (error) {
      console.error('Error loading profiles:', error);
      return;
    }

    const formattedProfiles = data.map((profile, index) => ({
      id: profile.user_id,
      name: profile.name,
      location: profile.location || '',
      skillsOffered: profile.skills_offered || [],
      skillsWanted: profile.skills_wanted || [],
      availability: profile.availability || [],
      isPublic: profile.is_public,
      rating: Math.floor(Math.random() * 2) + 4 // Random rating between 4-5
    }));

    setProfiles(formattedProfiles);
  };

  const filteredProfiles = profiles.filter(profile => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      profile.name.toLowerCase().includes(search) ||
      profile.skillsOffered.some(skill => skill.toLowerCase().includes(search)) ||
      profile.skillsWanted.some(skill => skill.toLowerCase().includes(search)) ||
      profile.location.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProfiles = filteredProfiles.slice(startIndex, startIndex + itemsPerPage);

  const sendSwapRequest = async (targetUserId: string, targetUserName: string) => {
    if (!user?.id) return;

    const requestData = {
      from_user_id: user.id,
      from_user_name: user.name,
      to_user_id: targetUserId,
      to_user_name: targetUserName,
      message: `Hi ${targetUserName}! I'd love to connect for a skill exchange.`,
      status: 'pending'
    };

    const { error } = await supabase
      .from('swap_requests')
      .insert(requestData);

    if (error) {
      console.error('Error sending request:', error);
      toast({
        title: "Error",
        description: "Failed to send swap request. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Request sent!",
        description: `Your swap request has been sent to ${targetUserName}.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Swap Request</h1>
          
          {/* Search and Filter Bar */}
          <div className="flex gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, skill, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Button size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Cards */}
        <div className="space-y-4 mb-8">
          {paginatedProfiles.map((profile, index) => (
            <Card key={profile.id} className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Profile Photo */}
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={profilePhotos[index % profilePhotos.length]} 
                      alt={profile.name} 
                    />
                    <AvatarFallback className="bg-muted text-lg font-semibold">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{profile.name}</h3>
                        {profile.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {profile.location}
                          </p>
                        )}
                        {profile.rating && (
                          <p className="text-sm text-muted-foreground">
                            Rating: {profile.rating}/5
                          </p>
                        )}
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-500">Pending</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      {profile.skillsOffered.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-foreground">Skills Offered: </span>
                          <div className="inline-flex flex-wrap gap-1 ml-2">
                            {profile.skillsOffered.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {profile.skillsOffered.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.skillsOffered.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {profile.skillsWanted.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-foreground">Skills Wanted: </span>
                          <div className="inline-flex flex-wrap gap-1 ml-2">
                            {profile.skillsWanted.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {profile.skillsWanted.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{profile.skillsWanted.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm 
                ? "No profiles match your search criteria." 
                : "No public profiles available at the moment."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
