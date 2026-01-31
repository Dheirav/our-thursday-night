import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Genre mapping for TMDB
const GENRES: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  science_fiction: 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

// Language mapping
const LANGUAGES: Record<string, string> = {
  english: 'en',
  hindi: 'hi',
  spanish: 'es',
  french: 'fr',
  german: 'de',
  japanese: 'ja',
  korean: 'ko',
  chinese: 'zh',
  italian: 'it',
  portuguese: 'pt',
  russian: 'ru',
  tamil: 'ta',
  telugu: 'te',
  malayalam: 'ml',
  bengali: 'bn',
};

interface SearchFilters {
  query?: string;
  genre?: string;
  year?: number;
  language?: string;
  actor?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const filters: SearchFilters = await req.json();

    if (!TMDB_API_KEY) {
      console.error('TMDB_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Movie search is not configured. Please add TMDB_API_KEY.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let searchUrl: string;
    let actorId: number | null = null;

    // If actor filter is provided, first search for the actor to get their ID
    if (filters.actor && filters.actor.trim().length >= 2) {
      const actorSearchUrl = `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(filters.actor)}&include_adult=false`;
      console.log(`Searching for actor: "${filters.actor}"`);
      
      const actorResponse = await fetch(actorSearchUrl);
      if (actorResponse.ok) {
        const actorData = await actorResponse.json();
        if (actorData.results && actorData.results.length > 0) {
          actorId = actorData.results[0].id;
          console.log(`Found actor ID: ${actorId}`);
        }
      }
    }

    // If we have a text query, use search endpoint
    if (filters.query && filters.query.trim().length >= 2) {
      searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(filters.query)}&include_adult=false&language=en-US&page=1`;
      
      // Add year filter to search
      if (filters.year) {
        searchUrl += `&year=${filters.year}`;
      }
      
      console.log(`Searching for movies: "${filters.query}"`);
    } else {
      // Use discover endpoint for filter-based browsing
      searchUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&language=en-US&page=1&sort_by=popularity.desc`;
      
      // Add genre filter
      if (filters.genre) {
        const genreId = GENRES[filters.genre.toLowerCase().replace(' ', '_')];
        if (genreId) {
          searchUrl += `&with_genres=${genreId}`;
          console.log(`Filtering by genre: ${filters.genre} (ID: ${genreId})`);
        }
      }
      
      // Add year filter
      if (filters.year) {
        searchUrl += `&primary_release_year=${filters.year}`;
        console.log(`Filtering by year: ${filters.year}`);
      }
      
      // Add language filter
      if (filters.language) {
        const langCode = LANGUAGES[filters.language.toLowerCase()];
        if (langCode) {
          searchUrl += `&with_original_language=${langCode}`;
          console.log(`Filtering by language: ${filters.language} (${langCode})`);
        }
      }
      
      // Add actor filter
      if (actorId) {
        searchUrl += `&with_cast=${actorId}`;
        console.log(`Filtering by actor ID: ${actorId}`);
      }
    }

    console.log(`Final search URL: ${searchUrl.replace(TMDB_API_KEY!, '[REDACTED]')}`);

    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.error(`TMDB API error: ${response.status}`);
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Post-filter results if we have filters that couldn't be applied via API
    let filteredResults = data.results;
    
    // If using search endpoint with additional filters, apply them client-side
    if (filters.query && filters.query.trim().length >= 2) {
      if (filters.genre) {
        const genreId = GENRES[filters.genre.toLowerCase().replace(' ', '_')];
        if (genreId) {
          filteredResults = filteredResults.filter((movie: any) => 
            movie.genre_ids && movie.genre_ids.includes(genreId)
          );
        }
      }
      
      if (filters.language) {
        const langCode = LANGUAGES[filters.language.toLowerCase()];
        if (langCode) {
          filteredResults = filteredResults.filter((movie: any) => 
            movie.original_language === langCode
          );
        }
      }
    }

    // Return only the fields we need
    const simplifiedResults = {
      results: filteredResults.slice(0, 20).map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        overview: movie.overview,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        original_language: movie.original_language,
        genre_ids: movie.genre_ids,
      })),
      total_results: filteredResults.length,
      genres: Object.keys(GENRES).map(g => g.replace('_', ' ')),
      languages: Object.keys(LANGUAGES),
    };

    console.log(`Found ${simplifiedResults.results.length} movies`);

    return new Response(
      JSON.stringify(simplifiedResults),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in search-movies function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
