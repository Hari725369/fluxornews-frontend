import Link from 'next/link';
import Image from 'next/image';
import ArticleCard from '@/components/article/ArticleCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FeaturedCarousel from '@/components/article/FeaturedCarousel';
import LatestNewsGrid from '@/components/home/LatestNewsGrid';
import { articlesAPI, configAPI, homepageAPI, categoriesAPI } from '@/lib/api';
import { Article, HomepageConfig } from '@/types';

// Page Props Interface for Server Component
interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

// 1. Fetch Data Function (Server-Side)
async function getHomepageData(category?: string) {
  try {
    const [configRes, homepageRes, articlesRes, categoriesRes] = await Promise.all([
      configAPI.get().catch(() => ({ success: false, data: {} })),
      homepageAPI.get().catch(() => ({ success: false, data: undefined })),
      articlesAPI.getAll({ limit: 100, status: 'published' }).catch(() => ({ success: false, data: [] })),
      categoriesAPI.getAll().catch(() => ({ success: false, data: [] }))
    ]);

    return {
      configData: configRes.data,
      homepageConfig: homepageRes.data as HomepageConfig | undefined,
      articles: articlesRes.data || [],
      categories: categoriesRes.data || []
    };
  } catch (error) {
    console.error('Data fetch error:', error);
    return { configData: {}, homepageConfig: undefined, articles: [], categories: [] };
  }
}

