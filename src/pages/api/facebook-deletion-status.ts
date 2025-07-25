import { supabase } from '../../lib/supabase';

export async function handleFacebookDeletionStatus(req: Request) {
  try {
    const url = new URL(req.url);
    const confirmation_code = url.searchParams.get('confirmation_code');

    if (!confirmation_code) {
      return new Response(JSON.stringify({ error: 'No confirmation code provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user still exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', confirmation_code)
      .single();

    // If no profile found, deletion was successful
    return new Response(JSON.stringify({
      status: profile ? 'pending' : 'success',
      confirmation_code
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error checking Facebook data deletion status:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 