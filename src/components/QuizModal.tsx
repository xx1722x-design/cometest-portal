import { useState } from 'react';
import { triggerTripleAds } from '../lib/adSystem';

interface QuizModalProps {
  isOpen: boolean;
  testTitle: string;
  testTheme: string;
  onClose: () => void;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

export function QuizModal({ isOpen, testTitle, testTheme, onClose }: QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);

  // Generate 20 dynamic questions based on theme
  const generateQuestions = (): Question[] => {
    const questionPools: { [key: string]: string[] } = {
      dark: [
        'What aspect of darkness appeals to you most?',
        'How do you react to scary situations?',
        'What is your fear tolerance level?',
        'Which dark theme resonates with you?',
        'How do you handle mysterious situations?',
        'What\'s your relationship with fear?',
        'How comfortable are you with uncertainty?',
        'Do dark environments affect your mood?',
        'What draws you to darker content?',
        'How do you process fear emotionally?',
        'What\'s the darkest thought you\'ve had?',
        'How resilient are you in dark scenarios?',
        'What scared you most as a child?',
        'How do you confront your fears?',
        'What\'s your darkest secret?',
        'How much darkness can you handle?',
        'What represents evil to you?',
        'How do you face your inner darkness?',
        'What\'s your nightmare scenario?',
        'How do you define true darkness?',
      ],
      gothic: [
        'What gothic element attracts you?',
        'How Victorian is your aesthetic?',
        'What\'s your mood in dark places?',
        'Gothic or modern?',
        'How dramatic are you?',
        'Do old buildings fascinate you?',
        'What\'s your favorite historical era?',
        'How romantic is your nature?',
        'What gothic symbol resonates with you?',
        'How much do aesthetics matter to you?',
        'What\'s your ideal atmosphere?',
        'How drawn are you to mystery?',
        'What appeals about gothic culture?',
        'How do you express your dark side?',
        'What gothic trend do you follow?',
        'How important is ambiance to you?',
        'What gothic artwork moves you?',
        'How do you define elegance?',
        'What\'s your gothic fantasy?',
        'How authentic is your style?',
      ],
      mystical: [
        'What mystical concept intrigues you most?',
        'How spiritual are you?',
        'What magic appeals to you?',
        'Fate or free will?',
        'How intuitive are you?',
        'Do you believe in destiny?',
        'What\'s your connection to nature?',
        'How open are you to the unknown?',
        'What mystical power would you want?',
        'How much do you trust your gut?',
        'What symbolism attracts you?',
        'How aware are you of energy?',
        'What realm fascinates you most?',
        'How do you define spirituality?',
        'What mystical experience do you seek?',
        'How connected do you feel to the universe?',
        'What ancient wisdom calls to you?',
        'How do you interpret signs?',
        'What mystical practice intrigues you?',
        'How much do you believe in magic?',
      ],
      psychological: [
        'What psychological concept fascinates you?',
        'How self-aware are you?',
        'What motivates your behavior?',
        'How do you process emotions?',
        'What is your deepest fear?',
        'How rational are you really?',
        'What triggers your anxiety?',
        'How do you define sanity?',
        'What psychological defense do you use?',
        'How well do you understand yourself?',
        'What\'s your biggest insecurity?',
        'How do you handle rejection?',
        'What drives your ambitions?',
        'How do you define success?',
        'What psychological pattern repeats in your life?',
        'How aware are you of your biases?',
        'What would your therapist say about you?',
        'How much do you analyze yourself?',
        'What psychological truth scares you?',
        'How well do you know your shadow self?',
      ],
      romantic: [
        'What romantic ideal appeals to you?',
        'How expressive is your love?',
        'What\'s your ideal partnership?',
        'Passion or stability?',
        'How loyal are you?',
        'What does love mean to you?',
        'How do you express affection?',
        'What\'s your love language?',
        'How important is romance to you?',
        'What\'s your biggest turn-on?',
        'How do you define soulmates?',
        'What scares you about love?',
        'How quickly do you fall?',
        'What\'s your relationship pattern?',
        'How vulnerable can you be?',
        'What does forever mean to you?',
        'How do you handle heartbreak?',
        'What\'s your ideal date?',
        'How much do you need emotional support?',
        'What\'s your love story?',
      ],
      vibrant: [
        'What energizes you most?',
        'How vibrant is your personality?',
        'What color represents you?',
        'How social are you?',
        'What makes you excited?',
        'How much do you stand out?',
        'What\'s your energy level?',
        'How do you celebrate life?',
        'What brings you pure joy?',
        'How charismatic are you?',
        'What\'s your favorite activity?',
        'How creative do you get?',
        'What passion drives you?',
        'How do you inspire others?',
        'What\'s your happiest memory?',
        'How do you handle boredom?',
        'What adventure calls to you?',
        'How optimistic are you?',
        'What\'s your life philosophy?',
        'How do you spark connection?',
      ],
      playful: [
        'What\'s your favorite way to have fun?',
        'How playful are you?',
        'What makes you laugh?',
        'Serious or silly?',
        'What\'s your ideal game?',
        'How competitive are you?',
        'What\'s your sense of humor type?',
        'How do you avoid boredom?',
        'What\'s the most fun you\'ve had?',
        'How immature can you be?',
        'What\'s your favorite joke format?',
        'How easily do you get distracted?',
        'What childhood game do you miss?',
        'How spontaneous are you?',
        'What\'s your party style?',
        'How do you define a good time?',
        'What makes you giggle?',
        'How much do you embrace chaos?',
        'What\'s your playful side?',
        'How young do you feel?',
      ],
    };

    const baseQuestions = questionPools[testTheme] || questionPools['dark'];

    // Generate 20 questions with randomized options
    const optionsPool = [
      ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'],
      ['Very much', 'Somewhat', 'Neutral', 'Not really', 'Not at all'],
      ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'],
      ['Extremely', 'Very', 'Moderately', 'Slightly', 'Not at all'],
      ['Definitely yes', 'Probably yes', 'Maybe', 'Probably no', 'Definitely no'],
    ];

    return Array.from({ length: 20 }, (_, idx) => ({
      id: idx + 1,
      text: baseQuestions[idx % baseQuestions.length],
      options: optionsPool[idx % optionsPool.length],
      correctAnswer: Math.floor(Math.random() * 5),
    }));
  };

