import { useNavigate } from 'react-router';
import { Button } from '../components/Button';
import { Home, Car } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-blue-100 rounded-full mb-4">
            <Car className="w-16 h-16 text-blue-800" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Slot Not Found</h2>
          <p className="text-gray-600 mb-2">
            Oops! The parking slot you're looking for doesn't exist.
          </p>
          <p className="text-gray-500 text-sm">
            Hindi makita ang parking slot na inyong hinahanap.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={() => navigate('/')} className="w-full">
            <Home className="w-4 h-4" />
            Return to Home
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} className="w-full">
            Go Back
          </Button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">
            💡 <strong>Tip:</strong> Use the navigation menu to find what you need!
          </p>
        </div>
      </div>
    </div>
  );
}
