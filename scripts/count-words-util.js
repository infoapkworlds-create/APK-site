import fs from 'node:fs';

function countWords(htmlStr) {
  // Strip HTML tags and entities, then count words
  const clean = htmlStr
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return clean ? clean.split(/\s+/).length : 0;
}

console.log('Word counter ready.');
