import { useState, useEffect } from 'react';
import {
    Globe,
    Radio,
    Layers,
    Shield,
    Zap,
    Activity,
    CheckCircle,
    Clock,
    Compass,
    Wifi,
    Filter,
} from 'lucide-react';
import type { AwsRegionInfo } from '../types/awsTypes';
import { awsRegionsList } from '../data/awsRegionsData';

interface AwsRegionMapProps {
    onSelectRegion?: (region: AwsRegionInfo) => void;
    selectedRegionCode?: string;
}

// Major AWS Transoceanic Fiber Backbone Connections
const backboneCables = [
    { from: 'us-east-1', to: 'us-west-2', label: 'Trans-US 100GbE' },
    { from: 'us-east-1', to: 'ca-central-1', label: 'North Link' },
    { from: 'us-east-1', to: 'sa-east-1', label: 'Atlantic South Subsea Cable' },
    { from: 'us-east-1', to: 'eu-west-1', label: 'Transatlantic Express (MAREA)' },
    { from: 'eu-west-1', to: 'eu-central-1', label: 'Euro-Core Backbone' },
    { from: 'eu-west-1', to: 'eu-south-2', label: 'Iberian Link' },
    { from: 'eu-central-1', to: 'af-south-1', label: 'Euro-Africa Subsea (2Africa)' },
    { from: 'eu-central-1', to: 'ap-southeast-1', label: 'Eurasia High-Speed Fiber' },
    { from: 'us-west-2', to: 'ap-northeast-1', label: 'Transpacific Cable (JUPITER)' },
    { from: 'ap-northeast-1', to: 'ap-southeast-1', label: 'East Asia Ring' },
    { from: 'ap-southeast-1', to: 'ap-southeast-2', label: 'Oceania Subsea Cable' },
];

// Simulated Edge Locations across continents
const edgeLocations = [
    { name: 'Lima, Perú Edge PoP', x: 28, y: 62 },
    { name: 'Bogotá, Colombia PoP', x: 30, y: 55 },
    { name: 'Santiago, Chile PoP', x: 31, y: 78 },
    { name: 'Buenos Aires, Argentina PoP', x: 36, y: 80 },
    { name: 'Ciudad de México PoP', x: 21, y: 44 },
    { name: 'Madrid, España PoP', x: 47, y: 35 },
    { name: 'Londres, UK PoP', x: 48, y: 25 },
    { name: 'París, Francia PoP', x: 50, y: 29 },
    { name: 'Seúl, Corea PoP', x: 84, y: 36 },
    { name: 'Mumbai, India PoP', x: 70, y: 46 },
    { name: 'Auckland, NZ PoP', x: 94, y: 84 },
];

