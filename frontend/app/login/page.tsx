/**
 * Login Page
 *
 * Allows partners to authenticate with their partner number and PIN.
 */
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const { login } = useAuth();
  const [partnerNumber, setPartnerNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!partnerNumber || !pin) {
      return; // Form validation will show required messages
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return; // HTML validation will handle this
    }

    setLoading(true);
    try {
      await login({
        partner_number: partnerNumber,
        pin,
      });
      // Navigation handled by login function
    } catch (error) {
      // Error toast handled by login function
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome to SirenBase</CardTitle>
          <CardDescription>
            Enter your partner number and PIN to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partnerNumber">Partner Number</Label>
              <Input
                id="partnerNumber"
                type="text"
                placeholder="e.g., ADMIN001"
                value={partnerNumber}
                onChange={(e) => setPartnerNumber(e.target.value.toUpperCase())}
                disabled={loading}
                required
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                placeholder="4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
              />
              <p className="text-xs text-muted-foreground">Enter your 4-digit PIN</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
