import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 's89mi5lk', // Public ID
  dataset: 'production',
  useCdn: true, // Use CDN for client-side fetching
  apiVersion: '2023-05-03',
});