export default function AwsRegionMap({
    onSelectRegion,
    selectedRegionCode = 'us-east-1',
}: AwsRegionMapProps) {
    const [activeCode, setActiveCode] = useState(selectedRegionCode);
    const [hoveredRegion, setHoveredRegion] = useState<AwsRegionInfo | null>(null);
    const [selectedContinent, setSelectedContinent] = useState<string>('Todos');
    const [showBackbone, setShowBackbone] = useState(true);
    const [showEdgeLocations, setShowEdgeLocations] = useState(true);
    const [isPinging, setIsPinging] = useState(false);
    const [pingJitter, setPingJitter] = useState<{ [code: string]: number }>({});

    const selectedRegion = awsRegionsList.find((r) => r.code === activeCode) || awsRegionsList[0];

    const continents = ['Todos', 'América del Norte', 'América del Sur', 'Europa', 'Asia-Pacífico', 'África', 'Oceanía'];

    const filteredRegions = selectedContinent === 'Todos'
        ? awsRegionsList
        : awsRegionsList.filter((r) => r.continent === selectedContinent);

    const handleSelect = (region: AwsRegionInfo) => {
        setActiveCode(region.code);
        if (onSelectRegion) onSelectRegion(region);
    };

    // Run live ping simulation
    const handleTriggerPingTest = () => {
        setIsPinging(true);
        const newJitters: { [code: string]: number } = {};
        awsRegionsList.forEach((r) => {
            // random realistic variance ±4ms
            const variance = Math.floor(Math.random() * 8) - 4;
            newJitters[r.code] = Math.max(8, r.latencyMs + variance);
        });
        setPingJitter(newJitters);

        setTimeout(() => {
            setIsPinging(false);
        }, 2400);
    };

    useEffect(() => {
        if (selectedRegionCode && selectedRegionCode !== activeCode) {
            setActiveCode(selectedRegionCode);
        }
    }, [selectedRegionCode]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Control Bar & Filter Tabs */}
            <div
                style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
            >
                {/* Continent Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b', fontSize: 12.5, fontWeight: 700, marginRight: 4 }}>
                        <Filter size={14} /> Continentes:
                    </div>
                    {continents.map((cont) => {
                        const isSelected = selectedContinent === cont;
                        return (
                            <button
                                key={cont}
                                onClick={() => setSelectedContinent(cont)}
                                style={{
                                    padding: '5px 12px',
                                    borderRadius: 20,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    border: isSelected ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                                    background: isSelected ? '#eff6ff' : '#ffffff',
                                    color: isSelected ? '#1d4ed8' : '#475569',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {cont}
                            </button>
                        );
                    })}
                </div>

                {/* Action Toggles */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                        onClick={() => setShowBackbone(!showBackbone)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            border: showBackbone ? '1.5px solid #3b82f6' : '1px solid #cbd5e1',
                            background: showBackbone ? 'rgba(37, 99, 235, 0.08)' : '#ffffff',
                            color: showBackbone ? '#2563eb' : '#64748b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <Activity size={13} color={showBackbone ? '#2563eb' : '#94a3b8'} />
                        <span>Red Troncal 100G</span>
                    </button>

                    <button
                        onClick={() => setShowEdgeLocations(!showEdgeLocations)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            border: showEdgeLocations ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                            background: showEdgeLocations ? 'rgba(16, 185, 129, 0.08)' : '#ffffff',
                            color: showEdgeLocations ? '#059669' : '#64748b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <Wifi size={13} color={showEdgeLocations ? '#059669' : '#94a3b8'} />
                        <span>Edge PoPs (+600)</span>
                    </button>

                    <button
                        onClick={handleTriggerPingTest}
                        disabled={isPinging}
                        style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            border: 'none',
                            background: isPinging ? '#059669' : '#2563eb',
                            color: '#ffffff',
                            cursor: isPinging ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <Zap size={13} className={isPinging ? 'spin' : ''} />
                        <span>{isPinging ? 'Midiendo Latencia...' : '⚡ Test de Latencia'}</span>
                    </button>
                </div>
            </div>

            {/* World Map Container */}
            <div
                style={{
                    background: 'linear-gradient(180deg, #070c18 0%, #0d1627 100%)',
                    border: '1px solid #1e293b',
                    borderRadius: 18,
                    padding: '24px 20px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
                    minHeight: 520,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                {/* Background Coordinates Grid Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
              radial-gradient(rgba(59, 130, 246, 0.18) 1.5px, transparent 1.5px),
              linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
            `,
                        backgroundSize: '24px 24px, 80px 80px, 80px 80px',
                        pointerEvents: 'none',
                    }}
                />

                {/* Global Map Header HUD */}
                <div
                    style={{
                        position: 'relative',
                        zIndex: 15,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                        marginBottom: 10,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: 8,
                                background: 'rgba(37, 99, 235, 0.25)',
                                border: '1px solid rgba(59, 130, 246, 0.5)',
                                color: '#60a5fa',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Globe size={18} />
                        </div>
                        <div>
                            <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 15, letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>Mapa Interactivo de Infraestructura Global AWS</span>
                                <span style={{ fontSize: 10, background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>
                                    LIVE 100 GbE
                                </span>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: 11.5 }}>
                                Haz clic en cualquier nodo o pin para inspeccionar zonas de disponibilidad, latencia y servicios.
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, color: '#cbd5e1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} />
                            <span>Regiones AWS ({awsRegionsList.length})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                            <span>Edge PoPs (+600)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Radio size={13} color="#f59e0b" className="spin" />
                            <span style={{ color: '#fde047' }}>SLA Global 99.99%</span>
                        </div>
                    </div>
                </div>

                {/* SVG World Map Canvas Area */}
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '380px',
                        margin: '10px 0',
                    }}
                >
                    {/* Detailed SVG World Map Vector Backdrop */}
                    <svg
                        viewBox="0 0 1000 500"
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            pointerEvents: 'none',
                        }}
                    >
                        <defs>
                            {/* Glowing gradients */}
                            <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                            </linearGradient>

                            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Latitude Equator & Tropic Reference Lines */}
                        <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3, 6" />
                        <line x1="0" y1="170" x2="1000" y2="170" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="2, 8" />
                        <line x1="0" y1="330" x2="1000" y2="330" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="2, 8" />

                        {/* Continent Landmasses Stylized Vectors */}
                        {/* North America */}
                        <path
                            d="M 120 70 Q 180 50 250 60 Q 280 80 270 120 Q 290 150 260 200 Q 220 220 190 260 Q 150 200 130 150 Q 100 120 120 70 Z"
                            fill="rgba(30, 41, 59, 0.65)"
                            stroke="rgba(71, 85, 105, 0.45)"
                            strokeWidth="1.2"
                        />
                        {/* Greenland */}
                        <path
                            d="M 330 35 Q 370 30 380 65 Q 350 90 325 70 Z"
                            fill="rgba(30, 41, 59, 0.45)"
                            stroke="rgba(71, 85, 105, 0.35)"
                            strokeWidth="1"
                        />
                        {/* Central America & Caribbean */}
                        <path
                            d="M 190 260 Q 220 280 250 295 Q 260 305 280 295"
                            fill="none"
                            stroke="rgba(71, 85, 105, 0.5)"
                            strokeWidth="1.5"
                        />
                        {/* South America */}
                        <path
                            d="M 270 300 Q 340 310 380 360 Q 370 420 340 460 Q 300 480 290 440 Q 270 380 260 340 Z"
                            fill="rgba(30, 41, 59, 0.65)"
                            stroke="rgba(71, 85, 105, 0.45)"
                            strokeWidth="1.2"
                        />
                        {/* Europe */}
                        <path
                            d="M 450 110 Q 510 100 550 120 Q 560 160 520 185 Q 470 190 450 160 Z"
                            fill="rgba(30, 41, 59, 0.65)"
                            stroke="rgba(71, 85, 105, 0.45)"
                            strokeWidth="1.2"
                        />
                        {/* United Kingdom & Ireland */}
                        <path
                            d="M 445 125 Q 460 115 465 135 Q 450 145 445 125 Z"
                            fill="rgba(30, 41, 59, 0.7)"
                            stroke="rgba(71, 85, 105, 0.5)"
                            strokeWidth="1"
                        />
                        {/* Africa */}
                        <path
                            d="M 460 200 Q 550 190 570 260 Q 580 340 550 410 Q 510 430 490 380 Q 450 300 460 200 Z"
                            fill="rgba(30, 41, 59, 0.65)"
                            stroke="rgba(71, 85, 105, 0.45)"
                            strokeWidth="1.2"
                        />
                        {/* Asia */}
                        <path
                            d="M 550 110 Q 680 80 840 100 Q 890 140 850 230 Q 780 270 720 260 Q 680 290 620 230 Q 560 200 550 110 Z"
                            fill="rgba(30, 41, 59, 0.65)"
                            stroke="rgba(71, 85, 105, 0.45)"
                            strokeWidth="1.2"
                        />
                        {/* Japan */}
                        <path
                            d="M 870 160 Q 885 175 875 195 Q 865 185 870 160 Z"
                            fill="rgba(30, 41, 59, 0.75)"
                            stroke="rgba(71, 85, 105, 0.6)"
                            strokeWidth="1"
                        />
                        {/* Australia / Oceania */}
                        <path
                            d="M 790 340 Q 890 330 910 390 Q 880 440 820 440 Q 770 410 790 340 Z"
                            fill="rgba(30, 41, 59, 0.65)"
                            stroke="rgba(71, 85, 105, 0.45)"
                            strokeWidth="1.2"
                        />

                        {/* Inter-Region High-Speed Fiber Backbone Cables (Curved Arcs) */}
                        {showBackbone && backboneCables.map((cable) => {
                            const r1 = awsRegionsList.find((r) => r.code === cable.from);
                            const r2 = awsRegionsList.find((r) => r.code === cable.to);
                            if (!r1 || !r2) return null;

                            const x1 = r1.coordinates.x * 10;
                            const y1 = r1.coordinates.y * 5;
                            const x2 = r2.coordinates.x * 10;
                            const y2 = r2.coordinates.y * 5;

                            // Quadratic curve control point with slight arc
                            const cx = (x1 + x2) / 2;
                            const cy = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.15;

                            return (
                                <g key={`${cable.from}-${cable.to}`}>
                                    {/* Cable Glow */}
                                    <path
                                        d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                                        fill="none"
                                        stroke="rgba(37, 99, 235, 0.25)"
                                        strokeWidth="4"
                                    />
                                    {/* Animated Active Cable */}
                                    <path
                                        d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                                        fill="none"
                                        stroke="url(#cableGrad)"
                                        strokeWidth="1.8"
                                        className="map-cable-active"
                                    />
                                </g>
                            );
                        })}
                    </svg>

                    {/* Edge Locations Small Dots */}
                    {showEdgeLocations && edgeLocations.map((edge) => (
                        <div
                            key={edge.name}
                            title={edge.name}
                            style={{
                                position: 'absolute',
                                top: `${edge.y}%`,
                                left: `${edge.x}%`,
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: '#10b981',
                                boxShadow: '0 0 6px #34d399',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                opacity: 0.85,
                                zIndex: 8,
                            }}
                        />
                    ))}

                    {/* Interactive Region Pins / Pulsars */}
                    {filteredRegions.map((region) => {
                        const isSelected = region.code === activeCode;
                        const isHovered = hoveredRegion?.code === region.code;
                        const currentLatency = pingJitter[region.code] || region.latencyMs;

                        return (
                            <div
                                key={region.code}
                                className="map-pin-btn"
                                style={{
                                    top: `${region.coordinates.y}%`,
                                    left: `${region.coordinates.x}%`,
                                }}
                                onClick={() => handleSelect(region)}
                                onMouseEnter={() => setHoveredRegion(region)}
                                onMouseLeave={() => setHoveredRegion(null)}
                            >
                                {/* Radar / Reticle when selected */}
                                {isSelected && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            width: 48,
                                            height: 48,
                                            transform: 'translate(-50%, -50%)',
                                            borderRadius: '50%',
                                            border: '1.5px dashed #60a5fa',
                                            pointerEvents: 'none',
                                            animation: 'mapRadar 10s linear infinite',
                                        }}
                                    />
                                )}

                                {/* Outer Concentric Ping Rings */}
                                <div
                                    className="map-ping-ring"
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        width: isSelected ? 34 : 22,
                                        height: isSelected ? 34 : 22,
                                        transform: 'translate(-50%, -50%)',
                                        borderRadius: '50%',
                                        background: isSelected ? 'rgba(59, 130, 246, 0.45)' : 'rgba(16, 185, 129, 0.35)',
                                        pointerEvents: 'none',
                                    }}
                                />

                                {/* Main Region Pin Core Button */}
                                <div
                                    style={{
                                        width: isSelected ? 32 : 24,
                                        height: isSelected ? 32 : 24,
                                        borderRadius: '50%',
                                        background: isSelected
                                            ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                                            : 'linear-gradient(135deg, #0f172a, #1e293b)',
                                        border: isSelected ? '2px solid #ffffff' : '1.5px solid #60a5fa',
                                        boxShadow: isSelected
                                            ? '0 0 20px rgba(96, 165, 250, 0.9), 0 4px 10px rgba(0,0,0,0.5)'
                                            : '0 0 10px rgba(59, 130, 246, 0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: isSelected ? 14 : 11,
                                        position: 'relative',
                                        zIndex: 12,
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <span>{region.flag}</span>
                                </div>

                                {/* Mini Badge Below Marker */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        marginTop: 4,
                                        whiteSpace: 'nowrap',
                                        background: isSelected ? 'rgba(37, 99, 235, 0.95)' : 'rgba(15, 23, 42, 0.85)',
                                        backdropFilter: 'blur(6px)',
                                        border: isSelected ? '1px solid #93c5fd' : '1px solid rgba(255, 255, 255, 0.15)',
                                        color: '#ffffff',
                                        padding: '1px 6px',
                                        borderRadius: 6,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        pointerEvents: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 3,
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                    }}
                                >
                                    <span>{region.code}</span>
                                    <span style={{ color: currentLatency < 50 ? '#4ade80' : currentLatency < 120 ? '#fde047' : '#f87171' }}>
                                        • {currentLatency}ms
                                    </span>
                                </div>

                                {/* Hover Tooltip Card */}
                                {isHovered && !isSelected && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: '125%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: '#0f172a',
                                            border: '1px solid #3b82f6',
                                            borderRadius: 10,
                                            padding: '10px 14px',
                                            color: '#ffffff',
                                            fontSize: 12,
                                            width: 210,
                                            zIndex: 99,
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        <div style={{ fontWeight: 800, fontSize: 13, color: '#93c5fd', marginBottom: 2 }}>
                                            {region.name}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 6 }}>{region.location}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                            <span>Zonas (AZs): <strong style={{ color: '#4ade80' }}>{region.availabilityZones}</strong></span>
                                            <span>Ping: <strong style={{ color: '#60a5fa' }}>{currentLatency} ms</strong></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Selected Region Status Ribbon Bottom HUD */}
                <div
                    style={{
                        position: 'relative',
                        zIndex: 15,
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 12,
                        padding: '12px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                        fontSize: 12.5,
                        color: '#cbd5e1',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{selectedRegion.flag}</span>
                        <div>
                            <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 13.5 }}>
                                {selectedRegion.name} ({selectedRegion.code})
                            </div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                {selectedRegion.location} • {selectedRegion.continent}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                        <div>
                            <span style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>Zonas de Disponibilidad:</span>
                            <strong style={{ color: '#60a5fa', fontSize: 13 }}>{selectedRegion.availabilityZones} AZs independientes</strong>
                        </div>

                        <div>
                            <span style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>Latencia estimada:</span>
                            <strong style={{ color: '#4ade80', fontSize: 13 }}>
                                {pingJitter[selectedRegion.code] || selectedRegion.latencyMs} ms
                            </strong>
                        </div>

                        <div>
                            <span style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>Servicios AWS Activos:</span>
                            <strong style={{ color: '#fde047', fontSize: 13 }}>{selectedRegion.activeServicesCount}+ Servicios</strong>
                        </div>

                        <div>
                            <span style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>Estado SLA:</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#4ade80', fontWeight: 700, fontSize: 12 }}>
                                <CheckCircle size={13} /> {selectedRegion.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Region Deep Inspection HUD */}
            <div
                style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    padding: '24px 28px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Compass size={22} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1e293b' }}>
                                Ficha Técnica de la Región: {selectedRegion.code}
                            </h3>
                            <span style={{ fontSize: 12.5, color: '#64748b' }}>
                                Detalles de hardware, aislamiento de fallos y certificaciones de cumplimiento de datos.
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                            Lanzamiento: {selectedRegion.launchedYear || 2012}
                        </span>
                        <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                            Multi-AZ Síncrono
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                            <Layers size={16} />
                            <span>Aislamiento de Zonas (AZs)</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                            Cuenta con <strong>{selectedRegion.availabilityZones} Zonas de Disponibilidad</strong> interconectadas con fibra óptica privada de baja latencia (&lt;1ms).
                        </p>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                            <Zap size={16} />
                            <span>Edge PoPs de Proximidad</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                            Respaldada por <strong>{selectedRegion.edgeLocationsCount || 20} Edge Locations</strong> de Amazon CloudFront para aceleración web y caché de assets.
                        </p>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d97706', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                            <Clock size={16} />
                            <span>Latencia Promedio</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                            Tiempo de respuesta RTT de <strong>{pingJitter[selectedRegion.code] || selectedRegion.latencyMs} ms</strong> mediante la red troncal global de Amazon.
                        </p>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7c3aed', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                            <Shield size={16} />
                            <span>Soberanía de Datos</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                            Cifrado estricto en reposo con AWS KMS y residencia física garantizada dentro de {selectedRegion.location}.
                        </p>
                    </div>
                </div>

                {/* Compliance Badges List */}
                <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8 }}>
                        Estándares y Certificaciones de Seguridad Homologados en {selectedRegion.code}:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {(selectedRegion.complianceList || ['ISO 27001', 'SOC 1/2/3', 'PCI-DSS', 'HIPAA']).map((comp) => (
                            <span
                                key={comp}
                                style={{
                                    background: '#f1f5f9',
                                    color: '#334155',
                                    border: '1px solid #cbd5e1',
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                }}
                            >
                                <CheckCircle size={12} color="#16a34a" />
                                {comp}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
