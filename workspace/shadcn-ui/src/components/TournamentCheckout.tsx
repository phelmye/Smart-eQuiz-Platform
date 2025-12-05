import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Users, 
  Calendar,
  Trophy,
  Loader2, 
  Shield, 
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface TournamentCheckoutProps {
  tournamentId: string;
  tournamentName: string;
  entryFee: number;
  startDate: string;
  maxParticipants: number;
  currentParticipants: number;
  onBack?: () => void;
  onSuccess?: (registrationId: string) => void;
}

export const TournamentCheckout: React.FC<TournamentCheckoutProps> = ({
  tournamentId,
  tournamentName,
  entryFee,
  startDate,
  maxParticipants,
  currentParticipants,
  onBack,
  onSuccess
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const spotsRemaining = maxParticipants - currentParticipants;
  const processingFee = entryFee * 0.029 + 0.30; // 2.9% + $0.30 (typical Stripe fee)
  const total = entryFee + processingFee;

  const handleCheckout = async () => {
    setProcessing(true);
    setError(null);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      // In production, this would integrate with payment processor
      const registrationId = `reg-${tournamentId}-${Date.now()}`;
      
      // Mock registration success
      console.log('✅ Tournament registration successful:', {
        tournamentId,
        registrationId,
        amount: total,
        timestamp: new Date().toISOString()
      });

      setSuccess(true);

      // Wait a moment to show success, then call callback
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(registrationId);
        }
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Registration Complete!</h2>
                <p className="text-gray-600 mt-2">
                  You're all set for {tournamentName}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="text-blue-900">
                  A confirmation email has been sent to your registered email address with tournament details.
                </p>
              </div>
              <Button onClick={onBack} className="w-full">
                View Tournament Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tournament
          </Button>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tournament Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tournament Registration</CardTitle>
              <CardDescription>Confirm your entry details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">{tournamentName}</h3>
                    <p className="text-sm text-gray-500">Entry Fee Tournament</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Starts:</span>
                    <span className="font-medium">
                      {new Date(startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Participants:</span>
                    <span className="font-medium">
                      {currentParticipants} / {maxParticipants}
                    </span>
                    {spotsRemaining <= 10 && (
                      <Badge variant="destructive" className="ml-auto">
                        Only {spotsRemaining} spots left!
                      </Badge>
                    )}
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <strong>Important:</strong> Entry fees are non-refundable once the tournament begins. 
                    Please ensure you can participate at the scheduled time.
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Entry Fee</span>
                  <span>${entryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Processing Fee</span>
                  <span>${processingFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Secure payment processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Credit / Debit Card
                  </Button>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3 py-2 border rounded-md"
                      disabled={processing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={processing}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={processing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border rounded-md"
                      disabled={processing}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 border rounded-md"
                      disabled={processing}
                    />
                    <p className="text-xs text-gray-500">Receipt will be sent to this email</p>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={processing || spotsRemaining === 0}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : spotsRemaining === 0 ? (
                    'Tournament Full'
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Complete Registration - ${total.toFixed(2)}
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                  <Shield className="h-3 w-3" />
                  <span>Secured by 256-bit SSL encryption</span>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                By completing this registration, you agree to our <button className="underline">Tournament Terms</button> and acknowledge the <strong>no refund policy</strong> for entry fees.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentCheckout;
