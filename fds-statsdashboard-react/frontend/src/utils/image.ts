// src/utils/image.ts
export const normalizeImageUrl = (url: string) => {
  const uploadsIndex = url.indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    return '/api' + url.slice(uploadsIndex);
  }
  return url;
};