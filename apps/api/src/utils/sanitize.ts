import sanitizeHtml from 'sanitize-html';

export const sanitizePlainText = (value: string): string =>
  sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();

