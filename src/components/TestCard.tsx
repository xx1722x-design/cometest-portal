import { useState } from 'react';
import { triggerAdPopup } from '../lib/adSystem';

interface TestCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge?: string;
  image?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  questions: number;
  categoryColor: string;
  theme: 'dark' | 'gothic' | 'mystical' | 'psychological' | 'romantic' | 'vibrant' | 'playful';
  onClick: () => void;
}

export function TestCard({
  title,
  description,
  icon,
  badge,
  image,
  difficulty,
  duration,
  questions,
  categoryColor,
  theme,
  onClick,
}: TestCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    triggerAdPopup();
    onClick();
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return '#2ECC71';
      case 'medium':
        return '#F39C12';
      case 'hard':
        return '#E74C3C';
      default:
        return '#95A5A6';
    }
  };

  // Get atmospheric gradient based on theme
  const getThemeGradient = () => {
    switch (theme) {
      case 'gothic':
        return 'linear-gradient(135deg, #2C3E50 0%, #1A1A2E 100%)';
      case 'mystical':
        return 'linear-gradient(135deg, #6C3483 0%, #3D2645 100%)';
      case 'psychological':
        return 'linear-gradient(135deg, #34495E 0%, #1C2833 100%)';
      case 'dark':
      default:
        return 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)';
    }
  };

  const minutes = Math.floor(duration / 60);

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered ? 'translateY(-12px) scale(1.03)' : 'translateY(0) scale(1)',
        boxShadow: isHovered
          ? `0 24px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)`
          : `0 8px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)`,
        position: 'relative',
        border: `1px solid ${categoryColor}40`,
        minHeight: '320px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Badge */}
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 10,
            background: categoryColor,
            color: 'white',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            backdropFilter: 'blur(8px)',
            boxShadow: `0 4px 12px ${categoryColor}60`,
          }}
        >
          {badge}
        </div>
      )}

      {/* Atmospheric Banner Area with Image */}
      <div
        style={{
          height: '140px',
          background: image ? `url('${image}')` : getThemeGradient(),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '64px',
          opacity: isHovered ? 1 : 0.9,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Overlay gradient for readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: image
              ? 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)'
              : 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        {/* Icon with glow effect */}
        <div
          style={{
            filter: isHovered ? 'drop-shadow(0 0 12px rgba(255,255,255,0.3))' : 'none',
            transition: 'filter 0.3s ease',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
        }}
      >
        {/* Title & Description */}
        <div>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '700',
              margin: '0 0 8px 0',
              color: 'var(--text-primary)',
              lineHeight: '1.3',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {title}
          </h3>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: '0 0 16px 0',
              lineHeight: '1.4',
              minHeight: '36px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        </div>

        {/* Stats Footer */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: `1px solid ${categoryColor}30`,
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            <span>⏱️ {minutes}m</span>
            <span>•</span>
            <span>❓ {questions}q</span>
          </div>

          <div
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: getDifficultyColor() + '25',
              color: getDifficultyColor(),
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}
          >
            {difficulty}
          </div>
        </div>

        {/* Play Button with Cute Style */}
        <div
          style={{
            padding: '12px 16px',
            background: categoryColor,
            color: 'white',
            textAlign: 'center',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            opacity: isHovered ? 1 : 0.85,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            boxShadow: isHovered ? `0 8px 16px ${categoryColor}60` : `0 4px 8px ${categoryColor}40`,
          }}
        >
          ▶️ Start Test
        </div>
      </div>
    </div>
  );
}
