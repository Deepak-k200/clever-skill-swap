
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Search, 
  MessageSquare, 
  Settings, 
  LogOut,
  Home,
  Users
} from 'lucide-react';

const Navigation = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  if (!user) {
    return (
      <nav className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            SkillSwap
          </Link>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          SkillSwap
        </Link>
        
        <div className="flex items-center gap-6">
          <Button variant={isActive('/') ? 'default' : 'ghost'} size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
          
          <Button variant={isActive('/browse') ? 'default' : 'ghost'} size="sm" asChild>
            <Link to="/browse" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Browse
            </Link>
          </Button>
          
          <Button variant={isActive('/requests') ? 'default' : 'ghost'} size="sm" asChild>
            <Link to="/requests" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Requests
            </Link>
          </Button>
          
          <Button variant={isActive('/profile') ? 'default' : 'ghost'} size="sm" asChild>
            <Link to="/profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </Link>
          </Button>
          
          {isAdmin && (
            <Button variant={isActive('/admin') ? 'default' : 'ghost'} size="sm" asChild>
              <Link to="/admin" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
          
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
