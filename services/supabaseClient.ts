
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kaeluplmhirdfpcfbpfq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZWx1cGxtaGlyZGZwY2ZicGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1Njk2NzUsImV4cCI6MjA4MTE0NTY3NX0.G_bph6mGAxu7VFyoRqLF75DgwU1R0TOo-Ol1DcZpRqQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
