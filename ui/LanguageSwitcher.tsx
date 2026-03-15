import { useLanguage } from '../app/LanguageContext'
import { useRef } from 'react'
import './LanguageSwitcher.css'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSelect = (lang: 'fr' | 'en') => {
    if (lang === language) return
    setLanguage(lang)
    if (containerRef.current) createMagicParticles(containerRef.current)
  }

  const createMagicParticles = (container: HTMLElement) => {
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div')
      particle.className = 'magic-particle'
      const angle = (i / 8) * Math.PI * 2
      const distance = 40 + Math.random() * 20
      particle.style.setProperty('--x', `${Math.cos(angle) * distance}px`)
      particle.style.setProperty('--y', `${Math.sin(angle) * distance}px`)
      container.appendChild(particle)
      setTimeout(() => particle.remove(), 1000)
    }
  }

  return (
    <div className="language-switcher" ref={containerRef}>
      <button
        className="lang-toggle"
        onClick={() => handleSelect(language === 'fr' ? 'en' : 'fr')}
        aria-label={`Switch to ${language === 'fr' ? 'English' : 'French'}`}
      >
        <span className={`lang-option${language === 'fr' ? ' active' : ''}`}>FR</span>
        <span className={`lang-option${language === 'en' ? ' active' : ''}`}>EN</span>
      </button>
    </div>
  )
}
