export const CATEGORIES = [
  'web',
  'java/jvm',
  'languages',
  'quality',
  'devops',
  'tools',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Technology {
  id: string;
  name: string;
  abbr: string;
  categories: Category[];
  icon: string;
  backgroundColor: string;
  url: string;
}

export interface TechStackData {
  technologies: Technology[];
}
