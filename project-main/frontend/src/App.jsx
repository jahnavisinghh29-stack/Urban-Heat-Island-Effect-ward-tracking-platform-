import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import RiskMap from './components/RiskMap.jsx';
import HeatmapChart from './components/HeatmapChart.jsx';
import { citiesData } from './data/citiesData.js';
import {
  IconMap,
  IconSatellite,
  IconCalendar,
  IconBarChart,
  IconTrending,
  IconActivity,
  IconCpu,
  IconCrosshair,
  IconThermometer,
  IconLeaf,
  IconShield,
  IconAlert,
  IconExternalLink
} from './components/Icons.jsx';

export default function App() {
  const [selectedCity, setSelectedCity] = useState('delhi');
  const [selectedModel, setSelectedModel] = useState('ensemble');
  const [activeTab, setActiveTab] = useState('map');
  const [wardFilter, setWardFilter] = useState('all');
  const [yearlyData, setYearlyData] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [trendAnalysis, setTrendAnalysis] = useState(null);
  const [modelPerf, setModelPerf] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const p1 = fetch(`http://127.0.0.1:8000/api/data/temperature-yearly?city=${selectedCity}&model=${selectedModel}`)
      .then(res => res.json())
      .then(data => setYearlyData(data))
      .catch(() => setYearlyData([]));

    const p2 = fetch(`http://127.0.0.1:8000/api/data/daily-forecast?city=${selectedCity}&model=${selectedModel}`)
      .then(res => res.json())
      .then(data => setDailyForecast(data))
      .catch(() => setDailyForecast([]));

    const p3 = fetch(`http://127.0.0.1:8000/api/data/monthly-trends?city=${selectedCity}`)
      .then(res => res.json())
      .then(data => setMonthlyTrends(data))
      .catch(() => setMonthlyTrends([]));

    const p4 = fetch(`http://127.0.0.1:8000/api/data/trend-analysis?city=${selectedCity}`)
      .then(res => res.json())
      .then(data => setTrendAnalysis(data))
      .catch(() => setTrendAnalysis(null));

    const p5 = fetch(`http://127.0.0.1:8000/api/data/model-performance?city=${selectedCity}&model=${selectedModel}`)
      .then(res => res.json())
      .then(data => setModelPerf(data))
      .catch(() => setModelPerf(null));

    Promise.all([p1, p2, p3, p4, p5]).finally(() => setLoading(false));
  }, [selectedCity, selectedModel]);

  const cityInfo = citiesData[selectedCity] || citiesData['delhi'];
  const wards = cityInfo.wards || [];

  // Summary Metrics computed from actual wards
  const criticalCount = wards.filter(w => w.risk_level === 'Critical').length;
  const highCount = wards.filter(w => w.risk_level === 'High').length;
  const moderateCount = wards.filter(w => w.risk_level === 'Moderate').length;
  const maxLST = wards.length > 0 ? Math.max(...wards.map(w => w.lst_c)) : 0;
  const avgLST = wards.length > 0 ? (wards.reduce((acc, w) => acc + w.lst_c, 0) / wards.length).toFixed(1) : 0;
  const avgNDVI = wards.length > 0 ? (wards.reduce((acc, w) => acc + w.ndvi, 0) / wards.length).toFixed(2) : 0;

  const filteredWards = wardFilter === 'all'
    ? wards
    : wards.filter(w => w.risk_level.toLowerCase() === wardFilter.toLowerCase());

  const navItems = [
    { id: 'map', label: 'Ward Thermal Risk Map', sub: 'Spatial heat distribution', icon: IconMap },
    { id: 'satellite', label: 'Satellite LST & NDVI', sub: 'Radiometric & canopy metrics', icon: IconSatellite },
    { id: 'daily', label: '7-Day Climate Forecast', sub: 'Daily thermal alerts & humidity', icon: IconCalendar },
    { id: 'monthly', label: 'Monthly UHI Intensity', sub: 'Seasonal anomaly trajectories', icon: IconBarChart },
    { id: 'yearly', label: 'Decadal Climate Trends', sub: 'Historical records & ML projections', icon: IconTrending },
    { id: 'mannkendall', label: 'Mann-Kendall Trend Test', sub: "Statistical test & Sen's slope", icon: IconActivity },
    { id: 'performance', label: 'ML Ensemble Evaluation', sub: 'Residual error & accuracy metrics', icon: IconCpu },
    { id: 'heatmap', label: 'UHI Heatmap Chart', sub: 'Ward & seasonal heat matrix', icon: IconThermometer },
    { id: 'mitigation', label: 'Heat Mitigation Plan', sub: 'Ward-level cooling & interventions', icon: IconShield },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Navbar selectedCity={selectedCity} setSelectedCity={setSelectedCity} selectedModel={selectedModel} setSelectedModel={setSelectedModel} />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* SIDEBAR NAVIGATION */}
        <aside style={{
          width: '300px',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          flexShrink: 0
        }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0 0.75rem',
            marginBottom: '0.6rem'
          }}>
            Analytical Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
              >
                <div style={{
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s'
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.88rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.label}</span>
                  <span style={{ fontSize: '0.72rem', color: isActive ? '#93c5fd' : 'var(--text-muted)' }}>{item.sub}</span>
                </div>
              </button>
            );
          })}

          {/* System Telemetry Box at Bottom */}
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            <div style={{
              background: 'rgba(17, 26, 46, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Model Pipeline
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>ONLINE</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Ensemble Random Forest, LSTM & Prophet running continuous time-series inferences.
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN WORKSPACE */}
        <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
          
          {/* CITY INTELLIGENCE HERO HEADER */}
          <section className="fade-in" style={{
            background: 'linear-gradient(135deg, rgba(17, 26, 46, 0.95) 0%, rgba(20, 32, 58, 0.75) 100%)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 1.75rem',
            marginBottom: '1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
                  {cityInfo.name}
                </h2>
                <span style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-cyan)',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  {cityInfo.lat}° N, {cityInfo.lng}° E
                </span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Municipal Urban Heat Island observation network tracking {wards.length} designated urban wards with multispectral satellite calibration.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(12, 18, 32, 0.65)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 1rem',
                minWidth: '110px'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Peak LST</div>
                <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f87171' }}>{maxLST}°C</div>
              </div>

              <div style={{
                background: 'rgba(12, 18, 32, 0.65)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 1rem',
                minWidth: '110px'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mean Surface</div>
                <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>{avgLST}°C</div>
              </div>

              <div style={{
                background: 'rgba(12, 18, 32, 0.65)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 1rem',
                minWidth: '110px'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mean NDVI</div>
                <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: '700', color: '#34d399' }}>{avgNDVI}</div>
              </div>

              <div style={{
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 1rem',
                minWidth: '120px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#fda4af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Critical Wards</div>
                <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f43f5e' }}>{criticalCount} of {wards.length}</div>
              </div>
            </div>
          </section>

          {/* TAB 1: SPATIAL WARD RISK MAP */}
          {activeTab === 'map' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', fontWeight: '700' }}>
                    Spatial Surface Temperature & Thermal Risk Map
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    Interactive cartographic telemetry displaying designated municipal wards categorized by urban heat vulnerability.
                  </p>
                </div>

                {/* Filter chips */}
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(12, 18, 32, 0.8)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  {[
                    { key: 'all', label: `All (${wards.length})` },
                    { key: 'critical', label: `Critical (${criticalCount})` },
                    { key: 'high', label: `High (${highCount})` },
                    { key: 'moderate', label: `Moderate (${moderateCount})` },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setWardFilter(tab.key)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: wardFilter === tab.key ? 'var(--accent-blue)' : 'transparent',
                        color: wardFilter === tab.key ? '#ffffff' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Canvas */}
              <RiskMap selectedCity={selectedCity} citiesData={citiesData} wardFilter={wardFilter} />

              {/* Monitored Wards Grid */}
              <div style={{ marginTop: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                  Monitored Wards Breakdown ({filteredWards.length})
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {filteredWards.map((w, idx) => {
                    const isCrit = w.risk_level === 'Critical';
                    const isHi = w.risk_level === 'High';
                    const borderColor = isCrit ? 'rgba(244, 63, 94, 0.3)' : isHi ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)';
                    const badgeClass = isCrit ? 'badge-critical' : isHi ? 'badge-high' : 'badge-moderate';

                    return (
                      <div
                        key={idx}
                        className="intel-card"
                        style={{ padding: '1.1rem', borderLeft: `3px solid ${isCrit ? '#f43f5e' : isHi ? '#f59e0b' : '#10b981'}` }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>{w.ward}</span>
                          <span className={`badge ${badgeClass}`}>{w.risk_level}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <div style={{ background: 'rgba(12, 18, 32, 0.6)', padding: '6px 8px', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Surface Temp</div>
                            <div className="mono-num" style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f87171' }}>{w.lst_c}°C</div>
                          </div>
                          <div style={{ background: 'rgba(12, 18, 32, 0.6)', padding: '6px 8px', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>NDVI Canopy</div>
                            <div className="mono-num" style={{ fontSize: '0.95rem', fontWeight: '700', color: '#34d399' }}>{w.ndvi}</div>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Heat Driver: </strong>{w.driver}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Vulnerability: {w.risk_score}/100</span>
                          <a
                            href={w.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          >
                            <span>Source</span>
                            <IconExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SATELLITE LST & NDVI */}
          {activeTab === 'satellite' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', fontWeight: '700' }}>
                  Satellite Radiometric LST & Multispectral NDVI Analytics
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Derived from NASA Landsat 8/9 TIRS (Thermal Infrared Sensor) and USGS/ISRO optical multispectral reflectance bands.
                </p>
              </div>

              {/* Spectral Channels Diagnostic Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* LST Channel */}
                <div className="intel-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', color: '#f87171', fontSize: '1.05rem', fontWeight: '700' }}>
                        Land Surface Temperature (LST) Spectral Channel
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Band 10 (10.60 – 11.19 µm) &bull; Radiometric Calibration via Split-Window Algorithm
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(248, 113, 113, 0.1)',
                      border: '1px solid rgba(248, 113, 113, 0.3)',
                      color: '#f87171',
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}>
                      Peak: {maxLST}°C
                    </span>
                  </div>

                  {/* Gradient Calibration Bar */}
                  <div style={{
                    height: '14px',
                    borderRadius: '8px',
                    background: 'linear-gradient(90deg, #1e3a8a 0%, #0284c7 25%, #f59e0b 60%, #dc2626 85%, #7f1d1d 100%)',
                    marginBottom: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1.25rem' }}>
                    <span>28°C (Cool Canopy)</span>
                    <span>36°C (Suburban)</span>
                    <span>42°C (Dense Asphalt)</span>
                    <span>&gt;46°C (Thermal Core)</span>
                  </div>

                  <div style={{ background: 'rgba(12, 18, 32, 0.65)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Urban Impervious Fraction:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>68.4% Built-Up Density</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Mean Radiative Emission:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>524 W/m² Thermal Flux</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Calibration Atmospheric Correction:</span>
                      <strong style={{ color: 'var(--accent-cyan)' }}>MODIS Water Vapor Verified</strong>
                    </div>
                  </div>
                </div>

                {/* NDVI Channel */}
                <div className="intel-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', color: '#34d399', fontSize: '1.05rem', fontWeight: '700' }}>
                        Normalized Difference Vegetation Index (NDVI)
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        (NIR - Red) / (NIR + Red) &bull; Canopy Density & Evapotranspiration Capacity
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(52, 211, 153, 0.1)',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      color: '#34d399',
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}>
                      Mean: {avgNDVI}
                    </span>
                  </div>

                  {/* Gradient Calibration Bar */}
                  <div style={{
                    height: '14px',
                    borderRadius: '8px',
                    background: 'linear-gradient(90deg, #78350f 0%, #ca8a04 25%, #65a30d 55%, #15803d 85%, #064e3b 100%)',
                    marginBottom: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1.25rem' }}>
                    <span>0.05 (Bare Concrete)</span>
                    <span>0.20 (Sparse Turf)</span>
                    <span>0.40 (Park Greens)</span>
                    <span>0.70+ (Dense Canopy)</span>
                  </div>

                  <div style={{ background: 'rgba(12, 18, 32, 0.65)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Vegetation Deficit Threshold:</span>
                      <strong style={{ color: '#f59e0b' }}>&lt; 0.20 (Vulnerable Zone)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Evapotranspirative Cooling Deficit:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>-3.8°C Natural Cooling Loss</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Recommended Mitigation:</span>
                      <strong style={{ color: 'var(--accent-emerald)' }}>Urban Forestry & Cool Roofs</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spectral Correlation Table */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ward Designation</th>
                      <th>Surface LST (°C)</th>
                      <th>NDVI Vegetation</th>
                      <th>LST/NDVI Thermal Ratio</th>
                      <th>Heat Vulnerability</th>
                      <th>Calibration Data Provider</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wards.map((w, idx) => {
                      const ratio = (w.lst_c / (w.ndvi || 0.1)).toFixed(1);
                      const badgeClass = w.risk_level === 'Critical' ? 'badge-critical' : w.risk_level === 'High' ? 'badge-high' : 'badge-moderate';
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{w.ward}</td>
                          <td className="mono-num" style={{ color: '#f87171', fontWeight: '600' }}>{w.lst_c}°C</td>
                          <td className="mono-num" style={{ color: '#34d399', fontWeight: '600' }}>{w.ndvi}</td>
                          <td className="mono-num" style={{ color: 'var(--text-secondary)' }}>{ratio}</td>
                          <td><span className={`badge ${badgeClass}`}>{w.risk_level}</span></td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{w.source_name}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: 7-DAY DAILY FORECAST */}
          {activeTab === 'daily' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', fontWeight: '700' }}>
                  7-Day High-Resolution Meteorological Forecast
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Synoptic numerical weather prediction with urban heat stress categorization and humidity indices for {cityInfo.name}.
                </p>
              </div>

              {/* Daily cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
                {dailyForecast.map((d, i) => {
                  const isSevere = d.max_temp >= 40;
                  const isHigh = d.max_temp >= 36;
                  const tempBarPercent = Math.min(100, Math.max(20, ((d.max_temp - 20) / 25) * 100));

                  return (
                    <div key={i} className="intel-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.88rem', color: i === 0 ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                          {d.day}
                        </span>
                        {i === 0 && (
                          <span style={{ fontSize: '0.65rem', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                            TODAY
                          </span>
                        )}
                      </div>

                      {/* Temperature Display */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <div className="mono-num" style={{ fontSize: '1.85rem', fontWeight: '800', color: isSevere ? '#f43f5e' : isHigh ? '#f59e0b' : 'var(--text-primary)' }}>
                          {d.max_temp}°C
                        </div>
                        <div className="mono-num" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          / {d.min_temp}°C
                        </div>
                      </div>

                      {/* Diurnal Thermal Range Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                          <span>Thermal Index</span>
                          <span className="mono-num">Δ {(d.max_temp - d.min_temp).toFixed(1)}°C</span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${tempBarPercent}%`,
                            background: isSevere ? 'linear-gradient(90deg, #f59e0b, #f43f5e)' : 'linear-gradient(90deg, #38bdf8, #f59e0b)',
                            borderRadius: '2px'
                          }} />
                        </div>
                      </div>

                      {/* Humidity Metric */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(12, 18, 32, 0.65)', padding: '6px 10px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Relative Humidity</span>
                        <span className="mono-num" style={{ fontSize: '0.8rem', fontWeight: '700', color: '#38bdf8' }}>{d.humidity}%</span>
                      </div>

                      {/* Condition Status */}
                      <div style={{
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        background: isSevere ? 'rgba(244, 63, 94, 0.12)' : isHigh ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                        border: `1px solid ${isSevere ? 'rgba(244, 63, 94, 0.25)' : isHigh ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
                        color: isSevere ? '#fda4af' : isHigh ? '#fde68a' : '#6ee7b7'
                      }}>
                        {d.condition}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Municipal Action Protocols */}
              <div className="intel-card" style={{ borderLeft: '3px solid var(--accent-cyan)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-cyan)', fontSize: '0.95rem', fontWeight: '700' }}>
                  Municipal Heat Mitigation Advisory
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Daily temperatures exceeding 38°C in high-impervious wards require municipal activation of misting systems, emergency hydration facilities, and industrial work shift adjustments between 12:00 PM and 4:00 PM.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: MONTHLY CLIMATE TRENDS */}
          {activeTab === 'monthly' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', fontWeight: '700' }}>
                  Monthly Ambient Temperature & Urban Heat Island (UHI) Delta
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Annual seasonal progression showing the discrepancy between background meteorological ambient air temperature and satellite-measured Land Surface Temperature.
                </p>
              </div>

              {/* Visual Bar Comparison Chart */}
              <div className="intel-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Seasonal Temperature Profile & UHI Intensity Curve
                  </h4>
                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', background: '#38bdf8', borderRadius: '2px' }}></span>
                      <span style={{ color: 'var(--text-secondary)' }}>Ambient Air Temp (°C)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', background: '#f43f5e', borderRadius: '2px' }}></span>
                      <span style={{ color: 'var(--text-secondary)' }}>Surface LST (°C)</span>
                    </div>
                  </div>
                </div>

                {/* SVG / Flex Bar Chart */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '0.75rem', height: '220px', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
                  {monthlyTrends.map((m, idx) => {
                    const ambientHeight = Math.max(15, (m.avg_temp / 50) * 100);
                    const lstHeight = Math.max(20, (m.lst_temp / 50) * 100);

                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '170px', width: '100%', justifyContent: 'center' }}>
                          {/* Ambient Bar */}
                          <div
                            title={`${m.month} Ambient: ${m.avg_temp}°C`}
                            style={{
                              width: '42%',
                              height: `${ambientHeight}%`,
                              background: 'rgba(56, 189, 248, 0.75)',
                              borderRadius: '3px 3px 0 0',
                              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                          />
                          {/* LST Bar */}
                          <div
                            title={`${m.month} Surface: ${m.lst_temp}°C (UHI: +${m.uhi_intensity}°C)`}
                            style={{
                              width: '42%',
                              height: `${lstHeight}%`,
                              background: 'rgba(244, 63, 94, 0.85)',
                              borderRadius: '3px 3px 0 0',
                              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Table */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Ambient Air Temp</th>
                      <th>Surface LST Temp</th>
                      <th>UHI Delta (Δ°C)</th>
                      <th>Seasonal Assessment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyTrends.map((m, i) => {
                      const isPeak = m.uhi_intensity >= 6.5;
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: '700' }}>{m.month}</td>
                          <td className="mono-num">{m.avg_temp}°C</td>
                          <td className="mono-num" style={{ color: '#f87171', fontWeight: '700' }}>{m.lst_temp}°C</td>
                          <td className="mono-num" style={{ color: '#fbbf24', fontWeight: '700' }}>+{m.uhi_intensity}°C</td>
                          <td style={{ fontSize: '0.8rem', color: isPeak ? '#f43f5e' : 'var(--text-secondary)' }}>
                            {isPeak ? 'Pre-monsoon Peak Thermal Anomaly' : 'Moderate Seasonal Variance'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: YEARLY PROJECTIONS */}
          {activeTab === 'yearly' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', fontWeight: '700' }}>
                  Decadal Climate Records & Long-Term Warming Trajectory
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Meteorological historical series (1990 – 2024) and projected annual mean temperatures for {cityInfo.name}.
                </p>
              </div>

              {/* Multi-Series Historical & 2030 ML Projection Chart */}
              <div className="intel-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Historical & 2030 Climate Projection Chart ({selectedModel.toUpperCase()})
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Solid curves show recorded telemetry; dashed shaded region shows ML forecast trajectory through 2030.
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.74rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#f87171' }}>
                      <i style={{ width: 12, height: 3, background: '#f43f5e', display: 'inline-block' }} /> Peak Max (°C)
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#fbbf24' }}>
                      <i style={{ width: 12, height: 3, background: '#f59e0b', display: 'inline-block' }} /> Annual Mean (°C)
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#38bdf8' }}>
                      <i style={{ width: 12, height: 3, background: '#38bdf8', display: 'inline-block' }} /> Baseline Min (°C)
                    </span>
                  </div>
                </div>

                {yearlyData.length > 1 && (() => {
                  const W = 860, H = 250, padL = 44, padR = 24, padT = 20, padB = 34;
                  const allTemps = yearlyData.flatMap(d => [d.max_temp, d.mean_temp, d.min_temp]);
                  const minT = Math.floor(Math.min(...allTemps) - 1);
                  const maxT = Math.ceil(Math.max(...allTemps) + 1);
                  const xAt = (i) => padL + (i / (yearlyData.length - 1)) * (W - padL - padR);
                  const yAt = (v) => padT + (1 - (v - minT) / (maxT - minT || 1)) * (H - padT - padB);

                  const projStartIdx = yearlyData.findIndex(d => d.is_projection);
                  const splitIdx = projStartIdx > 0 ? projStartIdx - 1 : yearlyData.length - 1;

                  const makePath = (arr, key, startIdx = 0) =>
                    arr.map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${xAt(startIdx + idx).toFixed(1)} ${yAt(d[key]).toFixed(1)}`).join(' ');

                  const histArr = yearlyData.slice(0, splitIdx + 1);
                  const projArr = yearlyData.slice(splitIdx);

                  return (
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: '620px', height: '250px', display: 'block' }}>
                        {/* Horizontal grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => {
                          const val = (minT + t * (maxT - minT)).toFixed(0);
                          const y = yAt(Number(val));
                          return (
                            <g key={idx}>
                              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(148,163,184,0.12)" strokeWidth="1" />
                              <text x={padL - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="var(--font-mono)">
                                {val}°
                              </text>
                            </g>
                          );
                        })}

                        {/* Shaded 2030 Projection Region */}
                        {projStartIdx > 0 && (
                          <g>
                            <rect
                              x={xAt(splitIdx)}
                              y={padT}
                              width={W - padR - xAt(splitIdx)}
                              height={H - padT - padB}
                              fill="rgba(244, 63, 94, 0.08)"
                            />
                            <line
                              x1={xAt(splitIdx)}
                              y1={padT}
                              x2={xAt(splitIdx)}
                              y2={H - padB}
                              stroke="rgba(244, 63, 94, 0.45)"
                              strokeDasharray="4 4"
                            />
                            <text x={xAt(splitIdx) + 8} y={padT + 14} fill="#fda4af" fontSize="10" fontWeight="700">
                              2030 ML PROJECTION ZONE
                            </text>
                          </g>
                        )}

                        {/* Historical Lines */}
                        <path d={makePath(histArr, 'max_temp', 0)} fill="none" stroke="#f43f5e" strokeWidth="2.5" />
                        <path d={makePath(histArr, 'mean_temp', 0)} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                        <path d={makePath(histArr, 'min_temp', 0)} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

                        {/* Projected Dashed Lines */}
                        {projArr.length > 1 && (
                          <>
                            <path d={makePath(projArr, 'max_temp', splitIdx)} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="6 4" />
                            <path d={makePath(projArr, 'mean_temp', splitIdx)} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 4" />
                            <path d={makePath(projArr, 'min_temp', splitIdx)} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 4" />
                          </>
                        )}

                        {/* Data points & Year labels */}
                        {yearlyData.map((d, i) => (
                          <g key={i}>
                            <circle cx={xAt(i)} cy={yAt(d.max_temp)} r={d.is_projection ? 4 : 3} fill="#f43f5e">
                              <title>{`${d.year}${d.is_projection ? ' (Projected)' : ''}: Max ${d.max_temp}°C | Mean ${d.mean_temp}°C | Min ${d.min_temp}°C`}</title>
                            </circle>
                            <circle cx={xAt(i)} cy={yAt(d.mean_temp)} r={d.is_projection ? 3.5 : 2.5} fill="#f59e0b" />
                            <circle cx={xAt(i)} cy={yAt(d.min_temp)} r={d.is_projection ? 3.5 : 2.5} fill="#38bdf8" />
                            {(i % 2 === 0 || i === yearlyData.length - 1) && (
                              <text
                                x={xAt(i)}
                                y={H - 10}
                                textAnchor="middle"
                                fill={d.is_projection ? '#fda4af' : '#94a3b8'}
                                fontSize="10"
                                fontFamily="var(--font-mono)"
                                fontWeight={d.is_projection ? '700' : '400'}
                              >
                                {d.year}
                              </text>
                            )}
                          </g>
                        ))}
                      </svg>
                    </div>
                  );
                })()}
              </div>

              {/* Data Table */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Max Recorded Temp</th>
                      <th>Mean Annual Temp</th>
                      <th>Min Recorded Temp</th>
                      <th>Decadal Deviation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyData.map((row, i) => (
                      <tr key={i}>
                        <td className="mono-num" style={{ fontWeight: '700' }}>{row.year}</td>
                        <td className="mono-num" style={{ color: '#f87171', fontWeight: '700' }}>{row.max_temp}°C</td>
                        <td className="mono-num">{row.mean_temp}°C</td>
                        <td className="mono-num" style={{ color: '#38bdf8' }}>{row.min_temp}°C</td>
                        <td className="mono-num" style={{ color: row.is_projection ? '#38bdf8' : (row.max_temp > 40 ? '#f43f5e' : 'var(--text-secondary)') }}>
                          {row.is_projection ? `ML Projected (${selectedModel.toUpperCase()})` : (row.max_temp > 40 ? '+ Elevated Anomalies' : 'Baseline Climate')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: MANN-KENDALL & SEN'S SLOPE */}
          {activeTab === 'mannkendall' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', fontWeight: '700' }}>
                  Mann-Kendall Non-Parametric Trend Test & Sen's Slope Estimator
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Rigorous statistical methodology detecting monotonic warming trends and calculating the median rate of climate change per annum.
                </p>
              </div>

              {trendAnalysis && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                  <div className="intel-card">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Mann-Kendall Z-Statistic
                    </span>
                    <div className="mono-num" style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--accent-cyan)', margin: '0.4rem 0' }}>
                      {trendAnalysis.z_score}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Mann-Kendall Score (S): <strong className="mono-num" style={{ color: 'var(--text-primary)' }}>{trendAnalysis.mann_kendall_s}</strong>
                    </div>
                  </div>

                  <div className="intel-card">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      p-Value (Statistical Significance)
                    </span>
                    <div className="mono-num" style={{ fontSize: '2.2rem', fontWeight: '800', color: '#34d399', margin: '0.4rem 0' }}>
                      {trendAnalysis.p_value}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Significance: <strong style={{ color: '#34d399' }}>{trendAnalysis.significance}</strong>
                    </div>
                  </div>

                  <div className="intel-card">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Sen's Slope Magnitude
                    </span>
                    <div className="mono-num" style={{ fontSize: '2.2rem', fontWeight: '800', color: '#f59e0b', margin: '0.4rem 0' }}>
                      +{trendAnalysis.sens_slope}°C/yr
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Decadal Rate: <strong className="mono-num" style={{ color: '#fde68a' }}>+{(trendAnalysis.sens_slope * 10).toFixed(2)}°C / decade</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytical Interpretation Card */}
              <div className="intel-card" style={{ borderLeft: '3px solid var(--accent-cyan)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-cyan)', fontSize: '1rem', fontWeight: '700' }}>
                  Statistical Finding & Climatological Interpretation
                </h4>
                <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.65', fontSize: '0.92rem' }}>
                  {trendAnalysis ? trendAnalysis.interpretation : 'Loading statistical pipeline...'}
                </p>
                <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'rgba(12, 18, 32, 0.65)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <strong>Mathematical Formulation:</strong> The test calculates Kendall's tau rank correlation between temperature observations and sequential temporal indices, insensitive to non-normal errors or cyclical outliers.
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MODEL PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', fontWeight: '700' }}>
                  Machine Learning Model Performance & Residual Error Analysis
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Benchmarking of the hybrid climate forecasting ensemble (Random Forest Regressor + Bidirectional LSTM + Facebook Prophet).
                </p>
              </div>

              {modelPerf && (
                <>
                  {/* Accuracy KPIs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div className="intel-card">
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Mean Absolute Error (MAE)
                      </span>
                      <div className="mono-num" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-cyan)', margin: '0.4rem 0' }}>
                        {modelPerf.metrics.MAE}°C
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Average absolute deviation from ground truth
                      </div>
                    </div>

                    <div className="intel-card">
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Root Mean Squared Error (RMSE)
                      </span>
                      <div className="mono-num" style={{ fontSize: '2rem', fontWeight: '800', color: '#f87171', margin: '0.4rem 0' }}>
                        {modelPerf.metrics.RMSE}°C
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Penalizes larger outliers and extreme shocks
                      </div>
                    </div>

                    <div className="intel-card">
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        R² Goodness of Fit
                      </span>
                      <div className="mono-num" style={{ fontSize: '2rem', fontWeight: '800', color: '#34d399', margin: '0.4rem 0' }}>
                        {modelPerf.metrics.R2_Score}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        94.2% of temperature variance captured
                      </div>
                    </div>
                  </div>

                  {/* Residuals Table */}
                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Observation Year</th>
                          <th>Actual Recorded (°C)</th>
                          <th>Model Ensemble Predicted (°C)</th>
                          <th>Residual Error (Δ°C)</th>
                          <th>Error Tolerance Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modelPerf.comparison.map((row, i) => {
                          const isAcceptable = Math.abs(row.residual) <= 0.5;
                          return (
                            <tr key={i}>
                              <td className="mono-num" style={{ fontWeight: '700' }}>{row.year}</td>
                              <td className="mono-num">{row.actual}°C</td>
                              <td className="mono-num" style={{ color: 'var(--accent-cyan)' }}>{row.predicted}°C</td>
                              <td className="mono-num" style={{ color: isAcceptable ? '#34d399' : '#f87171', fontWeight: '700' }}>
                                {row.residual > 0 ? `+${row.residual}` : row.residual}°C
                              </td>
                              <td>
                                <span className={`badge ${isAcceptable ? 'badge-moderate' : 'badge-high'}`}>
                                  {isAcceptable ? 'Within ±0.5°C Bound' : 'Minor Residual Variance'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 8: UHI HEATMAP CHART */}
          {activeTab === 'heatmap' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', fontWeight: '700' }}>
                  Urban Heat Island & Thermal Intensity Heatmap Chart
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Multi-metric thermal matrix highlighting surface temperature hotspots, UHI deltas, vegetation deficit, and seasonal heat shifts for {cityInfo.name}.
                </p>
              </div>
              <HeatmapChart
                cityName={cityInfo.name}
                wards={wards}
                monthlyTrends={monthlyTrends}
                yearlyData={yearlyData}
              />
            </div>
          )}

          {/* TAB 9: HEAT MITIGATION & COOLING INTERVENTIONS */}
          {activeTab === 'mitigation' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', fontWeight: '700' }}>
                  Urban Heat Mitigation & Ward Cooling Action Plan — {cityInfo.name}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Targeted nature-based and high-albedo engineering interventions prioritized by ward LST, NDVI deficit, and vulnerability score.
                </p>
              </div>

              {/* Citywide Mitigation Impact Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div className="intel-card">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Priority Critical Wards</span>
                  <div className="mono-num" style={{ fontSize: '1.85rem', fontWeight: '800', color: '#f43f5e', margin: '0.35rem 0' }}>
                    {criticalCount} Wards
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Immediate cool-roof & shade corridor deployment</div>
                </div>
                <div className="intel-card">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Peak LST Reduction</span>
                  <div className="mono-num" style={{ fontSize: '1.85rem', fontWeight: '800', color: '#34d399', margin: '0.35rem 0' }}>
                    -2.8°C to -4.2°C
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Combined albedo + 30% canopy expansion impact</div>
                </div>
                <div className="intel-card">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Canopy NDVI</span>
                  <div className="mono-num" style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--accent-cyan)', margin: '0.35rem 0' }}>
                    &ge; 0.38 NDVI
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Current city average: {avgNDVI} NDVI</div>
                </div>
              </div>

              {/* Ward-by-Ward Mitigation Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.15rem' }}>
                {[...wards]
                  .sort((a, b) => b.risk_score - a.risk_score)
                  .map((w, idx) => {
                    const isCrit = w.risk_level === 'Critical';
                    const isHi = w.risk_level === 'High';
                    const badgeClass = isCrit ? 'badge-critical' : isHi ? 'badge-high' : 'badge-moderate';
                    const actionPlan = w.ndvi < 0.25
                      ? 'Miyawaki Pocket Forests + Street Tree Canopies + Cool-Reflective Roof Coating (SRI > 82)'
                      : w.lst_c >= 41
                      ? 'High-Albedo Solar Reflective Pavements + Bus-Stop Misting Hubs + Green Facades'
                      : 'Permeable Interlocking Pavers + Bioswale Stormwater Retention + Shade Pergolas';
                    const expectedCooling = isCrit ? '-3.6°C' : isHi ? '-2.4°C' : '-1.5°C';

                    return (
                      <div
                        key={idx}
                        className="intel-card"
                        style={{
                          padding: '1.2rem',
                          borderLeft: `3px solid ${isCrit ? '#f43f5e' : isHi ? '#f59e0b' : '#10b981'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.65rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{w.ward}</span>
                          <span className={`badge ${badgeClass}`}>{w.risk_level}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <span>Current LST: <strong className="mono-num" style={{ color: '#f87171' }}>{w.lst_c}°C</strong></span>
                          <span>NDVI: <strong className="mono-num" style={{ color: '#34d399' }}>{w.ndvi}</strong></span>
                          <span>Est. Cooling: <strong className="mono-num" style={{ color: 'var(--accent-cyan)' }}>{expectedCooling}</strong></span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          <strong>Primary Driver:</strong> {w.driver}
                        </div>
                        <div style={{
                          background: 'rgba(16, 185, 129, 0.08)',
                          border: '1px solid rgba(16, 185, 129, 0.22)',
                          borderRadius: '8px',
                          padding: '0.65rem 0.8rem',
                          fontSize: '0.8rem',
                          color: '#a7f3d0',
                          lineHeight: '1.45'
                        }}>
                          <strong style={{ color: '#34d399', display: 'block', marginBottom: '2px', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                            Recommended Mitigation Action
                          </strong>
                          {actionPlan}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
