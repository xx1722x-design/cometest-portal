import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';
import { SiteFooter } from '../components/SiteFooter';
import { Sidebar } from '../components/Sidebar';
import { TestCard } from '../components/TestCard';
import { QuizModal } from '../components/QuizModal';
import { TESTS_DATA, type Test } from '../config/testsData';
import { TEST_CATEGORIES } from '../config/testCategories';
import { triggerTripleAds } from '../lib/adSystem';

export function Tests() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('horror');
  const [quizOpen, setQuizOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  // Filter tests by active category
  const filteredTests = useMemo(() => {
    return TESTS_DATA.filter(test => test.category === activeCategory);
  }, [activeCategory]);

  // Get category color and gradient
  const getCategoryData = () => {
    return TEST_CATEGORIES.find(c => c.id === activeCategory) || TEST_CATEGORIES[0];
  };

  const categoryData = getCategoryData();

  const handleCategoryClick = (categoryId: string) => {
    triggerTripleAds();
    setActiveCategory(categoryId);
  };

  const handleTestClick = (test: Test) => {
    triggerTripleAds();
    setSelectedTest(test);
    setQuizOpen(true);
  };

  return (
    <div
      className="portal-bg"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header />

      {/* Category Tabs - Enhanced Ktestone Style */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(var(--bg-rgb), 0.98)',
          backdropFilter: 'blur(12px)',
          borderBottom: `2px solid ${categoryData.color}40`,
          padding: '0',
          overflow: 'hidden',
          width: '100%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '0',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            padding: '0',
            width: '100%',
            boxSizing: 'border-box',
            scrollbarWidth: 'none' as any,
            msOverflowStyle: 'none' as any,
          }}
          className="hide-scrollbar"
        >
          {TEST_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              style={{
                padding: '14px 28px',
                border: 'none',
                background: activeCategory === cat.id ? categoryData.bgGradient : 'transparent',
                color: activeCategory === cat.id ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: activeCategory === cat.id ? '700' : '500',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== cat.id) {
                  e.currentTarget.style.backgroundColor = cat.color + '15';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== cat.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{cat.icon}</span>
              {cat.name}
              {activeCategory === cat.id && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '0',
                    right: '0',
                    height: '3px',
                    background: categoryData.color,
                    animation: 'slideIn 0.3s ease',
                  }}
                />
              )}
            </button>
          ))}
          <div style={{ width: '8px', flexShrink: 0 }} />
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '20px', padding: '0 20px' }}>
        {/* Main Content */}
        <main
          style={{
            flex: 1,
            padding: '40px 0',
            maxWidth: '1400px',
            width: '100%',
            margin: '0 auto',
          }}
        >
        {/* Category Header with Atmospheric Design */}
        <div
          style={{
            marginBottom: '40px',
            padding: '32px',
            background: categoryData.bgGradient,
            borderRadius: '16px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 12px 32px ${categoryData.color}40`,
          }}
        >
          {/* Overlay effect */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                fontSize: '48px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <span>{categoryData.icon}</span>
              <div>
                <h1
                  style={{
                    fontSize: '36px',
                    fontWeight: '800',
                    margin: '0 0 8px 0',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {categoryData.name}
                </h1>
                <p
                  style={{
                    fontSize: '14px',
                    opacity: 0.9,
                    margin: '0',
                    fontWeight: '500',
                  }}
                >
                  {filteredTests.length} {filteredTests.length === 1 ? 'test' : 'tests'} available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tests Grid - Responsive */}
        {filteredTests.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
              width: '100%',
            }}
          >
            {filteredTests.map((test) => (
              <TestCard
                key={test.id}
                {...test}
                categoryColor={categoryData.color}
                onClick={() => handleTestClick(test)}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 40px',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
            <h2>{t('search_no_results') || 'No tests found'}</h2>
          </div>
        )}
      </main>

        <Sidebar />
      </div>

      <SiteFooter />

      {selectedTest && (
        <QuizModal
          isOpen={quizOpen}
          testTitle={selectedTest.title}
          testTheme={selectedTest.theme}
          onClose={() => {
            setQuizOpen(false);
            setSelectedTest(null);
          }}
        />
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: scaleX(0);
            opacity: 0;
          }
          to {
            transform: scaleX(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