  const [questions] = useState<Question[]>(generateQuestions());

  if (!isOpen) return null;

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    setAnswered(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setQuizComplete(false);
    triggerTripleAds();
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: `2px solid #8E44AD40`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!quizComplete ? (
          <>
            {/* Header */}
            <h2
              style={{
                fontSize: '24px',
                fontWeight: '700',
                margin: '0 0 16px 0',
                color: 'var(--text-primary)',
              }}
            >
              {testTitle}
            </h2>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#8E44AD20',
                borderRadius: '4px',
                marginBottom: '24px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #8E44AD, #3498DB)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* Question Counter */}
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: '16px',
              }}
            >
              Question {currentQuestion + 1} of {questions.length}
            </p>

            {/* Question */}
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0 0 24px 0',
                color: 'var(--text-primary)',
                lineHeight: '1.4',
              }}
            >
              {questions[currentQuestion].text}
            </h3>

            {/* Options */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              {questions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: `2px solid ${
                      selectedAnswer === idx
                        ? idx === questions[currentQuestion].correctAnswer
                          ? '#2ECC71'
                          : '#E74C3C'
                        : 'var(--border-color)'
                    }`,
                    backgroundColor:
                      selectedAnswer === idx
                        ? idx === questions[currentQuestion].correctAnswer
                          ? '#2ECC7120'
                          : '#E74C3C20'
                        : 'transparent',
                    color: 'var(--text-primary)',
                    cursor: answered ? 'default' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    opacity: answered && selectedAnswer !== idx ? 0.6 : 1,
                  }}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Next Button */}
            {answered && (
              <button
                onClick={handleNext}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#8E44AD',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#6C3483')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = '#8E44AD')
                }
              >
                {currentQuestion === questions.length - 1 ? 'See Results' : 'Next Question'}
              </button>
            )}
          </>
        ) : (
          <>
            {/* Results */}
            <div style={{ textAlign: 'center' }}>
              <h2
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  margin: '0 0 16px 0',
                  color: 'var(--text-primary)',
                }}
              >
                Quiz Complete! 🎉
              </h2>

              <div
                style={{
                  fontSize: '48px',
                  fontWeight: '700',
                  color: '#8E44AD',
                  margin: '24px 0',
                }}
              >
                {score} / {questions.length}
              </div>

              <p
                style={{
                  fontSize: '16px',
                  color: 'var(--text-secondary)',
                  marginBottom: '32px',
                }}
              >
                {score === questions.length
                  ? 'Perfect score! 🏆'
                  : score >= questions.length * 0.8
                    ? 'Excellent! 🌟'
                    : score >= questions.length * 0.6
                      ? 'Great job! 👏'
                      : 'Good effort! Keep trying! 💪'}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                }}
              >
                <button
                  onClick={handleRestart}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#8E44AD',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Retake Quiz
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    border: `1px solid var(--border-color)`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