export default async function HomePage(props: PageProps) {
  const searchParams = await props.searchParams;
  const selectedCategory = searchParams.category;

  // Fetch data
  const { configData, homepageConfig, articles, categories } = await getHomepageData(selectedCategory);

  // Derived Data
  const heroArticle = homepageConfig?.heroArticle;
  const subFeaturedArticles = homepageConfig?.subFeaturedArticles || [];

  // Filter out pinned articles from general feed to avoid duplication
  const pinnedIds = new Set([
    heroArticle?._id,
    ...(subFeaturedArticles || []).map((a: any) => a._id)
  ].filter(Boolean));

  // If specific category is selected, filter articles
  let displayArticles = articles;
  if (selectedCategory) {
    displayArticles = articles.filter((a: Article) => {
      if (typeof a.category === 'object' && a.category !== null) {
        return a.category.slug === selectedCategory || a.category._id === selectedCategory;
      }
      return a.category === selectedCategory;
    });
  }

  const remainingArticles = displayArticles.filter(a => !pinnedIds.has(a._id));

  // Dynamic Sections Logic (Only for Homepage, not category view)
  const sections = homepageConfig?.sections?.filter((s) => s.active).sort((a, b) => a.order - b.order) || [];

  // Helper to filter articles by category name (case-insensitive)
  const getArticlesByCategory = (categoryName: string) => {
    return articles.filter(a =>
      (a.category && typeof a.category === 'object') &&
      a.category.name.toLowerCase() === categoryName.toLowerCase() &&
      !pinnedIds.has(a._id)
    ).slice(0, 4);
  };

  // Fallback featured if no hero selected
  const fallbackFeatured = articles.filter(a => a.isFeatured);

  return (
    <div className="min-h-screen flex flex-col">
      <Header initialCategories={categories} />

      {/* Breaking News Ticker (Homepage Specific) */}
      {!selectedCategory && homepageConfig?.breakingNews?.active && (
        <div className="bg-pink-600 text-white text-sm font-medium py-2 px-4 text-center animate-pulse">
          <span className="font-bold uppercase tracking-wider mr-2">Breaking:</span>
          {homepageConfig.breakingNews.link ? (
            <Link href={homepageConfig.breakingNews.link} className="hover:underline">
              {homepageConfig.breakingNews.text}
            </Link>
          ) : (
            <span>{homepageConfig.breakingNews.text}</span>
          )}
        </div>
      )}

      <main className="flex-1 py-6 md:py-8 container mx-auto px-4 max-w-[1200px]">
        {selectedCategory ? (
          <>
            <h2 className="text-[24px] font-bold uppercase text-primary dark:text-primary-400 mb-8 font-sans tracking-wider">
              {articles.length > 0 && typeof articles[0].category === 'object' && articles[0].category
                ? (displayArticles[0]?.category as any)?.name
                : 'Filtered Articles'}
            </h2>
            {displayArticles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600 dark:text-gray-400">No articles found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayArticles.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            )}
          </>
        ) : (
          /* REAL HOMEPAGE LAYOUT */
          <div className="space-y-10">
            {/* 1. Hero Section */}
            {heroArticle ? (
              <div className="mb-8">
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl group cursor-pointer shadow-2xl">
                  <Link href={`/article/${heroArticle.slug}`}>
                    {heroArticle.featuredImage ? (
                      <Image
                        src={heroArticle.featuredImage}
                        alt={heroArticle.title}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full md:w-3/4">
                      <span className="inline-block px-3 py-1 mb-4 text-xs font-bold text-white bg-pink-600 rounded-full tracking-wider uppercase">
                        Featured Story
                      </span>
                      <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 drop-shadow-xl font-serif">
                        {heroArticle.title}
                      </h1>
                      <div className="text-gray-200 line-clamp-2 md:text-lg mb-6 font-medium max-w-2xl">
                        {/* @ts-ignore - excerpt/intro issues in type vs real data */}
                        {heroArticle.excerpt || heroArticle.intro}
                      </div>
                      <div className="flex items-center text-sm text-gray-300 gap-4">
                        <div className="font-bold text-white uppercase tracking-wide">{heroArticle.author?.name}</div>
                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                        <span>{new Date(heroArticle.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              /* Fallback to Carousel if no Hero Configured */
              fallbackFeatured.length > 0 && <FeaturedCarousel articles={fallbackFeatured} />
            )}

            {/* 2. Sub-Featured Grid */}
            {subFeaturedArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {subFeaturedArticles.map((article: any) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            )}

            {/* 3. Latest News (Excluding Pinned) */}
            <div>
              <div className="flex items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
                <h2 className="text-2xl font-black uppercase text-gray-900 dark:text-white tracking-tight">
                  Latest News
                </h2>
              </div>
              <LatestNewsGrid articles={remainingArticles.slice(0, 8)} />
            </div>

            {/* 4. Dynamic Sections */}
            {sections.length > 0 ? (
              sections.map((section) => {
                const sectionArticles = getArticlesByCategory(section.category);
                if (sectionArticles.length === 0) return null;

                return (
                  <div key={section._id}>
                    <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
                      <h2 className="text-2xl font-black uppercase text-gray-900 dark:text-white tracking-tight">
                        {section.category}
                      </h2>
                      <div className="flex items-center gap-4">
                        <span className="hidden md:block h-1 w-24 bg-gray-100 dark:bg-gray-800 rounded-full"></span>
                        <Link href={`/category/${section.category.toLowerCase()}`} className="text-sm font-bold text-pink-600 hover:text-pink-700 hover:underline uppercase tracking-wide">
                          See All
                        </Link>
                      </div>
                    </div>
                    {/* Layout Logic - For now default to Grid, but support others later */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {sectionArticles.map((article: any) => (
                        <ArticleCard key={article._id} article={article} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              /* Fallback if no sections configured */
              [
                { title: 'World', data: getArticlesByCategory('World') },
                { title: 'Technology', data: getArticlesByCategory('Technology') }
              ].map((section) => (
                section.data.length > 0 && (
                  <div key={section.title}>
                    <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
                      <h2 className="text-2xl font-black uppercase text-gray-900 dark:text-white tracking-tight">
                        {section.title}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {section.data.map(article => (
                        <ArticleCard key={article._id} article={article} />
                      ))}
                    </div>
                  </div>
                )
              ))
            )}
          </div>
        )}

        {/* Explore by Topic - NEW SECTION (Existing) */}
        {/* Explore by Topic - Show tags related to current view */}
        {displayArticles.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold uppercase text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-800 pb-2">
              {selectedCategory ? `Topics in ${(displayArticles[0]?.category as any)?.name || 'Category'}` : 'Explore by Topic'}
            </h2>
            <div className="flex flex-wrap gap-3">
              {Array.from(new Set(displayArticles.flatMap(a => a.tags))).slice(0, 14).map(tag => (
                <Link
                  key={tag}
                  href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium hover:border-[#C4161C] dark:hover:border-[#E5484D] hover:text-[#C4161C] dark:hover:text-[#E5484D] transition-all"
                >
                  #{tag}
                </Link>
              ))}

              {/* See More / Search Link */}
              <Link
                href="/search"
                className="px-5 py-2 bg-gray-100 dark:bg-white/10 border border-transparent rounded-full text-sm font-bold text-gray-900 dark:text-white hover:bg-[#C4161C] hover:text-white dark:hover:bg-[#E5484D] transition-all flex items-center gap-2"
              >
                See More
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div >
  );
}
