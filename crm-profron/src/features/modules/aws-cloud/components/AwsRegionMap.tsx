import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import {
    Globe,
    MapPin,
    Filter,
    Home,
    Plus,
    Minus,
    Check,
} from 'lucide-react';
import type { AwsRegionInfo } from '../types/awsTypes';
import { awsRegionsList, getRegionStatus } from '../data/awsRegionsData';
import StatusBadge from './StatusBadge';

interface AwsRegionMapProps {
    onSelectRegion?: (region: AwsRegionInfo) => void;
    selectedRegionCode?: string | null;
    proposalRegion?: string | null;
    proposalServices?: string[];
    onSetAsProposalRegion?: (region: AwsRegionInfo) => void;
    hasActiveProposal?: boolean;
}

// Approximate center coordinates per continent for smooth orbital camera rotation
const CONTINENT_COORDINATES: Record<string, { lat: number; lng: number }> = {
    'Todos': { lat: 20, lng: 0 },
    'América del Norte': { lat: 38, lng: -97 },
    'América del Sur': { lat: -15, lng: -60 },
    'Europa': { lat: 50, lng: 15 },
    'Asia-Pacífico': { lat: 25, lng: 105 },
    'África': { lat: 5, lng: 20 },
    'Oceanía': { lat: -25, lng: 135 },
};

// Calibrated label placement offsets to prevent overlapping and clipping
const REGION_LABEL_CONFIG: Record<string, { dx: number; dy: number; centerX?: any; centerY?: any }> = {
    'ca-central-1': { dx: 0, dy: -18, centerX: am5.p50, centerY: am5.p100 }, // Shifted up into Canada
    'us-east-1': { dx: 14, dy: 10, centerX: am5.p0, centerY: am5.p0 },     // Shifted down-right towards Atlantic
    'us-west-2': { dx: -16, dy: 0, centerX: am5.p100, centerY: am5.p50 },  // Shifted west into Pacific NW
    'eu-west-1': { dx: -16, dy: -6, centerX: am5.p100, centerY: am5.p50 }, // Shifted west into Atlantic
    'eu-central-1': { dx: 16, dy: 6, centerX: am5.p0, centerY: am5.p50 },   // Shifted east into Germany/East Europe
    'sa-east-1': { dx: 14, dy: -12, centerX: am5.p0, centerY: am5.p100 },  // Shifted up-right to avoid bottom edge clipping
};

