import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://inicfjsfdwcrpjjhhnzz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaWNmanNmZHdjcnBqamhobnp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUxODQzNywiZXhwIjoyMDc5MDk0NDM3fQ.svicYnIGtT-cZp428xQPFboITfQ5GVWDpz_XXaVqxvM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, password } = req.body;

  console.log('Register API called with:', { firstName, lastName, email, password: '***' });

  if (!firstName || !lastName || !email || !password) {
    console.log('Missing fields');
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    console.log('Attempting insert into users table');
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name: firstName,
          last_name: lastName,
          email,
          password, // Note: Storing password in plain text is insecure; consider hashing
        },
      ]);

    if (insertError) {
      console.log('Insert error:', insertError);
      return res.status(400).json({ error: insertError.message });
    }

    console.log('Insert successful');
    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.log('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
