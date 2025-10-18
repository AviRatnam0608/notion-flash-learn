import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting backfill process...');

    // Fetch all questions without descriptions
    const { data: questions, error: fetchError } = await supabase
      .from('questions')
      .select('id, problem_url, description')
      .or('description.is.null,description.eq.');

    if (fetchError) {
      throw new Error(`Failed to fetch questions: ${fetchError.message}`);
    }

    console.log(`Found ${questions?.length || 0} questions to backfill`);

    const results = {
      total: questions?.length || 0,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each question
    for (const question of questions || []) {
      try {
        console.log(`Fetching description for question ${question.id}: ${question.problem_url}`);

        // Fetch the LeetCode problem page
        const response = await fetch(question.problem_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        let description = '';

        // Extract description
        const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
        if (descMatch && descMatch[1]) {
          description = descMatch[1];
        } else {
          const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            description = titleMatch[1].replace(' - LeetCode', '');
          }
        }

        // Clean up
        description = description
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'")
          .trim();

        // Update the question with the description
        const { error: updateError } = await supabase
          .from('questions')
          .update({ description: description || 'Description not available' })
          .eq('id', question.id);

        if (updateError) {
          throw new Error(`Update failed: ${updateError.message}`);
        }

        results.success++;
        console.log(`✓ Successfully updated question ${question.id}`);

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorMsg = `Failed to process ${question.id}: ${errorMessage}`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log('Backfill complete:', results);

    return new Response(
      JSON.stringify(results),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in backfill process:', error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
