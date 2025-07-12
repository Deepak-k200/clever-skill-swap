
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Search, MapPin, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  location: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isPublic: boolean;
}

const Browse = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

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

    const formattedProfiles = data.map(profile => ({
      id: profile.user_id,
      name: profile.name,
      location: profile.location || '',
      skillsOffered: profile.skills_offered || [],
      skillsWanted: profile.skills_wanted || [],
      availability: profile.availability || [],
      isPublic: profile.is_public
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Browse Skills</h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, skill, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{profile.name}</span>
                </CardTitle>
                {profile.location && (
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.skillsOffered.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Can Teach:</h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.skillsOffered.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.skillsWanted.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Wants to Learn:</h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.skillsWanted.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.availability.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Available:
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {profile.availability.join(', ')}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => sendSwapRequest(profile.id, profile.name)}
                  className="w-full"
                  size="sm"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Swap Request
                </Button>
              </CardContent>
            </Card>
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
