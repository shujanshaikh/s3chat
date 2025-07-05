import { tool } from "ai";
import Exa from "exa-js";
import { z } from "zod";

export const exa = new Exa(process.env.EXA_API_KEY);



export const webSearch = tool({
  description: 'Search the web for current, up-to-date information',
  parameters: z.object({
    query: z.string().min(1).max(100).describe('The search query - be specific and include relevant keywords'),
  }),
  
  execute: async ({ query }) => {
    try {
      if (!process.env.EXA_API_KEY) {
        console.error('EXA_API_KEY is not set');
        return [{
          title: 'Configuration Error',
          url: '',
          content: 'Web search is not configured. Please set the EXA_API_KEY environment variable.',
          publishedDate: null,
        }];
      }

      console.log(' Web search initiated for query:', query);
      
      const { results } = await exa.searchAndContents(query, {
        livecrawl: 'always',
        numResults: 3,
      });

      console.log('Web search completed. Results:', results.length);
      
      return results.map(result => ({
        title: result.title,
        url: result.url,
        content: result.text.slice(0, 1000), // take just the first 1000 characters
        publishedDate: result.publishedDate,
      }));
    } catch (error) {
      console.error(' Web search error:', error);
      return [{
        title: 'Search Error',
        url: '',
        content: `Unable to perform web search: ${error instanceof Error ? error.message : 'Unknown error'}`,
        publishedDate: null,
      }];
    }
  },
});