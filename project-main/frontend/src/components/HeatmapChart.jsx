import React, { useState, useMemo } from 'react';

function getCellColor(ratio) {
  const clamped = Math.max(0, Math.min(1, ratio));
  if (clamped < 0.25) return 'rgba(16, 185, 129, 0.28)';
  if (clamped < 0.5) return 'rgba(250, 204, 21, 0.36)';
  if (clamped < 0.75) return 'rgba(249, 115, 22, 0.58)';
  return 'rgba(244, 63, 94, 0.82)';
}

function getCellBorder(ratio) {
  const clamped = Math.max(0, Math.min(1, ratio));
  if (clamped < 0.25) return 'rgba(16, 185, 129, 0.55)';
  if (clamped < 0.5) return 'rgba(250, 204, 21, 0.65)';
  if (clamped < 0.75) return 'rgba(249, 115, 22, 0.78)';
  return 'rgba(244, 63, 94, 0.95)';
}

export default function HeatmapChart({ cityName, wards = [], monthlyTrends = [], yearlyData = [] }) {
  const [sortBy, setSortBy] = useState('risk_score');
  const [hoveredCell, setHoveredCell] = useState(null);

  const matrixRows = useMemo(() => {
    const rows = wards.map((w, idx) => {
      const lst = Number(w.lst_c ?? 38);
      const ndvi = Number(w.ndvi ?? 0.25);
      const riskScore = Number(w.risk_score ?? 60);
      const uhiDelta = Number(Math.max(1.2, (lst - 32.5) * 0.65 + (0.5 - ndvi) * 4.5).toFixed(1));
      const thermalRatio = Number((lst / (ndvi || 0.1)).toFixed(1));
      return {
        id: idx,
        ward: w.ward || `Ward ${idx + 1}`,
        lst_c: lst,
        ndvi,
        risk_score: riskScore,
        uhi_delta: uhiDelta,
        thermal_ratio: thermalRatio,
        risk_level: w.risk_level || 'Moderate',
        driver: w.driver || 'Urban Impervious Surface'
      };
    });

    return rows.sort((a, b) => {
      if (sortBy === 'ndvi') return a.ndvi - b.ndvi;
      return (b[sortBy] ?? 0) - (a[sortBy] ?? 0);
    });
  }, [wards, sortBy]);

  const seasonalCells = useMemo(() => {
    if (!Array.isArray(monthlyTrends) || monthlyTrends.length === 0) return [];
    return monthlyTrends.map((m, idx) => ({
      id: idx,
      month: m.month || `M${idx + 1}`,
      avg_temp: Number(m.avg_temp ?? 30),
      lst_temp: Number(m.lst_temp ?? 36),
      uhi_intensity: Number(m.uhi_intensity ?? 4.5)
    }));
  }, [monthlyTrends]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Ward x Thermal Metrics Matrix Heatmap */}
      <div className="intel-card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Ward Thermal & UHI Heatmap Matrix — {cityName}
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Color-intensity matrix across municipal wards (hover any cell for exact thermal telemetry).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Sort Wards:
            </span>
            {[
              { key: 'risk_score', label: 'Risk Score' },
              { key: 'lst_c', label: 'LST (°C)' },
              { key: 'uhi_delta', label: 'UHI Delta' },
              { key: 'ndvi', label: 'Lowest NDVI' }
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: sortBy === opt.key ? 'var(--accent-blue)' : 'rgba(12, 18, 32, 0.75)',
                  color: sortBy === opt.key ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <i style={{ width: 12, height: 12, borderRadius: 3, background: getCellColor(0.1), border: `1px solid ${getCellBorder(0.1)}`, display: 'inline-block' }} />
              Cool / Low
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <i style={{ width: 12, height: 12, borderRadius: 3, background: getCellColor(0.38), border: `1px solid ${getCellBorder(0.38)}`, display: 'inline-block' }} />
              Moderate
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <i style={{ width: 12, height: 12, borderRadius: 3, background: getCellColor(0.62), border: `1px solid ${getCellBorder(0.62)}`, display: 'inline-block' }} />
              Elevated
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <i style={{ width: 12, height: 12, borderRadius: 3, background: getCellColor(0.9), border: `1px solid ${getCellBorder(0.9)}`, display: 'inline-block' }} />
              Severe Heat
            </span>
          </div>

          {hoveredCell && (
            <div style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-cyan)',
              background: 'rgba(12, 18, 32, 0.85)',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-highlight)'
            }}>
              {hoveredCell}
            </div>
          )}
        </div>

        {/* Heatmap Grid */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '6px', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Ward</th>
                <th style={{ textAlign: 'center', padding: '6px 8px' }}>Surface LST (°C)</th>
                <th style={{ textAlign: 'center', padding: '6px 8px' }}>UHI Delta (Δ°C)</th>
                <th style={{ textAlign: 'center', padding: '6px 8px' }}>NDVI Canopy</th>
                <th style={{ textAlign: 'center', padding: '6px 8px' }}>Risk Score</th>
                <th style={{ textAlign: 'center', padding: '6px 8px' }}>LST/NDVI Ratio</th>
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((r) => {
                const lstRatio = (r.lst_c - 30) / 18;
                const uhiRatio = (r.uhi_delta - 1) / 9;
                const ndviHeatRatio = 1 - Math.min(1, r.ndvi / 0.65);
                const riskRatio = r.risk_score / 100;
                const ratioHeat = Math.min(1, (r.thermal_ratio - 50) / 250);

                return (
                  <tr key={r.id}>
                    <td style={{
                      padding: '8px 10px',
                      background: 'rgba(12, 18, 32, 0.7)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap'
                    }}>
                      {r.ward}
                    </td>

                    <td
                      onMouseEnter={() => setHoveredCell(`${r.ward} • LST: ${r.lst_c}°C (${r.driver})`)}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'center',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '700',
                        color: '#ffffff',
                        background: getCellColor(lstRatio),
                        border: `1px solid ${getCellBorder(lstRatio)}`,
                        cursor: 'pointer'
                      }}
                    >
                      {r.lst_c}°C
                    </td>

                    <td
                      onMouseEnter={() => setHoveredCell(`${r.ward} • UHI Delta: +${r.uhi_delta}°C`)}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'center',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '700',
                        color: '#ffffff',
                        background: getCellColor(uhiRatio),
                        border: `1px solid ${getCellBorder(uhiRatio)}`,
                        cursor: 'pointer'
                      }}
                    >
                      +{r.uhi_delta}°C
                    </td>

                    <td
                      onMouseEnter={() => setHoveredCell(`${r.ward} • NDVI Canopy: ${r.ndvi}`)}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'center',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '700',
                        color: '#ffffff',
                        background: getCellColor(ndviHeatRatio),
                        border: `1px solid ${getCellBorder(ndviHeatRatio)}`,
                        cursor: 'pointer'
                      }}
                    >
                      {r.ndvi}
                    </td>

                    <td
                      onMouseEnter={() => setHoveredCell(`${r.ward} • Vulnerability Score: ${r.risk_score}/100 (${r.risk_level})`)}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'center',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '700',
                        color: '#ffffff',
                        background: getCellColor(riskRatio),
                        border: `1px solid ${getCellBorder(riskRatio)}`,
                        cursor: 'pointer'
                      }}
                    >
                      {r.risk_score}
                    </td>

                    <td
                      onMouseEnter={() => setHoveredCell(`${r.ward} • LST/NDVI Thermal Ratio: ${r.thermal_ratio}`)}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'center',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '700',
                        color: '#ffffff',
                        background: getCellColor(ratioHeat),
                        border: `1px solid ${getCellBorder(ratioHeat)}`,
                        cursor: 'pointer'
                      }}
                    >
                      {r.thermal_ratio}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Seasonal Intensity Heatmap Strip */}
      {seasonalCells.length > 0 && (
        <div className="intel-card">
          <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Monthly UHI & Surface Heat Heatmap Strip ({cityName})
          </h4>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Month-by-month thermal intensity across Ambient Air (°C), Surface LST (°C), and UHI Delta (Δ°C).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '5px', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Metric</th>
                  {seasonalCells.map((c) => (
                    <th key={c.id} style={{ textAlign: 'center', padding: '4px 6px' }}>{c.month}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 8px', fontWeight: '600', color: 'var(--text-secondary)' }}>Ambient °C</td>
                  {seasonalCells.map((c) => {
                    const r = (c.avg_temp - 12) / 30;
                    return (
                      <td
                        key={c.id}
                        title={`${c.month} Ambient: ${c.avg_temp}°C`}
                        style={{
                          padding: '7px 4px',
                          textAlign: 'center',
                          borderRadius: '5px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '700',
                          color: '#fff',
                          background: getCellColor(r),
                          border: `1px solid ${getCellBorder(r)}`
                        }}
                      >
                        {c.avg_temp}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px', fontWeight: '600', color: 'var(--text-secondary)' }}>Surface LST °C</td>
                  {seasonalCells.map((c) => {
                    const r = (c.lst_temp - 16) / 34;
                    return (
                      <td
                        key={c.id}
                        title={`${c.month} LST: ${c.lst_temp}°C`}
                        style={{
                          padding: '7px 4px',
                          textAlign: 'center',
                          borderRadius: '5px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '700',
                          color: '#fff',
                          background: getCellColor(r),
                          border: `1px solid ${getCellBorder(r)}`
                        }}
                      >
                        {c.lst_temp}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px', fontWeight: '600', color: 'var(--text-secondary)' }}>UHI +Δ°C</td>
                  {seasonalCells.map((c) => {
                    const r = c.uhi_intensity / 10;
                    return (
                      <td
                        key={c.id}
                        title={`${c.month} UHI Intensity: +${c.uhi_intensity}°C`}
                        style={{
                          padding: '7px 4px',
                          textAlign: 'center',
                          borderRadius: '5px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '700',
                          color: '#fff',
                          background: getCellColor(r),
                          border: `1px solid ${getCellBorder(r)}`
                        }}
                      >
                        +{c.uhi_intensity}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
