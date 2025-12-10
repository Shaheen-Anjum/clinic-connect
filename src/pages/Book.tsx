import { useParams, Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BookingCard } from '@/components/BookingCard';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Book = () => {
  const { slotType } = useParams<{ slotType: string }>();
  const navigate = useNavigate();

  // Validate slotType
  if (slotType !== 'morning' && slotType !== 'evening') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-lg mx-auto space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <div className="text-center space-y-2 mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Book {slotType === 'morning' ? 'Morning' : 'Evening'} Appointment
            </h1>
            <p className="text-muted-foreground">
              Fill in your details to secure your slot
            </p>
          </div>

          <BookingCard slotType={slotType} />
        </div>
      </main>
    </div>
  );
};

export default Book;
