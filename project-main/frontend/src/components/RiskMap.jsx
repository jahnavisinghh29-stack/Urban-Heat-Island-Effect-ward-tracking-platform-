import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const TILE_PROVIDERS = {
  osm: {
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }
  },
  satellite: {
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxZoom: 18
    }
  },
  dark: {
    name: 'Dark Carto',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
    options: {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }
  }
};

export default function RiskMap({ selectedCity, citiesData, wardFilter = 'all' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [activeTile, setActiveTile] = useState('osm');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up any stale map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const cityInfo = citiesData[selectedCity] || { lat: 28.6139, lng: 77.2090, zoom: 11 };

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([cityInfo.lat, cityInfo.lng], cityInfo.zoom || 11);

    // Initial tile layer (Default: OpenStreetMap, exactly like the original)
    const provider = TILE_PROVIDERS[activeTile] || TILE_PROVIDERS.osm;
    const tileLayer = L.tileLayer(provider.url, provider.options).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    layerGroupRef.current = layerGroup;

    // Invalidate size to guarantee the map renders without gray tiles
    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [selectedCity]);

  // Update tile layer when provider changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const provider = TILE_PROVIDERS[activeTile] || TILE_PROVIDERS.osm;
    const newTileLayer = L.tileLayer(provider.url, provider.options).addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [activeTile]);

  // Update Ward Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const cityInfo = citiesData[selectedCity] || { lat: 28.6139, lng: 77.2090, zoom: 11 };
    const wards = cityInfo.wards || [];

    const filtered = wardFilter === 'all'
      ? wards
      : wards.filter(w => w.risk_level.toLowerCase() === wardFilter.toLowerCase());

    filtered.forEach(ward => {
      const isCritical = ward.risk_level === 'Critical';
      const isHigh = ward.risk_level === 'High';
      const color = isCritical ? '#ef4444' : isHigh ? '#f59e0b' : '#10b981';
      const fillColor = isCritical ? '#dc2626' : isHigh ? '#d97706' : '#059669';

      const marker = L.circleMarker([ward.latitude, ward.longitude], {
        radius: isCritical ? 12 : 10,
        fillColor: fillColor,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.88
      });

      const badgeClass = isCritical ? 'badge-critical' : isHigh ? 'badge-high' : 'badge-moderate';

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #0f172a; padding: 10px 12px; min-width: 250px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <b style="font-size: 0.95rem; color: #0f172a; font-weight: 700;">${ward.ward}</b>
            <span class="badge ${badgeClass}" style="margin: 0;">${ward.risk_level}</span>
          </div>
          
          <div style="height: 1px; background: #e2e8f0; margin: 6px 0 10px 0;"></div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px;">
              <div style="font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 600;">Surface Temp</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #dc2626; font-family: 'JetBrains Mono', monospace;">${ward.lst_c}°C</div>
            </div>
            <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px;">
              <div style="font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 600;">NDVI Canopy</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #059669; font-family: 'JetBrains Mono', monospace;">${ward.ndvi}</div>
            </div>
          </div>

          <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #475569; margin-bottom: 3px; font-weight: 600;">
              <span>Vulnerability Score</span>
              <b style="color: ${color}; font-family: 'JetBrains Mono', monospace;">${ward.risk_score} / 100</b>
            </div>
            <div style="height: 5px; background: #cbd5e1; border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; width: ${ward.risk_score}%; background: ${color}; border-radius: 3px;"></div>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 8px; border-radius: 6px; border-left: 3px solid ${color};">
            <span style="font-size: 0.68rem; color: #64748b; display: block; font-weight: 700; text-transform: uppercase;">Thermal Driver</span>
            <span style="font-size: 0.78rem; color: #1e293b; display: block; margin-top: 2px;">${ward.driver}</span>
            <a href="${ward.source_url}" target="_blank" rel="noopener noreferrer" style="font-size: 0.7rem; color: #2563eb; text-decoration: underline; display: inline-block; margin-top: 6px; font-weight: 600;">
              Source: ${ward.source_name}
            </a>
          </div>
        </div>
      `);

      layerGroup.addLayer(marker);
    });

  }, [selectedCity, citiesData, wardFilter]);

  return (
    <div style={{
      width: '100%',
      height: '560px',
      position: 'relative',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)'
    }}>
      {/* Map DOM Target */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '560px', background: '#e2e8f0' }} />

      {/* Layer Switcher Controls (Top Right) */}
      <div style={{
        position: 'absolute',
        top: '14px',
        right: '14px',
        zIndex: 1000,
        display: 'flex',
        gap: '4px',
        background: 'rgba(12, 18, 32, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-subtle)',
        padding: '4px',
        borderRadius: '8px'
      }}>
        {Object.keys(TILE_PROVIDERS).map(key => (
          <button
            key={key}
            onClick={() => setActiveTile(key)}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: 'none',
              background: activeTile === key ? 'var(--accent-blue)' : 'transparent',
              color: activeTile === key ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {TILE_PROVIDERS[key].name}
          </button>
        ))}
      </div>

      {/* Floating Tactical Map Legend (Bottom Right) */}
      <div style={{
        position: 'absolute',
        bottom: '18px',
        right: '18px',
        zIndex: 1000,
        background: 'rgba(12, 18, 32, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        fontSize: '0.75rem'
      }}>
        <div style={{ fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Ward Heat Vulnerability
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', border: '1.5px solid #fff' }}></span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Critical Priority (&ge; 75)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', border: '1.5px solid #fff' }}></span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>High Stress (60 – 74)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', border: '1.5px solid #fff' }}></span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Moderate Thermal (&lt; 60)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
