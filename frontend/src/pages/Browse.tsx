
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Search, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { sendEmailNotification, getUserEmail } from '@/lib/emailService';

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
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

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

    const formattedProfiles = data.map((profile) => ({
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
    const matchesSearch = !searchTerm || 
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.skillsOffered.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      profile.skillsWanted.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      profile.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAvailability = availabilityFilter === 'all' || 
      profile.availability.some(avail => avail.toLowerCase().includes(availabilityFilter.toLowerCase()));

    return matchesSearch && matchesAvailability;
  });

  const sendSwapRequest = async (targetUserId: string, targetUserName: string) => {
    if (!user?.id) return;

    // Get recipient email for notification
    const recipientEmail = await getUserEmail(targetUserId);

    const requestData = {
      from_user_id: user.id,
      from_user_name: user.name || 'User',
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
      // Send email notification if recipient has email
      if (recipientEmail) {
        await sendEmailNotification({
          to: recipientEmail,
          subject: `New Skill Swap Request from ${user.name}`,
          type: 'request_sent',
          requestData: {
            fromUserName: user.name || 'User',
            toUserName: targetUserName,
            message: requestData.message
          }
        });
      }

      toast({
        title: "Request sent!",
        description: `Your swap request has been sent to ${targetUserName}.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-foreground">Skill Swap Platform</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Swap request</span>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="weekday">Weekdays</SelectItem>
                <SelectItem value="weekend">Weekends</SelectItem>
                <SelectItem value="evening">Evenings</SelectItem>
                <SelectItem value="morning">Mornings</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative flex-1">
              <Input
                placeholder="Search by name, skill, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-20"
              />
              <Button 
                size="sm" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3"
              >
                <Search className="h-4 w-4 mr-1" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {filteredProfiles.map((profile, index) => (
            <div 
              key={profile.id} 
              className="bg-card border border-border rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                {/* Profile Photo */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    <img 
                      src={profilePhotos[index % profilePhotos.length]} 
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <User className="h-8 w-8 text-muted-foreground absolute inset-0 m-auto" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-background border border-border rounded-full px-1 py-0.5">
                    <span className="text-xs font-medium text-foreground">
                      {profile.rating}/5
                    </span>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground truncate">{profile.name}</h3>
                      {profile.location && (
                        <p className="text-sm text-muted-foreground truncate">{profile.location}</p>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => sendSwapRequest(profile.id, profile.name)}
                    >
                      Request
                    </Button>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    {profile.skillsOffered.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Skills offered:</span>
                        <div className="flex flex-wrap gap-1">
                          {profile.skillsOffered.slice(0, 3).map((skill, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="text-xs py-0.5 px-2 bg-primary/10 text-primary border-primary/20"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {profile.skillsOffered.length > 3 && (
                            <Badge variant="outline" className="text-xs py-0.5 px-2">
                              +{profile.skillsOffered.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {profile.skillsWanted.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Skills wanted:</span>
                        <div className="flex flex-wrap gap-1">
                          {profile.skillsWanted.slice(0, 3).map((skill, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-xs py-0.5 px-2 border-muted-foreground/30"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {profile.skillsWanted.length > 3 && (
                            <Badge variant="outline" className="text-xs py-0.5 px-2">
                              +{profile.skillsWanted.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
