import React, { useState, useEffect, useMemo, useRef } from "react";

// Types
interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  topic: string;
  imageUrl: string;
  timestamp: Date;
  featured?: boolean;
}

interface TrendingTopic {
  name: string;
  count: number;
}

const COLORS = {
  navy: '#001f3f',
  slateGray: '#708090',
  lightSlate: '#ccd6e0',
  turquoise: '#40E0D0',
  orange: '#FFA500',
  white: '#FFFFFF',
  offWhite: '#f4f7f9',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

// Mock data generator
const generateMockArticles = (): Article[] => {
  const categories = ["World", "Technology", "Business", "Sports"];
  const topics = {
    World: ["Politics", "Climate", "Health", "Culture"],
    Technology: ["AI", "Startups", "Cybersecurity", "Innovation"],
    Business: ["Markets", "Economy", "Startups", "Finance"],
    Sports: ["Football", "Basketball", "Tennis", "Olympics"],
  };

  const titles = {
    World: [
      "Global Climate Summit Reaches Historic Agreement",
      "New Healthcare Initiative Launches Across Europe",
      "Cultural Exchange Program Bridges Continental Divide",
      "International Trade Deal Signed After Months of Negotiations",
    ],
    Technology: [
      "AI Breakthrough Promises Revolutionary Healthcare Applications",
      "Tech Giants Announce Joint Cybersecurity Initiative",
      "Startup Unicorn Reaches $10B Valuation",
      "Quantum Computing Milestone Achieved by Research Team",
    ],
    Business: [
      "Stock Markets Hit Record Highs Amid Economic Recovery",
      "Major Merger Creates Industry Giant",
      "Small Business Growth Exceeds Expectations",
      "Cryptocurrency Adoption Accelerates in Retail Sector",
    ],
    Sports: [
      "Championship Finals Draw Record Viewership",
      "Young Athlete Breaks World Record",
      "Olympic Committee Announces New Host City",
      "Team Celebrates Historic Victory After Decades",
    ],
  };

  const articles: Article[] = [];
  let id = 1;

  categories.forEach((category) => {
    const categoryTopics = topics[category as keyof typeof topics];
    const categoryTitles = titles[category as keyof typeof titles];

    categoryTitles.forEach((title, index) => {
      articles.push({
        id: String(id++),
        title,
        excerpt: `This is an excerpt for the article about ${title.toLowerCase()}. It provides a brief overview of the main points covered in the full article.`,
        content: `Full content for: ${title}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
        category,
        topic: categoryTopics[index % categoryTopics.length],
        imageUrl: `https://picsum.photos/400/300?random=${id}`,
        timestamp: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
        featured: id === 2,
      });
    });
  });

  return articles;
};

const App: React.FC = () => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [articles] = useState<Article[]>(generateMockArticles());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [trendingTopics] = useState<TrendingTopic[]>([
    { name: "Climate Change", count: 125 },
    { name: "AI Revolution", count: 98 },
    { name: "Market Trends", count: 87 },
    { name: "World Cup", count: 76 },
    { name: "Cybersecurity", count: 65 },
    { name: "Startups", count: 54 },
    { name: "Healthcare", count: 43 },
    { name: "Olympics", count: 32 },
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedArticle) {
        setSelectedArticle(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedArticle]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
        @media (max-width: 960px) {
            .featured-article {
                grid-column: span 1 !important;
                grid-row: span 1 !important;
            }
        }
        @media (max-width: 768px) {
            .mobile-sticky-search {
                display: block !important;
            }
            .sidebar .searchContainer {
                display: none !important;
            }
            .main-content {
                display: flex !important;
                flex-direction: column !important;
            }
            .sidebar {
                position: relative !important;
                top: auto !important;
                width: 100% !important;
                margin-top: 40px !important;
            }
        }

        @media (min-width: 769px) {
            .mobile-sticky-search {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
    return () => {
        document.head.removeChild(style);
    };
  }, []);


  useEffect(() => {
    const trapFocus = (e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !selectedArticle || !modalRef.current) return;

        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
        if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
        }
        } else {
        if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
        }
    };

    if (selectedArticle) {
        document.addEventListener('keydown', trapFocus);
    }

    return () => {
        document.removeEventListener('keydown', trapFocus);
    };
  }, [selectedArticle]);


  const categories = ["All", "World", "Technology", "Business", "Sports"];

  const filteredArticles = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const matches = articles.filter((article) => {
        const matchesCategory =
        selectedCategory === "All" || article.category === selectedCategory;
        const matchesSearch =
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.topic.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });

    const featured = matches.find((a) => a.featured);
    const rest = matches
        .filter((a) => !a.featured)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return featured ? [featured, ...rest] : rest;
  }, [articles, selectedCategory, searchQuery]);


  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="font-[Inter] min-h-screen bg-[#f4f7f9]">
        <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff' }}>
            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-[#2c3e50] shadow-md">
                <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-[#4ecdc4]">NewsDeck</h1>
                    <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-2 font-semibold border-b-2 transition-colors duration-200 text-slate-300 hover:text-orange-400 ${
                            selectedCategory === cat ? "text-[#40E0D0] border-[#40E0D0]" : "border-transparent"
                        }`}
                        >
                        {cat}
                        </button>
                    ))}
                    </div>
                </div>
            </nav>

            <div className="sticky top-[72px] z-40 bg-[#f5f7fa] px-6 py-4 md:hidden flex justify-center">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40E0D0]"
                />
            </div>
        </div>


        {/* Main Content Area */}
        <main className="max-w-[1400px] mx-auto px-6 py-6 grid md:grid-cols-[1fr_320px] gap-6">
            {/* Articles Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {filteredArticles.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-12">
                    No articles found. Try adjusting your search or switching categories.
                    </div>
                ) : (
                    filteredArticles.map((article) => (
                    <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className={`cursor-pointer rounded-xl overflow-hidden bg-white shadow-md transition-transform duration-200 hover:scale-[1.015] hover:shadow-lg ${
                        article.featured ? 'md:col-span-2 border-4 border-[#40E0D0] shadow-[0_0_20px_-5px_#40E0D0]' : ""
                        }`}
                    >
                        <div className="relative h-48 overflow-hidden">
                        <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-[#40E0D0] text-white text-xs font-semibold px-2 py-1 rounded">
                            {article.topic}
                        </div>
                        </div>

                        <div className="p-4 flex flex-col gap-2">
                        <h3 className="text-lg font-bold leading-tight">{article.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-3">{article.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                            <span>{article.category}</span>
                            <span>{formatDate(article.timestamp)}</span>
                        </div>
                        </div>
                    </div>
                    ))
                )}
            </div>

            <aside className="sticky top-[136px] h-fit hidden md:block">
                <div className="mb-6 space-y-6">
                    <div className="hidden md:block">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search articles..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40E0D0]"
                    />
                    </div>

                    <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Trending Topics</h2>
                    <div className="flex flex-col gap-2">
                        {trendingTopics.map((topic, index) => (
                        <div
                            key={topic.name}
                            onClick={() => setSearchQuery(topic.name)}
                            className="flex justify-between items-center bg-white border border-gray-200 rounded px-4 py-2 cursor-pointer hover:bg-[#2c3e50] hover:text-[#40E0D0] transition"
                        >
                            <span className="font-medium">#{index + 1}</span>
                            <span>{topic.name}</span>
                            <span className="text-sm text-gray-400">{topic.count}</span>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
            </aside>

        </main>

        {/* Article Modal */}
        {selectedArticle && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center px-4 z-50"
                onClick={() => setSelectedArticle(null)}
            >
                <div
                ref={modalRef}
                className="bg-white max-w-2xl w-full rounded-xl p-6 relative shadow-lg animate-[fadeInScale_0.2s_ease-out_forwards]"
                onClick={(e) => e.stopPropagation()}
                >
                <button
                    onClick={() => setSelectedArticle(null)}
                    aria-label="Close modal"
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center 
                  text-[#40E0D0] text-2xl rounded-full bg-black/50 backdrop-blur-md 
                  hover:bg-black/70 hover:scale-105 transition-all duration-200 shadow-md"
                >
                    &times;
                </button>
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-60 object-cover rounded-lg mb-4"
                />
                <h2 className="text-2xl font-bold mb-4">{selectedArticle.title}</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedArticle.content}
                </p>
                </div>
            </div>
        )}
        <style>
        {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
            }
        `}
        </style>
    </div>
  );
};

export default App;
