
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Users, MessageSquare, Trash2, Megaphone, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  location: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isPublic: boolean;
}

interface SwapRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<SwapRequest[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  const loadData = () => {
    // Load all profiles
    const allProfiles: UserProfile[] = [];
    for (let i = 1; i <= 10; i++) {
      const profile = localStorage.getItem(`profile_${i}`);
      if (profile) {
        const parsedProfile = JSON.parse(profile);
        allProfiles.push({ ...parsedProfile, id: i.toString() });
      }
    }
    setProfiles(allProfiles);

    // Load all requests
    const allRequests = JSON.parse(localStorage.getItem('swap_requests') || '[]');
    setRequests(allRequests);
  };

  const deleteUser = (userId: string) => {
    localStorage.removeItem(`profile_${userId}`);
    
    // Also remove any requests involving this user
    const updatedRequests = requests.filter(
      req => req.fromUserId !== userId && req.toUserId !== userId
    );
    localStorage.setItem('swap_requests', JSON.stringify(updatedRequests));
    
    loadData();
    toast({
      title: "User deleted",
      description: "The user and all associated data has been removed.",
    });
  };

  const deleteRequest = (requestId: string) => {
    const updatedRequests = requests.filter(req => req.id !== requestId);
    localStorage.setItem('swap_requests', JSON.stringify(updatedRequests));
    setRequests(updatedRequests);
    
    toast({
      title: "Request deleted",
      description: "The swap request has been removed.",
    });
  };

  const broadcastMessage = () => {
    const message = prompt("Enter message to broadcast to all users:");
    if (message) {
      alert(`Broadcasting: ${message}`);
      toast({
        title: "Message broadcasted",
        description: "Your message has been sent to all users.",
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Panel
          </h1>
          <Button onClick={broadcastMessage} className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Broadcast Message
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profiles.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Profiles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profiles.filter(p => p.isPublic).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* User Management */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </h2>
            <div className="space-y-4">
              {profiles.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No users found.</p>
                  </CardContent>
                </Card>
              ) : (
                profiles.map((profile) => (
                  <Card key={profile.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{profile.name}</CardTitle>
                          <CardDescription>{profile.location || 'No location'}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={profile.isPublic ? "default" : "secondary"}>
                            {profile.isPublic ? "Public" : "Private"}
                          </Badge>
                          <Button
                            onClick={() => deleteUser(profile.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {profile.skillsOffered.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Offers: </span>
                            <span className="text-sm text-muted-foreground">
                              {profile.skillsOffered.join(', ')}
                            </span>
                          </div>
                        )}
                        {profile.skillsWanted.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Wants: </span>
                            <span className="text-sm text-muted-foreground">
                              {profile.skillsWanted.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Request Management */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Swap Requests
            </h2>
            <div className="space-y-4">
              {requests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No swap requests found.</p>
                  </CardContent>
                </Card>
              ) : (
                requests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-sm">
                            {request.fromUserName} → {request.toUserName}
                          </CardTitle>
                          <CardDescription>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              request.status === 'accepted' ? 'default' :
                              request.status === 'rejected' ? 'destructive' : 'outline'
                            }
                          >
                            {request.status}
                          </Badge>
                          <Button
                            onClick={() => deleteRequest(request.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {request.message}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
