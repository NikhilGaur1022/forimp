import { supabase } from '../../lib/supabase';

export async function handleFacebookDataDeletion(req: Request) {
  try {
    // Verify the request is from Facebook
    const signed_request = req.body.signed_request;
    if (!signed_request) {
      return new Response(JSON.stringify({ error: 'No signed request received' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse the signed request
    const [encodedSig, payload] = signed_request.split('.');
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));

    // Get the user ID from the request
    const userId = data.user_id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'No user ID in request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete user data from your database
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      throw error;
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      throw authError;
    }

    // Return confirmation URL where Facebook can check deletion status
    return new Response(JSON.stringify({
      url: `${process.env.VITE_APP_URL}/api/facebook-deletion/status`,
      confirmation_code: userId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing Facebook data deletion request:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 