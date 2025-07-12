
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Check, X, Clock, Send, Trash2 } from 'lucide-react';

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

const Requests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<SwapRequest[]>([]);

  useEffect(() => {
    loadRequests();
  }, [user?.id]);

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem('swap_requests') || '[]');
    setRequests(allRequests);
  };

  const sentRequests = requests.filter(req => req.fromUserId === user?.id);
  const receivedRequests = requests.filter(req => req.toUserId === user?.id);

  const handleAcceptRequest = (requestId: string) => {
    const updatedRequests = requests.map(req =>
      req.id === requestId ? { ...req, status: 'accepted' as const } : req
    );
    localStorage.setItem('swap_requests', JSON.stringify(updatedRequests));
    setRequests(updatedRequests);
    
    const request = requests.find(req => req.id === requestId);
    toast({
      title: "Request accepted!",
      description: `You accepted the swap request from ${request?.fromUserName}.`,
    });
  };

  const handleRejectRequest = (requestId: string) => {
    const updatedRequests = requests.map(req =>
      req.id === requestId ? { ...req, status: 'rejected' as const } : req
    );
    localStorage.setItem('swap_requests', JSON.stringify(updatedRequests));
    setRequests(updatedRequests);
    
    toast({
      title: "Request rejected",
      description: "The swap request has been rejected.",
    });
  };

  const handleDeleteRequest = (requestId: string) => {
    const updatedRequests = requests.filter(req => req.id !== requestId);
    localStorage.setItem('swap_requests', JSON.stringify(updatedRequests));
    setRequests(updatedRequests);
    
    toast({
      title: "Request deleted",
      description: "The swap request has been deleted.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="default"><Check className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Swap Requests</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Received Requests */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Send className="h-5 w-5" />
              Received Requests ({receivedRequests.length})
            </h2>
            <div className="space-y-4">
              {receivedRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No requests received yet.</p>
                  </CardContent>
                </Card>
              ) : (
                receivedRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{request.fromUserName}</CardTitle>
                          <CardDescription>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {request.message}
                      </p>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleAcceptRequest(request.id)}
                            size="sm"
                            className="flex-1"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            onClick={() => handleRejectRequest(request.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sent Requests */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Send className="h-5 w-5 rotate-180" />
              Sent Requests ({sentRequests.length})
            </h2>
            <div className="space-y-4">
              {sentRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No requests sent yet.</p>
                  </CardContent>
                </Card>
              ) : (
                sentRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{request.toUserName}</CardTitle>
                          <CardDescription>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(request.status)}
                          {request.status === 'pending' && (
                            <Button
                              onClick={() => handleDeleteRequest(request.id)}
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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

export default Requests;
