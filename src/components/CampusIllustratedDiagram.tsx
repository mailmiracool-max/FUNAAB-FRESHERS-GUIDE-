import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Maximize2, 
  Info, 
  Layers, 
  Home, 
  GraduationCap, 
  Building, 
  Trophy,
  Compass
} from 'lucide-react';
import { CampusLocation } from '../types/campus';
import { CAMPUS_LOCATIONS } from '../data/campusLocations';

interface CampusIllustratedDiagramProps {
  onSelectLocation: (loc: CampusLocation, autoZoom?: boolean) => void;
  onNavigateToLocation: (loc: CampusLocation) => void;
}

export const CampusIllustratedDiagram: React.FC<CampusIllustratedDiagramProps> = ({
  onSelectLocation,
  onNavigateToLocation,
}) => {
  const [hoveredNode, setHoveredNode] = useState<CampusLocation | null>(null);
  const [selectedNode, setSelectedNode] = useState<CampusLocation | null>(
    CAMPUS_LOCATIONS.find((l) => l.id === '1k_cap') || null
  );

  const handleNodeClick = (loc: CampusLocation) => {
    setSelectedNode(loc);
  };

  // Node position coordinates for SVG blueprint layout (percentage based: x: 0-1000, y: 0-600)
  const DIAGRAM_NODES: { id: string; x: number; y: number; label: string; iconType: string }[] = [
    // Bottom Entrance
    { id: 'sch_gate', x: 670, y: 520, label: 'SCH GATE', iconType: 'gate' },
    { id: 'ceremonial_building', x: 745, y: 495, label: 'Ceremonial Building', iconType: 'landmark' },
    { id: 'church', x: 600, y: 490, label: 'Church', iconType: 'facility' },
    { id: 'mosque', x: 600, y: 460, label: 'Mosque', iconType: 'facility' },
    { id: 'funaab_zoo', x: 350, y: 480, label: 'FUNAAB ZOO', iconType: 'recreation' },
    { id: 'funaab_int_sch', x: 280, y: 480, label: 'FUNAAB INT. SCH', iconType: 'academic' },

    // Central Services & South
    { id: 'health_center', x: 590, y: 420, label: 'Health Center', iconType: 'facility' },
    { id: 'man_o_war', x: 590, y: 395, label: 'Man O War', iconType: 'recreation' },
    { id: 'park', x: 585, y: 365, label: 'PARK', iconType: 'facility' },
    { id: 'shops', x: 510, y: 365, label: 'Shops', iconType: 'facility' },

    // South East Precinct
    { id: 'book_shop', x: 690, y: 380, label: 'Book Shop', iconType: 'academic' },
    { id: 'ictrec', x: 755, y: 380, label: 'ICTREC', iconType: 'facility' },
    { id: 'acad', x: 755, y: 420, label: 'ACAD', iconType: 'academic' },
    { id: 'sport_center', x: 755, y: 450, label: 'Sport Center', iconType: 'recreation' },
    { id: 'unity_build', x: 820, y: 380, label: 'Unity Build', iconType: 'facility' },
    { id: 'wole_soy_lib', x: 890, y: 470, label: 'Wole Soy. Lib.', iconType: 'academic' },
    { id: 'colends', x: 865, y: 495, label: 'COLENDS', iconType: 'academic' },
    { id: 'marble_hostel', x: 915, y: 345, label: 'Marble Hostel', iconType: 'hostel' },

    // Central Spine & Landmark
    { id: 'annenih', x: 535, y: 310, label: 'ANNENIH', iconType: 'academic' },
    { id: 'old_colphy', x: 540, y: 245, label: 'Old COLPHY', iconType: 'academic' },
    { id: 'colbios', x: 605, y: 250, label: 'COLBIOS', iconType: 'academic' },
    { id: 'motion_ground', x: 670, y: 285, label: 'Motion Ground', iconType: 'recreation' },
    { id: 'senate_build', x: 750, y: 265, label: 'SENATE BUILD.', iconType: 'landmark' },
    { id: 'nimbe_lib', x: 670, y: 195, label: 'NIMBE LIB.', iconType: 'academic' },
    { id: 'coplant', x: 800, y: 220, label: 'COPLANT', iconType: 'academic' },
    { id: 'colvet', x: 900, y: 260, label: 'COLVET', iconType: 'academic' },

    // North-East Arc
    { id: 'jao', x: 810, y: 160, label: 'JAO', iconType: 'theatre' },
    { id: 'colamim', x: 730, y: 165, label: 'COLAMIM', iconType: 'academic' },
    { id: 'pisad', x: 755, y: 135, label: 'PISAD', iconType: 'academic' },
    { id: 'agric_lab', x: 785, y: 105, label: 'Agric Lab', iconType: 'academic' },
    { id: 'colerm_ph1', x: 710, y: 105, label: 'COLERM PH 1', iconType: 'academic' },

    // Northern Ridge & Hostels
    { id: 'uk_hostel', x: 710, y: 25, label: 'UK Hostel', iconType: 'hostel' },
    { id: 'iyat', x: 645, y: 25, label: 'IYAT', iconType: 'hostel' },
    { id: 'aud_3', x: 640, y: 70, label: 'AUD 3', iconType: 'theatre' },
    { id: 'coleng', x: 595, y: 80, label: 'COLENG', iconType: 'academic' },
    { id: 'colamrud', x: 595, y: 120, label: 'COLAMRUD', iconType: 'academic' },
    { id: 'amrec', x: 555, y: 145, label: 'AMREC', iconType: 'academic' },
    { id: 'mp', x: 545, y: 175, label: 'MP', iconType: 'academic' },

    // Western Avenue & Lecture Theatres
    { id: '1k_cap', x: 370, y: 380, label: '1K CAP', iconType: 'theatre' },
    { id: 'all_lab', x: 315, y: 380, label: 'ALL LAB', iconType: 'academic' },
    { id: '250_seater', x: 255, y: 380, label: '250 Seater', iconType: 'theatre' },
    { id: 'new_colphy', x: 200, y: 380, label: 'New COLPHY', iconType: 'academic' },
    { id: 'nb_2', x: 150, y: 355, label: 'NB 2', iconType: 'academic' },
    { id: '500_seater', x: 195, y: 245, label: '500 Seater', iconType: 'theatre' },
    { id: 'nb_1', x: 205, y: 195, label: 'NB 1', iconType: 'academic' },
    { id: 'mahmud', x: 315, y: 240, label: 'MAHMUD', iconType: 'theatre' },

    // Mid-West Cluster: PG, Food, Biotech
    { id: 'colerm_ph2', x: 355, y: 295, label: 'COLERM PH 2', iconType: 'academic' },
    { id: 'pg', x: 430, y: 295, label: 'PG', iconType: 'academic' },
    { id: 'colfhec', x: 410, y: 245, label: 'COLFHEC', iconType: 'academic' },
    { id: 'bt_lab', x: 420, y: 205, label: 'BT LAB', iconType: 'academic' },

    // North-West Student Life & Hostels
    { id: 'cents', x: 450, y: 170, label: 'CENTS', iconType: 'academic' },
    { id: 'colcom', x: 380, y: 155, label: 'COLCOM', iconType: 'academic' },
    { id: 'sub', x: 450, y: 130, label: 'SUB', iconType: 'facility' },
    { id: 'sug_build', x: 430, y: 95, label: 'SUG BUILD', iconType: 'facility' },
    { id: 'new_needs_female', x: 310, y: 135, label: 'New Needs Female Hostel', iconType: 'hostel' },
    { id: 'new_needs_male', x: 235, y: 135, label: 'New Needs Male Hostel', iconType: 'hostel' },
    { id: 'old_need_female', x: 335, y: 95, label: 'Old Need Female Hostel', iconType: 'hostel' },
    { id: 'old_need_male', x: 255, y: 95, label: 'Old Need Male Hostel', iconType: 'hostel' },
  ];

  return (
    <div className="bg-slate-900 rounded-2xl shadow-2xl border border-emerald-800/80 p-4 sm:p-6 flex flex-col gap-4 text-white overflow-hidden">
      {/* Title Header Matching Blueprint Image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-800 gap-2">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
              FUNAAB
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
              Campus Blueprint
            </span>
          </div>
          <p className="text-xs text-emerald-300 italic tracking-wide">
            CAMPUS MAP — Navigate with ease.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden md:inline">
            Interactive schema • Click any building to view &amp; navigate
          </span>
          {selectedNode && (
            <button
              onClick={() => onSelectLocation(selectedNode, true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View on Satellite Map
            </button>
          )}
        </div>
      </div>

      {/* SVG Vector Map Rendering */}
      <div className="relative w-full aspect-[16/9] min-h-[460px] bg-[#f8faf8] dark:bg-[#071a12] rounded-xl overflow-hidden border-2 border-emerald-950 shadow-inner flex items-center justify-center">
        <svg
          viewBox="0 0 1000 580"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background campus grid lines */}
          <defs>
            <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="1" />
            </pattern>
            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>

          <rect width="1000" height="580" fill="url(#campusGrid)" />

          {/* GREEN HIGHWAY / ROAD NETWORK matching the illustration */}
          {/* Main Road Trunk from South Gate */}
          <path
            d="M 670 540 L 670 380 Q 670 350 590 350 L 480 350 Q 400 350 400 330 L 120 330"
            fill="none"
            stroke="#064e3b"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Motion Ground & Nimbe Library Spine */}
          <path
            d="M 670 380 L 670 190"
            fill="none"
            stroke="#064e3b"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* North Loop passing COLENG and AUD 3 to Northeast Colleges */}
          <path
            d="M 670 190 Q 670 90 600 70 Q 550 55 500 130 Q 480 180 480 330"
            fill="none"
            stroke="#064e3b"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Northeast Ring past COLERM, Agric Lab, PISAD, JAO down to COPLANT & COLVET */}
          <path
            d="M 670 190 Q 750 190 770 110 Q 820 60 850 160 Q 870 260 920 330"
            fill="none"
            stroke="#064e3b"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* East Artery passing Book Shop, ICTREC, ACAD, Unity Build */}
          <path
            d="M 670 350 L 920 350"
            fill="none"
            stroke="#064e3b"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Southeast branch to COLENDS and Wole Soyinka Library */}
          <path
            d="M 870 350 Q 870 480 870 500"
            fill="none"
            stroke="#064e3b"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Northwest Branch to Hostels & SUB */}
          <path
            d="M 480 140 L 170 140"
            fill="none"
            stroke="#064e3b"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Southwest branch towards FUNAAB Zoo & FUNIS */}
          <path
            d="M 670 470 L 250 470"
            fill="none"
            stroke="#064e3b"
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Central Motion Ground Area */}
          <rect
            x="640"
            y="265"
            width="60"
            height="35"
            rx="8"
            fill="#10b981"
            fillOpacity="0.2"
            stroke="#059669"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text x="670" y="285" fill="#047857" fontSize="10" fontWeight="bold" textAnchor="middle">
            Motion Ground
          </text>

          {/* Render All Blueprint Location Nodes */}
          {DIAGRAM_NODES.map((node) => {
            const loc = CAMPUS_LOCATIONS.find((l) => l.id === node.id);
            if (!loc) return null;
            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer transition-transform"
                onClick={() => handleNodeClick(loc)}
                onMouseEnter={() => setHoveredNode(loc)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Pin Stem */}
                <line x1="0" y1="0" x2="0" y2="12" stroke="#1f2937" strokeWidth="2" />
                
                {/* Pin Head */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? 10 : isHovered ? 8 : 6}
                  fill={
                    isSelected
                      ? '#f59e0b'
                      : node.iconType === 'hostel'
                      ? '#e11d48'
                      : node.iconType === 'theatre'
                      ? '#6366f1'
                      : node.iconType === 'landmark'
                      ? '#0284c7'
                      : '#059669'
                  }
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all drop-shadow"
                />

                {/* Text Label */}
                <text
                  x="0"
                  y="-12"
                  textAnchor="middle"
                  fill={isSelected ? '#d97706' : '#1f2937'}
                  fontSize={isSelected ? '12' : '10'}
                  fontWeight={isSelected ? 'bold' : '600'}
                  className="font-sans select-none pointer-events-none drop-shadow-sm"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Quick Info Pill on hover/select */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-emerald-300 dark:border-slate-700 flex items-start justify-between gap-3 text-slate-900 dark:text-white">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-emerald-800 dark:text-amber-400">
                  {selectedNode.name}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-slate-800 dark:text-emerald-300">
                  {selectedNode.category}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">
                {selectedNode.fullName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {selectedNode.description}
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => onNavigateToLocation(selectedNode)}
                title="Navigate to this building"
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                Directions
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Diagram Notes matching original image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-800/80 p-3 rounded-xl border border-emerald-900/80">
        <div>
          <span className="font-bold text-amber-400 block mb-1">Campus Map Legend</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-300">
            <span className="flex items-center gap-1">📍 Building / Location</span>
            <span className="flex items-center gap-1">🛏️ Student Hostel</span>
            <span className="flex items-center gap-1">🏢 Facility / Service</span>
            <span className="flex items-center gap-1">🎓 Academic / Library</span>
            <span className="flex items-center gap-1">⚽ Recreation / Sports</span>
          </div>
        </div>

        <div>
          <span className="font-bold text-amber-400 block mb-1">Authentic Campus Notes</span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            • NB stands for Newly Constructed Building • Alabata Campus layout covers ~10,000 hectares • Switch to "Live Map" tab above for real-time Google Satellite imagery &amp; GPS compass navigation.
          </p>
        </div>
      </div>
    </div>
  );
};
