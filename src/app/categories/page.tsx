import Link from 'next/link';
import { getCategoriesWithCount } from '@/lib/posts';

export default function Categories() {
  const categories = getCategoriesWithCount();
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">카테고리</h1>
      
      <div className="space-y-6">
        {Object.entries(categories).map(([categoryName, category]) => (
          <div key={categoryName} className="space-y-3">
            <h2 className="text-2xl font-semibold flex items-center">
              <Link href={`/categories/${encodeURIComponent(categoryName)}`} className="hover:text-zinc-400 transition">
                {categoryName}
              </Link>
              <span className="ml-2 text-zinc-500 dark:text-zinc-400 text-lg">({category.count})</span>
            </h2>
            
            {category.subcategories && Object.keys(category.subcategories).length > 0 && (
              <div className="pl-6 space-y-2">
                {Object.entries(category.subcategories).map(([subName, count]) => (
                  <div key={subName} className="flex items-center">
                    <Link 
                      href={`/categories/${encodeURIComponent(categoryName)}/${encodeURIComponent(subName)}`}
                      className="text-lg hover:text-zinc-400 transition"
                    >
                      {subName}
                    </Link>
                    <span className="ml-2 text-zinc-500 dark:text-zinc-400">({count})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}