/**
 * Login Page
 *
 * Allows partners to authenticate with their partner number and PIN.
 * Uses react-hook-form + zod for type-safe validation.
 */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

export default function LoginPage() {
  const { login } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      partnerNumber: '',
      pin: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({
        partner_number: data.partnerNumber, // Already trimmed and uppercased by schema
        pin: data.pin,
      });
      // Navigation handled by login function
    } catch (error) {
      // Error toast handled by login function
      // Form stays enabled for retry
    }
  };

  const isLoading = form.formState.isSubmitting;

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="partnerNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner Number</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="e.g., ADMIN001"
                        autoComplete="username"
                        autoFocus
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="4-digit PIN"
                        autoComplete="current-password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Enter your 4-digit PIN</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
