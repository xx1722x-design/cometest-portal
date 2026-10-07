import React from 'react'
import { menuCategories } from '../data/menuItems'

export function MenuHUD() {
  const [selectedCategory, setSelectedCategory] = React.useState(0)
  const category = menuCategories[selectedCategory]

  return (
    <div
      style={{
        position: 'absolute',
        top: '80px',
        left: '20px',
        width: '320px',
        backgroundColor: 'rgba(20, 20, 20, 0.92)',
        border: '2px solid #ff6347',
        borderRadius: '8px',
        padding: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#fff',
        zIndex: 100,
      }}
    >
      {/* 카테고리 탭 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginBottom: '12px',
        }}
      >
        {menuCategories.map((cat, idx) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(idx)}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 'bold',
              border: selectedCategory === idx ? `2px solid ${cat.color}` : '1px solid #666',
              backgroundColor: selectedCategory === idx ? 'rgba(255,100,50,0.2)' : 'rgba(100,100,100,0.2)',
              color: selectedCategory === idx ? cat.color : '#999',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 메뉴 항목들 */}
      <div
        style={{
          maxHeight: '280px',
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {category.items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              marginBottom: '4px',
              backgroundColor: 'rgba(100,100,100,0.15)',
              border: `1px solid ${category.color}33`,
              borderRadius: '3px',
              fontSize: '11px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '14px' }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 'bold', color: '#fff' }}>{item.name}</div>
                <div style={{ fontSize: '9px', color: '#aaa' }}>{item.prepTime}s</div>
              </div>
            </div>
            <div
              style={{
                backgroundColor: category.color,
                color: '#000',
                padding: '2px 6px',
                borderRadius: '2px',
                fontWeight: 'bold',
                minWidth: '30px',
                textAlign: 'center',
              }}
            >
              ${item.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
