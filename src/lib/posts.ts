import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostData {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  categories?: string[];
}

export interface Category {
  name: string;
  count: number;
  subcategories?: { [key: string]: number };
}

export function getSortedPostsData(): PostData[] {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      content: matterResult.content,
      categories: matterResult.data.categories || [],
      ...(matterResult.data as { title: string; date: string; excerpt: string }),
    };
  });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export async function getPostData(id: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Combine the data with the id and contentHtml
  return {
    id,
    content: matterResult.content,
    categories: matterResult.data.categories || [],
    ...(matterResult.data as { title: string; date: string; excerpt: string }),
  };
}

export function getCategoriesWithCount(): { [key: string]: Category } {
  const allPosts = getSortedPostsData();
  const categories: { [key: string]: Category } = {};

  // Count posts in each category and subcategory
  allPosts.forEach(post => {
    if (!post.categories || post.categories.length === 0) return;
    
    // Handle main categories and subcategories
    post.categories.forEach(categoryPath => {
      const parts = categoryPath.split('/');
      const mainCategory = parts[0].trim();
      const subCategory = parts.length > 1 ? parts[1].trim() : null;
      
      // Initialize main category if it doesn't exist
      if (!categories[mainCategory]) {
        categories[mainCategory] = { name: mainCategory, count: 0, subcategories: {} };
      }
      
      // Increment main category count
      categories[mainCategory].count++;
      
      // Handle subcategory if it exists
      if (subCategory) {
        if (!categories[mainCategory].subcategories) {
          categories[mainCategory].subcategories = {};
        }
        
        // Initialize and increment subcategory count
        categories[mainCategory].subcategories[subCategory] = 
          (categories[mainCategory].subcategories[subCategory] || 0) + 1;
      }
    });
  });
  
  return categories;
}

// 특정 카테고리에 속하는 게시물 가져오기
export function getPostsByCategory(category: string, subcategory?: string): PostData[] {
  const allPosts = getSortedPostsData();
  
  return allPosts.filter(post => {
    if (!post.categories || post.categories.length === 0) return false;
    
    return post.categories.some(cat => {
      const parts = cat.split('/');
      const mainCategory = parts[0].trim();
      const subCat = parts.length > 1 ? parts[1].trim() : null;
      
      if (subcategory) {
        // 서브카테고리가 지정된 경우 메인 카테고리와 서브카테고리 모두 일치해야 함
        return mainCategory === category && subCat === subcategory;
      } else {
        // 서브카테고리가 지정되지 않은 경우 메인 카테고리만 일치하면 됨
        return mainCategory === category;
      }
    });
  });
}