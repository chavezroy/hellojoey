import fs from 'fs';
import path from 'path';

const contentPath = path.join(process.cwd(), 'data', 'content.json');

export interface ContentData {
  navigation: Array<{ label: string; href: string }>;
  logo: {
    image: string;
    alt: string;
  };
  hero: {
    image: string;
    alt: string;
  };
  sections: {
    about: string[];
  };
  footer: {
    email: string;
    copyright: string;
  };
  video: {
    url: string;
    poster: string;
  };
  kangaroo: {
    image: string;
    alt: string;
  };
}

export function getContent(): ContentData {
  try {
    const fileContents = fs.readFileSync(contentPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading content file:', error);
    throw error;
  }
}

export function saveContent(content: ContentData): void {
  try {
    fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing content file:', error);
    throw error;
  }
}

