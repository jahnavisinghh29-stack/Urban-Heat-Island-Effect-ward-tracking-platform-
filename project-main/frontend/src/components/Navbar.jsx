import React from 'react';
import { citiesData } from '../data/citiesData.js';
import { IconThermometer, IconChevronDown, IconPulse } from './Icons.jsx';

export default function Navbar({ selectedCity, setSelectedCity, selectedModel, setSelectedModel }) {
  const currentCity = citiesData[selectedCity] || citiesData['delhi'];

  return (
    <nav style={{
      background: 'rgba(12, 18, 32, 0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.85rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* Brand & System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(56, 189, 248, 0.25) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-cyan)'
        }}>
          <IconThermometer size={22} color="var(--accent-cyan)" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{
              margin: 0,
              fontSize: '1.05rem',
              color: 'var(--text-primary)',
              fontWeight: '700',
              letterSpacing: '-0.01em'
            }}>
              CLIMATE INTELLIGENCE PLATFORM
            </h1>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: '700',
              color: 'var(--accent-cyan)',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              padding: '2px 6px',
              borderRadius: '4px',
              letterSpacing: '0.04em'
            }}>
              v2.0 PRO
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Urban Heat Island & Thermal Vulnerability Analysis Across 25 Indian Metros
          </div>
        </div>
      </div>

      {/* Real-time Status & City Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Live telemetry pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '0.35rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          color: '#6ee7b7'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--accent-emerald)',
            animation: 'pulseDot 2s infinite ease-in-out'
          }} />
          <span style={{ fontWeight: '600' }}>TELEMETRY ACTIVE</span>
        </div>

        {/* AI Model Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <label htmlFor="model-select" style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            AI Model:
          </label>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{
                appearance: 'none',
                background: 'var(--bg-surface)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '0.5rem 2.2rem 0.5rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <option value="ensemble" style={{ background: '#0f172a', color: '#f8fafc' }}>Ensemble (RF + LSTM + Prophet)</option>
              <option value="rf" style={{ background: '#0f172a', color: '#f8fafc' }}>Random Forest Regressor</option>
              <option value="lstm" style={{ background: '#0f172a', color: '#f8fafc' }}>Bidirectional LSTM</option>
              <option value="prophet" style={{ background: '#0f172a', color: '#f8fafc' }}>Facebook Prophet</option>
            </select>
            <div style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--accent-cyan)'
            }}>
              <IconChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* City Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <label htmlFor="city-select" style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Target City:
          </label>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <select
              id="city-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                appearance: 'none',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                padding: '0.5rem 2.2rem 0.5rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-cyan)';
                e.target.style.boxShadow = '0 0 0 2px rgba(56, 189, 248, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
              }}
            >
              {Object.keys(citiesData).map((key) => (
                <option key={key} value={key} style={{ background: '#0f172a', color: '#f8fafc' }}>
                  {citiesData[key].name} ({citiesData[key].wards ? citiesData[key].wards.length : 0} Wards)
                </option>
              ))}
            </select>
            <div style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--text-secondary)'
            }}>
              <IconChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
