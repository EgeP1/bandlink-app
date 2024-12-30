import { AuthError, AuthResponse } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type AuthErrorType = {
  message: string;
  type: 'error' | 'warning';
};

export async function signUp(email: string, password: string): Promise<{ error?: AuthErrorType; success?: string }> {
  try {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return {
        error: {
          message: error.message === 'User already registered' 
            ? 'This email is already registered. Please sign in instead.'
            : error.message,
          type: 'error'
        }
      };
    }

    if (data.user) {
      return {
        success: 'Please check your email for a confirmation link to complete your registration.'
      };
    }

    return { error: { message: 'An unexpected error occurred', type: 'error' } };
  } catch (err) {
    return { error: { message: 'Failed to create account', type: 'error' } };
  }
}

export async function signIn(email: string, password: string): Promise<{ error?: AuthErrorType }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        error: {
          message: getSignInErrorMessage(error),
          type: error.message === 'Email not confirmed' ? 'warning' : 'error'
        }
      };
    }

    return {};
  } catch (err) {
    return { error: { message: 'Failed to sign in', type: 'error' } };
  }
}

function getSignInErrorMessage(error: AuthError): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password. Please try again.';
    case 'Email not confirmed':
      return 'Please confirm your email address before signing in.';
    default:
      return error.message;
  }
}