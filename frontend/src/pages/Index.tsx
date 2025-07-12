
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { ArrowRight, Users, Search, MessageSquare, Shield } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Welcome to SkillSwap
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect, learn, and grow through skill exchange
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <Search className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle>Browse Skills</CardTitle>
                <CardDescription>
                  Discover people with skills you want to learn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/browse">
                    Start Browsing <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle>Swap Requests</CardTitle>
                <CardDescription>
                  Manage your skill exchange requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/requests">
                    View Requests <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  Update your skills and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/profile">
                    Edit Profile <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Exchange Skills, Build Connections
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join SkillSwap to share what you know and learn what you need. 
            Connect with others for meaningful skill exchanges.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/register">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Share Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                List your expertise and help others learn
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Search className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Find Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Search for people who can teach you new skills
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Send requests and arrange skill exchanges
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Safe Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Moderated community with user profiles
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
