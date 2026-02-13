export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    authorRole: string;
    publishDate: string;
    readTime: string;
    category: string;
    tags: string[];
    image: string;
    featured: boolean;
    keyTakeaways?: string[];
}
