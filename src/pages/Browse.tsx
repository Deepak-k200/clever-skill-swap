
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Search, MapPin, Clock, MessageSquare } from 'lucide-react';

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
    // Load mock profiles
    const mockProfiles: UserProfile[] = [
      {
        id: '2',
        name: 'Alice Johnson',
        location: 'New York, NY',
        skillsOffered: ['JavaScript', 'React', 'Node.js'],
        skillsWanted: ['Python', 'Machine Learning'],
        availability: ['Weekday Evenings', 'Weekend Afternoons'],
        isPublic: true
      },
      {
        id: '3',
        name: 'Bob Smith',
        location: 'San Francisco, CA',
        skillsOffered: ['Python', 'Data Science', 'SQL'],
        skillsWanted: ['React', 'UI/UX Design'],
        availability: ['Weekend Mornings', 'Weekend Evenings'],
        isPublic: true
      },
      {
        id: '4',
        name: 'Carol Davis',
        location: 'Austin, TX',
        skillsOffered: ['UI/UX Design', 'Figma', 'Adobe Creative Suite'],
        skillsWanted: ['Frontend Development', 'CSS'],
        availability: ['Weekday Afternoons', 'Weekend Afternoons'],
        isPublic: true
      },
      {
        id: '5',
        name: 'David Wilson',
        location: 'Seattle, WA',
        skillsOffered: ['Photography', 'Video Editing', 'Lightroom'],
        skillsWanted: ['Web Development', 'Digital Marketing'],
        availability: ['Weekday Evenings', 'Weekend Mornings'],
        isPublic: true
      }
    ];

    // Also load user profiles from localStorage
    const savedProfiles: UserProfile[] = [];
    for (let i = 1; i <= 10; i++) {
      const profile = localStorage.getItem(`profile_${i}`);
      if (profile) {
        const parsedProfile = JSON.parse(profile);
        if (parsedProfile.isPublic && i !== parseInt(user?.id || '0')) {
          savedProfiles.push({ ...parsedProfile, id: i.toString() });
        }
      }
    }

    setProfiles([...mockProfiles, ...savedProfiles]);
  }, [user?.id]);

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

  const sendSwapRequest = (targetUserId: string, targetUserName: string) => {
    // Get existing requests
    const existingRequests = JSON.parse(localStorage.getItem('swap_requests') || '[]');
    
    // Create new request
    const newRequest = {
      id: Date.now().toString(),
      fromUserId: user?.id,
      fromUserName: user?.name,
      toUserId: targetUserId,
      toUserName: targetUserName,
      message: `Hi ${targetUserName}! I'd love to connect for a skill exchange.`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save request
    localStorage.setItem('swap_requests', JSON.stringify([...existingRequests, newRequest]));
    
    toast({
      title: "Request sent!",
      description: `Your swap request has been sent to ${targetUserName}.`,
    });
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
