// utils/googleAuth.ts
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../config/supabase';

WebBrowser.maybeCompleteAuthSession();

export const signInWithGoogle = async () => {
  try {
    const redirectUrl = makeRedirectUri({
      scheme: 'agribot',
      path: 'auth/callback',
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,
      },
    });

    if (error) throw error;

    // Open the OAuth URL in browser
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === 'success') {
        // Extract the token from the URL
        const url = result.url;
        const params = new URLSearchParams(url.split('#')[1]);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;
          return { success: true, data: sessionData };
        }
      }
    }

    return { success: false, error: 'Authentication cancelled' };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    return { success: false, error: error.message || 'Failed to sign in with Google' };
  }
};
