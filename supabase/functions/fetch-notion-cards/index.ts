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
    const { databaseId } = await req.json();
    const notionApiKey = Deno.env.get('NOTION_API_KEY');

    if (!notionApiKey) {
      throw new Error('NOTION_API_KEY not configured');
    }

    console.log('Fetching Notion database:', databaseId);

    // Query the Notion database
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Notion API error:', errorText);
      throw new Error(`Notion API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Fetched pages:', data.results.length);

    // Transform Notion pages to flashcard format
    const flashcards = data.results.map((page: any) => {
      const props = page.properties;
      
      // Helper to extract text from Notion rich text
      const getText = (richText: any) => {
        if (!richText || !richText.length) return '';
        return richText.map((t: any) => t.plain_text).join('');
      };

      // Helper to extract URL
      const getUrl = (urlProp: any) => {
        return urlProp?.url || '';
      };

      // Helper to extract select value
      const getSelect = (selectProp: any) => {
        return selectProp?.select?.name || '';
      };

      return {
        id: page.id,
        title: getText(props.Name?.title) || getText(props.Title?.title) || 'Untitled',
        leetcodeUrl: getUrl(props['Leetcode URL']) || getUrl(props.URL),
        description: getText(props.Description?.rich_text),
        topic: getSelect(props.Topic) || getSelect(props.Category),
        code: getText(props.Code?.rich_text),
        explanation: getText(props.Explanation?.rich_text),
        attempts: [], // Will be managed locally for now
      };
    });

    console.log('Transformed flashcards:', flashcards.length);

    return new Response(
      JSON.stringify({ flashcards }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching Notion cards:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
