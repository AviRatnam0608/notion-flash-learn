import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problemUrl } = await req.json();
    
    if (!problemUrl) {
      throw new Error('Problem URL is required');
    }

    console.log(`Fetching description for: ${problemUrl}`);

    // Fetch the LeetCode problem page
    const response = await fetch(problemUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LeetCode page: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract description from the HTML
    // LeetCode stores problem content in a specific format
    let description = '';
    
    // Try to find the description in various possible locations
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    if (descMatch && descMatch[1]) {
      description = descMatch[1];
    } else {
      // Fallback: try to extract from the page title or other meta tags
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        description = titleMatch[1].replace(' - LeetCode', '');
      }
    }

    // Clean up the description
    description = description
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .trim();

    console.log(`Successfully extracted description: ${description.substring(0, 100)}...`);

    return new Response(
      JSON.stringify({ 
        description: description || 'Description not available',
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching LeetCode description:', error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false,
        description: 'Unable to fetch description'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200  // Return 200 so the app doesn't crash
      }
    );
  }
});
