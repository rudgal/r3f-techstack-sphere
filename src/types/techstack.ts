export interface Technology {
  id: string;
  name: string;
  abbr: string;
  categories: Category[];
  icon: string;
  backgroundColor: string;
  url: string;
}

export type Category =
  | 'web'
  | 'java/jvm'
  | 'languages'
  | 'quality'
  | 'devops'
  | 'tools';

export interface TechStackData {
  technologies: Technology[];
}