export default function AwsRegionMap({
    onSelectRegion,
    selectedRegionCode = null,
    proposalRegion,
    proposalServices = [],
    onSetAsProposalRegion,
    hasActiveProposal = false,
}: AwsRegionMapProps) {
    const [activeCode, setActiveCode] = useState<string | null>(selectedRegionCode || null);
    const [selectedContinent, setSelectedContinent] = useState<string>('Todos');

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<am5map.MapChart | null>(null);

    const selectedRegion = activeCode
        ? awsRegionsList.find((r) => r.code === activeCode) || null
        : null;

    const continents = ['Todos', 'América del Norte', 'América del Sur', 'Europa', 'Asia-Pacífico', 'África', 'Oceanía'];

    const filteredRegions = selectedContinent === 'Todos'
        ? awsRegionsList
        : awsRegionsList.filter((r) => r.continent === selectedContinent);

    const handleSelect = (region: AwsRegionInfo) => {
        setActiveCode(region.code);
        if (onSelectRegion) onSelectRegion(region);
    };

    // Handler for continent filters: changes filter and animates globe rotation
    const handleContinentClick = (cont: string) => {
        setSelectedContinent(cont);
        const target = CONTINENT_COORDINATES[cont] || CONTINENT_COORDINATES['Todos'];
        if (chartInstanceRef.current) {
            chartInstanceRef.current.animate({
                key: 'rotationX',
                to: -target.lng,
                duration: 1200,
                easing: am5.ease.out(am5.ease.cubic),
            });
            chartInstanceRef.current.animate({
                key: 'rotationY',
                to: -target.lat,
                duration: 1200,
                easing: am5.ease.out(am5.ease.cubic),
            });
        }
    };

    // Zoom Handlers for Floating Control Widget
    const handleGoHome = () => {
        if (chartInstanceRef.current && selectedRegion) {
            chartInstanceRef.current.goHome();
            chartInstanceRef.current.animate({
                key: 'rotationX',
                to: -selectedRegion.coordinates.lng,
                duration: 1000,
                easing: am5.ease.out(am5.ease.cubic),
            });
            chartInstanceRef.current.animate({
                key: 'rotationY',
                to: -selectedRegion.coordinates.lat,
                duration: 1000,
                easing: am5.ease.out(am5.ease.cubic),
            });
        }
    };

    const handleZoomIn = () => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.zoomIn();
        }
    };

    const handleZoomOut = () => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.zoomOut();
        }
    };

    useEffect(() => {
        if (selectedRegionCode && selectedRegionCode !== activeCode) {
            setActiveCode(selectedRegionCode);
        }
    }, [selectedRegionCode, activeCode]);

    // amCharts 5 initialization with useLayoutEffect & root.dispose() cleanup
    useLayoutEffect(() => {
        if (!chartRef.current) return;

        const root = am5.Root.new(chartRef.current);
        root.setThemes([am5themes_Animated.new(root)]);

        // 1. 3D Orthographic Map Chart
        const chart = root.container.children.push(
            am5map.MapChart.new(root, {
                panX: 'rotateX',
                panY: 'rotateY',
                projection: am5map.geoOrthographic(),
                paddingBottom: 35,
                paddingTop: 20,
                paddingLeft: 20,
                paddingRight: 20,
                wheelY: 'zoom',
                maxZoomLevel: 6,
                minZoomLevel: 0.8,
            })
        );
        chartInstanceRef.current = chart;

        // 2. Dark Mode Globe Sphere Background
        const backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
        backgroundSeries.mapPolygons.template.setAll({
            fill: am5.color(0x0a1128),
            fillOpacity: 0.94,
            stroke: am5.color(0x1e293b),
            strokeWidth: 1.5,
        });
        backgroundSeries.data.push({
            geometry: am5map.getGeoRectangle(90, 180, -90, -180),
        });

        // 3. Subtle Celestial Graticule Lines
        const graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(root, {}));
        graticuleSeries.mapLines.template.setAll({
            stroke: am5.color(0x334155),
            strokeOpacity: 0.22,
            strokeWidth: 0.6,
        });

        // 4. Country Polygon Series (#1E293B, border #334155)
        const polygonSeries = chart.series.push(
            am5map.MapPolygonSeries.new(root, {
                geoJSON: am5geodata_worldLow,
            })
        );

        polygonSeries.mapPolygons.template.setAll({
            fill: am5.color(0x1e293b),
            stroke: am5.color(0x334155),
            strokeWidth: 0.7,
            interactive: true,
        });

        polygonSeries.mapPolygons.template.states.create('hover', {
            fill: am5.color(0x273549),
            stroke: am5.color(0x475569),
        });

        // Interactivity: Click on country centers it smoothly
        polygonSeries.mapPolygons.template.events.on('click', (ev) => {
            const dataItem = ev.target.dataItem;
            if (dataItem) {
                polygonSeries.zoomToDataItem(dataItem as any);
            }
        });

        // 5. Connection Lines (MapLineSeries): Curved 3D lines from Primary Proposal Region to all other regions
        const lineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
        lineSeries.mapLines.template.setAll({
            stroke: am5.color(0x3B82F6),
            strokeOpacity: 0.4,
            strokeWidth: 1.5,
            strokeDasharray: [4, 4],
        });

        const primaryRegionObj = proposalRegion
            ? awsRegionsList.find((r) => proposalRegion.includes(r.code)) || null
            : null;

        if (primaryRegionObj) {
            const connectionLines = filteredRegions
                .filter((r) => r.code !== primaryRegionObj.code)
                .map((target) => ({
                    lineString: {
                        type: 'LineString',
                        coordinates: [
                            [primaryRegionObj.coordinates.lng, primaryRegionObj.coordinates.lat],
                            [target.coordinates.lng, target.coordinates.lat],
                        ],
                    },
                }));
            lineSeries.data.setAll(connectionLines);
        } else {
            lineSeries.data.setAll([]);
        }

        // 6. Native Tooltip for MapPointSeries: Light Background & Dark Text
        const customTooltip = am5.Tooltip.new(root, {
            getFillFromSprite: false,
            labelText: '{name} ({code})',
        });
        customTooltip.get('background')?.setAll({
            fill: am5.color(0xffffff),
            fillOpacity: 0.96,
            stroke: am5.color(0xcbd5e1),
            strokeWidth: 1,
            shadowColor: am5.color(0x000000),
            shadowBlur: 8,
            shadowOpacity: 0.12,
        });
        customTooltip.label.setAll({
            fill: am5.color(0x0f172a),
            fontSize: 12,
            fontWeight: '600',
        });

        // 7. Fixed Point Series for AWS Regions
        const pointSeries = chart.series.push(
            am5map.MapPointSeries.new(root, {
                latitudeField: 'lat',
                longitudeField: 'lng',
                tooltip: customTooltip,
            })
        );

        pointSeries.bullets.push((rootInstance, _series, dataItem) => {
            const raw = dataItem.dataContext as any;
            const isInspected = activeCode ? raw.code === activeCode : false;
            const isProposalTarget = proposalRegion ? proposalRegion.includes(raw.code) : false;

            const container = am5.Container.new(rootInstance, {
                tooltipText: '{name} ({code})',
                cursorOverStyle: 'pointer',
            });

            // Radar pulse ring on active proposal region ONLY
            if (isProposalTarget) {
                const pulseRing = container.children.push(
                    am5.Circle.new(rootInstance, {
                        radius: 12,
                        fill: am5.color(0x2563eb),
                        fillOpacity: 0.35,
                        stroke: am5.color(0x60a5fa),
                        strokeWidth: 1.5,
                        strokeDasharray: [3, 3],
                    })
                );

                pulseRing.animate({
                    key: 'radius',
                    to: 24,
                    duration: 1400,
                    loops: Infinity,
                    easing: am5.ease.out(am5.ease.cubic),
                });

                pulseRing.animate({
                    key: 'fillOpacity',
                    from: 0.45,
                    to: 0,
                    duration: 1400,
                    loops: Infinity,
                    easing: am5.ease.out(am5.ease.cubic),
                });
            }

            // Outer Halo
            const halo = container.children.push(
                am5.Circle.new(rootInstance, {
                    radius: isProposalTarget ? 9.5 : (isInspected ? 8 : 6.5),
                    fill: isProposalTarget ? am5.color(0x2563eb) : (isInspected ? am5.color(0x3b82f6) : am5.color(0x94a3b8)),
                    fillOpacity: isProposalTarget ? 0.35 : (isInspected ? 0.25 : 0.15),
                })
            );

            // Region Node Circle Pin
            container.children.push(
                am5.Circle.new(rootInstance, {
                    radius: isProposalTarget ? 7 : (isInspected ? 6 : 4.5),
                    fill: isProposalTarget ? am5.color(0x2563eb) : (isInspected ? am5.color(0x3b82f6) : am5.color(0x94a3b8)),
                    stroke: (isProposalTarget || isInspected) ? am5.color(0xffffff) : am5.color(0x334155),
                    strokeWidth: (isProposalTarget || isInspected) ? 2 : 1.2,
                })
            );

            // Region Tag Label with calibrated offsets
            const cfg = REGION_LABEL_CONFIG[raw.code] || { dx: 0, dy: 14, centerX: am5.p50, centerY: am5.percent(-120) };
            container.children.push(
                am5.Label.new(rootInstance, {
                    text: `{code}`,
                    dx: cfg.dx,
                    dy: cfg.dy,
                    centerX: cfg.centerX,
                    centerY: cfg.centerY,
                    fill: (isProposalTarget || isInspected) ? am5.color(0xffffff) : am5.color(0xcbd5e1),
                    fontSize: (isProposalTarget || isInspected) ? 11 : 9.5,
                    fontWeight: (isProposalTarget || isInspected) ? '700' : '500',
                    populateText: true,
                })
            );

            // Click listener: Selects region for inspection
            container.events.on('click', () => {
                if (raw.region) {
                    handleSelect(raw.region);
                }
            });

            container.events.on('pointerover', () => {
                halo.set('scale', 1.3);
            });
            container.events.on('pointerout', () => {
                halo.set('scale', 1);
            });

            return am5.Bullet.new(rootInstance, {
                sprite: container,
            });
        });

        // Populate Fixed AWS Regions Data
        const pointsData = filteredRegions.map((r) => ({
            lat: r.coordinates.lat,
            lng: r.coordinates.lng,
            code: r.code,
            name: r.name,
            availabilityZones: r.availabilityZones,
            region: r,
        }));
        pointSeries.data.setAll(pointsData);

        // Initial Glide & Center onto Selected or Proposal Region
        const focusRegion = selectedRegion || primaryRegionObj;
        const targetLng = focusRegion ? focusRegion.coordinates.lng : -40;
        const targetLat = focusRegion ? focusRegion.coordinates.lat : 15;

        chart.animate({
            key: 'rotationX',
            to: -targetLng,
            duration: 1200,
            easing: am5.ease.out(am5.ease.cubic),
        });
        chart.animate({
            key: 'rotationY',
            to: -targetLat,
            duration: 1200,
            easing: am5.ease.out(am5.ease.cubic),
        });

        // Cleanup
        return () => {
            root.dispose();
        };
    }, [activeCode, selectedContinent, proposalRegion]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Control Bar & Filter Tabs */}
            <div
                style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '12px 20px',
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
                                onClick={() => handleContinentClick(cont)}
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
            </div>

            {/* Globe Container */}
            <div
                style={{
                    background: 'radial-gradient(ellipse at center, #0d1627 0%, #070c18 70%, #03060c 100%)',
                    border: '1px solid #1e293b',
                    borderRadius: 18,
                    padding: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
                    minHeight: 560,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                {/* Background Grid Accent Lines */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
              radial-gradient(rgba(59, 130, 246, 0.2) 1.5px, transparent 1.5px),
              linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
            `,
                        backgroundSize: '32px 32px, 96px 96px, 96px 96px',
                        pointerEvents: 'none',
                    }}
                />

                {/* HUD Header Bar */}
                <div
                    style={{
                        position: 'relative',
                        zIndex: 15,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                        marginBottom: 6,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: 'rgba(37, 99, 235, 0.25)',
                                border: '1px solid rgba(59, 130, 246, 0.5)',
                                color: '#60a5fa',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)',
                            }}
                        >
                            <Globe size={19} />
                        </div>
                        <div>
                            <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 15, letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>Infraestructura Global AWS</span>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: 11.5 }}>
                                Haz clic en cualquier país o región de AWS para rotar el globo y centrarla automáticamente.
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, color: '#cbd5e1' }}>
                        {proposalRegion && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb', boxShadow: '0 0 10px #2563eb' }} />
                                <span>Región Primaria</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8' }} />
                            <span>Regiones AWS ({awsRegionsList.length})</span>
                        </div>
                    </div>
                </div>

                {/* Map Viewport Area with Floating Zoom/Home Controls */}
                <div className="aws-globe-box" style={{ position: 'relative' }}>
                    <div
                        style={{
                            position: 'absolute',
                            top: 20,
                            left: 20,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            zIndex: 30,
                        }}
                    >
                        <button
                            onClick={handleGoHome}
                            title="Centrar Región Activa"
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: '#5b8cf7',
                                border: 'none',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#4075f3')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#5b8cf7')}
                        >
                            <Home size={18} />
                        </button>

                        <button
                            onClick={handleZoomIn}
                            title="Aumentar Zoom"
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: '#5b8cf7',
                                border: 'none',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#4075f3')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#5b8cf7')}
                        >
                            <Plus size={19} />
                        </button>

                        <button
                            onClick={handleZoomOut}
                            title="Alejar Zoom"
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: '#5b8cf7',
                                border: 'none',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#4075f3')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#5b8cf7')}
                        >
                            <Minus size={19} />
                        </button>
                    </div>

                    {/* amCharts 5 Mount Point */}
                    <div
                        ref={chartRef}
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                        }}
                    />
                </div>

                {/* Selected Region Status Ribbon Bottom HUD */}
                {selectedRegion ? (() => {
                    const isTarget = proposalRegion ? proposalRegion.includes(selectedRegion.code) : false;
                    const regionServices = isTarget ? (proposalServices || []) : [];
                    const statusDetails = getRegionStatus(selectedRegion.code, proposalRegion, proposalServices);

                    return (
                        <div
                            style={{
                                position: 'relative',
                                zIndex: 15,
                                background: 'rgba(15, 23, 42, 0.90)',
                                backdropFilter: 'blur(12px)',
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
                                <div
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 8,
                                        background: 'rgba(37, 99, 235, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#60a5fa',
                                    }}
                                >
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 13.5 }}>
                                        {selectedRegion.name} ({selectedRegion.code})
                                    </div>
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                        {selectedRegion.location} • {selectedRegion.continent}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                <div>
                                    <span style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>Zonas de Disponibilidad:</span>
                                    <strong style={{ color: '#60a5fa', fontSize: 13 }}>{selectedRegion.availabilityZones} AZs</strong>
                                </div>

                                <div>
                                    <span style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>Servicios Desplegados:</span>
                                    <strong style={{ color: '#ffffff', fontSize: 13 }}>
                                        {regionServices.length > 0
                                            ? `${regionServices.length} (${regionServices.join(', ')})`
                                            : '0 servicios'}
                                    </strong>
                                </div>

                                <div>
                                    <span style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginBottom: 2 }}>Estado:</span>
                                    <StatusBadge status={statusDetails.status} size="sm" />
                                </div>

                                {hasActiveProposal && (
                                    <div>
                                        {isTarget ? (
                                            <span
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 5,
                                                    padding: '5px 10px',
                                                    borderRadius: 8,
                                                    fontSize: 11.5,
                                                    fontWeight: 700,
                                                    color: '#16a34a',
                                                    background: 'rgba(22, 163, 74, 0.15)',
                                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                                }}
                                            >
                                                <Check size={13} /> Región de la propuesta
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        window.confirm(
                                                            `¿Deseas cambiar la región de la propuesta activa a "${selectedRegion.code} (${selectedRegion.name})"?`
                                                        )
                                                    ) {
                                                        onSetAsProposalRegion?.(selectedRegion);
                                                    }
                                                }}
                                                style={{
                                                    background: '#2563eb',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    padding: '6px 12px',
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                                                    transition: 'background 0.15s ease',
                                                }}
                                            >
                                                Usar como región de la propuesta
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })() : (
                    <div
                        style={{
                            position: 'relative',
                            zIndex: 15,
                            background: 'rgba(15, 23, 42, 0.90)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: 12,
                            padding: '14px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            fontSize: 13,
                            color: '#94a3b8',
                        }}
                    >
                        <MapPin size={17} color="#60a5fa" />
                        <span>Haz clic en una región para ver su detalle en el globo.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
