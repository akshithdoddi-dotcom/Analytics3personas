import { useState, useRef, useEffect } from "react";
import { Settings, X, Plus, Trash2, Camera, MapPin, Grid3x3, Layers, Eye, Save, Copy, Upload, ChevronRight, ChevronLeft, Check, AlertCircle } from "lucide-react";
import { cn } from "@/app/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";

// Types
interface ZoneConfig {
  id: string;
  name: string;
  cells: Set<string>; // Set of cell coordinates like "3,4"
  color: string;
  floor: string;
}

interface CameraViewpoint {
  id: string;
  cameraId: string;
  cameraName: string;
  cells: Set<string>; // Cells that this camera can see
  floor: string;
  color: string;
}

interface FloorPlan {
  floor: string;
  imageUrl: string;
}

interface Camera {
  id: string;
  name: string;
  thumbnail?: string;
}

// Mock camera data
const MOCK_CAMERAS: Camera[] = [
  { id: "CAM-001", name: "Main Entrance" },
  { id: "CAM-002", name: "Server Room Hallway" },
  { id: "CAM-003", name: "Loading Dock Bay 1" },
  { id: "CAM-004", name: "Parking Lot North" },
  { id: "CAM-005", name: "Restricted Area C3" },
  { id: "CAM-006", name: "Cafeteria Overview" },
  { id: "CAM-007", name: "Lobby Reception" },
  { id: "CAM-008", name: "Perimeter North Gate" },
  { id: "CAM-009", name: "Warehouse Floor A" },
  { id: "CAM-010", name: "Emergency Exit B" },
];

const FLOORS = ["L1", "L2", "L3", "B1"];

const ZONE_COLORS = [
  "#00A63E", // Green
  "#0088CC", // Blue
  "#E19A04", // Amber
  "#9333EA", // Purple
  "#EC4899", // Pink
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#8B5CF6", // Violet
];

const CAMERA_VIEWPOINT_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#95E1D3", // Mint
  "#F3A683", // Peach
  "#6C5CE7", // Purple
  "#A8E6CF", // Green
  "#FFD3B6", // Orange
  "#FFAAA5", // Pink
];

const GRID_SIZE = 10;
const CELL_SIZE = 48;
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 480;

// Helper function to check if cells are continuous
const areCellsContinuous = (cells: Set<string>): boolean => {
  if (cells.size === 0) return true;
  if (cells.size === 1) return true;

  const cellArray = Array.from(cells).map(cell => {
    const [x, y] = cell.split(',').map(Number);
    return { x, y };
  });

  // BFS to check if all cells are connected
  const visited = new Set<string>();
  const queue = [cellArray[0]];
  visited.add(`${cellArray[0].x},${cellArray[0].y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (cells.has(key) && !visited.has(key)) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }

  return visited.size === cells.size;
};

// Helper function to calculate the outline path of a zone
const getZoneOutlinePath = (cells: Set<string>): string => {
  const cellArray = Array.from(cells).map(cell => {
    const [x, y] = cell.split(',').map(Number);
    return { x, y };
  });

  if (cellArray.length === 0) return '';

  // Create a set for quick lookup
  const cellSet = new Set(cells);

  // Find all edges
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];

  cellArray.forEach(({ x, y }) => {
    // Top edge
    if (!cellSet.has(`${x},${y - 1}`)) {
      edges.push({
        x1: x * CELL_SIZE,
        y1: y * CELL_SIZE,
        x2: (x + 1) * CELL_SIZE,
        y2: y * CELL_SIZE,
      });
    }
    // Bottom edge
    if (!cellSet.has(`${x},${y + 1}`)) {
      edges.push({
        x1: x * CELL_SIZE,
        y1: (y + 1) * CELL_SIZE,
        x2: (x + 1) * CELL_SIZE,
        y2: (y + 1) * CELL_SIZE,
      });
    }
    // Left edge
    if (!cellSet.has(`${x - 1},${y}`)) {
      edges.push({
        x1: x * CELL_SIZE,
        y1: y * CELL_SIZE,
        x2: x * CELL_SIZE,
        y2: (y + 1) * CELL_SIZE,
      });
    }
    // Right edge
    if (!cellSet.has(`${x + 1},${y}`)) {
      edges.push({
        x1: (x + 1) * CELL_SIZE,
        y1: y * CELL_SIZE,
        x2: (x + 1) * CELL_SIZE,
        y2: (y + 1) * CELL_SIZE,
      });
    }
  });

  // Convert edges to path
  return edges.map(edge => `M ${edge.x1} ${edge.y1} L ${edge.x2} ${edge.y2}`).join(' ');
};

// Step 1: Floor Plan Upload Component
const FloorPlanUpload = ({
  floor,
  floorPlan,
  onFloorPlanUpload,
}: {
  floor: string;
  floorPlan: FloorPlan | null;
  onFloorPlanUpload: (imageUrl: string) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        onFloorPlanUpload(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00775B]/10 mb-4">
            <Upload className="w-8 h-8 text-[#00775B]" />
          </div>
          <h3 className="text-xl font-bold text-neutral-800">Upload Floor Plan for {floor}</h3>
          <p className="text-sm text-neutral-600">
            Upload an image of your floor plan to use as a reference when creating zones and camera viewpoints.
          </p>
        </div>

        {floorPlan ? (
          <div className="space-y-4">
            <div className="relative rounded-lg border-2 border-[#00775B] bg-neutral-50 overflow-hidden">
              <img src={floorPlan.imageUrl} alt="Floor Plan" className="w-full h-auto" />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-white transition-colors"
                >
                  Change Image
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded border border-green-200">
              <Check className="w-4 h-4" />
              <span className="font-medium">Floor plan uploaded successfully</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 rounded-lg p-12 text-center cursor-pointer hover:border-[#00775B] hover:bg-[#00775B]/5 transition-colors"
          >
            <div className="space-y-2">
              <div className="text-4xl text-neutral-400">📐</div>
              <p className="text-sm font-medium text-neutral-700">Click to upload floor plan image</p>
              <p className="text-xs text-neutral-500">PNG, JPG, or PDF up to 10MB</p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

// Step 2: Zone Drawing Canvas
const ZoneDrawingCanvas = ({
  zones,
  selectedZone,
  onZoneCreate,
  onZoneSelect,
  onZoneDelete,
  onZoneUpdate,
  floor,
  floorPlan,
}: {
  zones: ZoneConfig[];
  selectedZone: string | null;
  onZoneCreate: (zone: Omit<ZoneConfig, "id">) => void;
  onZoneSelect: (zoneId: string | null) => void;
  onZoneDelete: (zoneId: string) => void;
  onZoneUpdate: (zoneId: string, updates: Partial<ZoneConfig>) => void;
  floor: string;
  floorPlan: FloorPlan | null;
}) => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showZoneNameInput, setShowZoneNameInput] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");

  const currentFloorZones = zones.filter((z) => z.floor === floor);

  const getCellKey = (gridX: number, gridY: number) => `${gridX},${gridY}`;

  const isCellOccupied = (gridX: number, gridY: number, excludeZoneId?: string) => {
    return currentFloorZones.some(
      (zone) => zone.id !== excludeZoneId && zone.cells.has(getCellKey(gridX, gridY))
    );
  };

  const handleCellClick = (gridX: number, gridY: number) => {
    if (selectedZone) return; // Don't allow drawing when a zone is selected

    const cellKey = getCellKey(gridX, gridY);
    const newSelectedCells = new Set(selectedCells);

    if (newSelectedCells.has(cellKey)) {
      newSelectedCells.delete(cellKey);
    } else {
      if (isCellOccupied(gridX, gridY)) {
        alert("This cell is already occupied by another zone!");
        return;
      }
      newSelectedCells.add(cellKey);
    }

    setSelectedCells(newSelectedCells);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (selectedZone || !canvasRef.current) return;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const svgY = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

    const gridX = Math.floor(svgX / CELL_SIZE);
    const gridY = Math.floor(svgY / CELL_SIZE);

    if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
      const cellKey = getCellKey(gridX, gridY);
      if (!selectedCells.has(cellKey) && !isCellOccupied(gridX, gridY)) {
        const newSelectedCells = new Set(selectedCells);
        newSelectedCells.add(cellKey);
        setSelectedCells(newSelectedCells);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCreateZone = () => {
    if (selectedCells.size === 0) {
      alert("Please select at least one cell!");
      return;
    }

    // Check if cells are continuous
    if (!areCellsContinuous(selectedCells)) {
      alert("Selected cells must be continuous! Please select cells that are connected to each other.");
      return;
    }

    // Show the zone name input
    setShowZoneNameInput(true);
  };

  const handleConfirmZoneCreation = () => {
    if (!newZoneName.trim()) {
      alert("Please enter a zone name!");
      return;
    }

    onZoneCreate({
      name: newZoneName,
      cells: new Set(selectedCells),
      color: ZONE_COLORS[currentFloorZones.length % ZONE_COLORS.length],
      floor,
    });

    setSelectedCells(new Set());
    setNewZoneName("");
    setShowZoneNameInput(false);
    onZoneSelect(null);
  };

  const handleCancelZoneCreation = () => {
    setShowZoneNameInput(false);
    setNewZoneName("");
  };

  const handleClearSelection = () => {
    setSelectedCells(new Set());
    onZoneSelect(null);
  };

  return (
    <div className="flex-1 flex gap-4 p-4">
      {/* Zone Name Input Modal */}
      {showZoneNameInput && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-96 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-800 mb-2">Create New Zone</h3>
              <p className="text-sm text-neutral-600">Enter a name for this zone ({selectedCells.size} cells selected)</p>
            </div>
            <input
              type="text"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirmZoneCreation();
                } else if (e.key === "Escape") {
                  handleCancelZoneCreation();
                }
              }}
              placeholder="e.g., Loading Bay, Server Room"
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00775B] text-sm"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelZoneCreation}
                className="px-4 py-2 text-sm font-bold text-neutral-700 bg-neutral-100 rounded hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmZoneCreation}
                className="px-4 py-2 text-sm font-bold text-white bg-[#00775B] rounded hover:bg-[#009e78] transition-colors"
              >
                Create Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-700">Draw Zones on Grid</h3>
          <div className="flex gap-2">
            {selectedCells.size > 0 && (
              <>
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClearSelection();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-neutral-600 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors cursor-pointer select-none"
                >
                  Clear Selection
                </div>
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCreateZone();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#00775B] rounded hover:bg-[#009e78] transition-colors flex items-center gap-1.5 cursor-pointer select-none relative z-50"
                >
                  <Plus className="w-3.5 h-3.5 pointer-events-none" />
                  Create Zone ({selectedCells.size} cells)
                </div>
              </>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-neutral-600 bg-blue-50 p-2 rounded border border-blue-200">
          <strong>Instructions:</strong> Click or drag to select cells, then click "Create Zone" button above
        </div>

        <div className="relative bg-neutral-900 rounded border-2 border-neutral-300 overflow-hidden" style={{ height: 480 }}>
          {/* Floor Plan Background */}
          {floorPlan && (
            <img
              src={floorPlan.imageUrl}
              alt="Floor Plan"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          )}

          <svg
            ref={canvasRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
            className="cursor-crosshair relative z-10"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Grid Pattern */}
            <defs>
              <pattern id="grid-pattern" width={CELL_SIZE} height={CELL_SIZE} patternUnits="userSpaceOnUse">
                <rect width={CELL_SIZE} height={CELL_SIZE} fill="none" stroke="#D1D5DB" strokeWidth="1" opacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />

            {/* Grid Cells - Interactive */}
            {Array.from({ length: GRID_SIZE }).map((_, y) =>
              Array.from({ length: GRID_SIZE }).map((_, x) => {
                const cellKey = getCellKey(x, y);
                const isSelected = selectedCells.has(cellKey);
                const isOccupied = isCellOccupied(x, y);

                return (
                  <rect
                    key={cellKey}
                    x={x * CELL_SIZE}
                    y={y * CELL_SIZE}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    fill={isSelected ? "#00775B" : isOccupied ? "transparent" : "transparent"}
                    fillOpacity={isSelected ? 0.4 : 0}
                    stroke={isSelected ? "#00775B" : "none"}
                    strokeWidth={isSelected ? 2 : 0}
                    className="cursor-pointer hover:fill-[#00775B] hover:fill-opacity-20 transition-all"
                    onClick={() => handleCellClick(x, y)}
                  />
                );
              })
            )}

            {/* Existing Zones */}
            {currentFloorZones.map((zone) => {
              const isSelected = selectedZone === zone.id;
              const cells = Array.from(zone.cells).map((cell) => {
                const [x, y] = cell.split(",").map(Number);
                return { x, y };
              });

              return (
                <g
                  key={zone.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onZoneSelect(zone.id);
                  }}
                  className="cursor-pointer"
                >
                  {cells.map(({ x, y }) => (
                    <rect
                      key={`${x},${y}`}
                      x={x * CELL_SIZE}
                      y={y * CELL_SIZE}
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      fill={zone.color}
                      fillOpacity={isSelected ? 0.7 : 0.5}
                      stroke={isSelected ? "#00775B" : zone.color}
                      strokeWidth={isSelected ? 3 : 1.5}
                    />
                  ))}
                  {/* Zone Label */}
                  {cells.length > 0 && (
                    <text
                      x={cells[0].x * CELL_SIZE + CELL_SIZE / 2}
                      y={cells[0].y * CELL_SIZE + CELL_SIZE / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      {zone.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="text-xs text-neutral-500 space-y-1">
          <p>• Click individual cells or drag to select multiple cells</p>
          <p>• Selected cells must be continuous (connected)</p>
          <p>• Zones cannot overlap with each other</p>
        </div>
      </div>

      {/* Zone List Panel */}
      <div className="w-64 bg-white rounded border border-neutral-200 p-3 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600">Zones ({currentFloorZones.length})</h4>
        
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {currentFloorZones.map((zone) => (
            <div
              key={zone.id}
              onClick={() => onZoneSelect(zone.id)}
              className={cn(
                "p-2 rounded border cursor-pointer transition-all",
                selectedZone === zone.id
                  ? "border-[#00775B] bg-[#00775B]/5"
                  : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: zone.color }} />
                  <span className="text-xs font-bold text-neutral-800">{zone.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete zone "${zone.name}"?`)) {
                      onZoneDelete(zone.id);
                    }
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="text-[10px] text-neutral-500">
                {zone.cells.size} cell{zone.cells.size !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>

        {currentFloorZones.length === 0 && (
          <div className="text-xs text-neutral-400 text-center py-8">
            No zones created yet.<br />Start drawing on the grid!
          </div>
        )}
      </div>
    </div>
  );
};

// Step 3: Camera Viewpoint Mapping
const CameraViewpointCanvas = ({
  zones,
  cameraViewpoints,
  onViewpointCreate,
  onViewpointUpdate,
  onViewpointDelete,
  floor,
  floorPlan,
}: {
  zones: ZoneConfig[];
  cameraViewpoints: CameraViewpoint[];
  onViewpointCreate: (viewpoint: Omit<CameraViewpoint, "id">) => void;
  onViewpointUpdate: (id: string, updates: Partial<CameraViewpoint>) => void;
  onViewpointDelete: (id: string) => void;
  floor: string;
  floorPlan: FloorPlan | null;
}) => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [selectedViewpoint, setSelectedViewpoint] = useState<string | null>(null);
  const [hoveredCamera, setHoveredCamera] = useState<string | null>(null);

  const currentFloorZones = zones.filter((z) => z.floor === floor);
  const currentFloorViewpoints = cameraViewpoints.filter((v) => v.floor === floor);

  const getCellKey = (gridX: number, gridY: number) => `${gridX},${gridY}`;

  const handleCellClick = (gridX: number, gridY: number) => {
    if (!selectedCamera) {
      alert("Please select a camera first!");
      return;
    }

    const cellKey = getCellKey(gridX, gridY);
    const newSelectedCells = new Set(selectedCells);

    if (newSelectedCells.has(cellKey)) {
      newSelectedCells.delete(cellKey);
    } else {
      newSelectedCells.add(cellKey);
    }

    setSelectedCells(newSelectedCells);
  };

  const handleMouseDown = () => {
    if (!selectedCamera) return;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !selectedCamera || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const svgY = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

    const gridX = Math.floor(svgX / CELL_SIZE);
    const gridY = Math.floor(svgY / CELL_SIZE);

    if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
      const cellKey = getCellKey(gridX, gridY);
      if (!selectedCells.has(cellKey)) {
        const newSelectedCells = new Set(selectedCells);
        newSelectedCells.add(cellKey);
        setSelectedCells(newSelectedCells);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSaveViewpoint = () => {
    if (!selectedCamera) {
      alert("Please select a camera!");
      return;
    }

    if (selectedCells.size === 0) {
      alert("Please select at least one cell for the camera viewpoint!");
      return;
    }

    const camera = MOCK_CAMERAS.find((c) => c.id === selectedCamera);
    if (!camera) return;

    // Check if viewpoint already exists for this camera
    const existingViewpoint = currentFloorViewpoints.find((v) => v.cameraId === selectedCamera);

    if (existingViewpoint) {
      onViewpointUpdate(existingViewpoint.id, {
        cells: new Set(selectedCells),
      });
    } else {
      onViewpointCreate({
        cameraId: camera.id,
        cameraName: camera.name,
        cells: new Set(selectedCells),
        floor,
        color: CAMERA_VIEWPOINT_COLORS[currentFloorViewpoints.length % CAMERA_VIEWPOINT_COLORS.length],
      });
    }

    setSelectedCells(new Set());
  };

  const handleLoadViewpoint = (cameraId: string) => {
    const viewpoint = currentFloorViewpoints.find((v) => v.cameraId === cameraId);
    if (viewpoint) {
      setSelectedCamera(cameraId);
      setSelectedCells(new Set(viewpoint.cells));
    }
  };

  return (
    <div className="flex-1 flex gap-4 p-4">
      {/* Canvas */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-700">Map Cameras Field of View</h3>
          <div className="flex gap-2">
            {selectedCells.size > 0 && (
              <>
                <button
                  onClick={() => setSelectedCells(new Set())}
                  className="px-3 py-1.5 text-xs font-bold text-neutral-600 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleSaveViewpoint}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#00775B] rounded hover:bg-[#009e78] transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Field of View ({selectedCells.size} cells)
                </button>
              </>
            )}
          </div>
        </div>

        {/* Camera Selector */}
        <div className="flex items-center gap-3 p-3 bg-white rounded border border-neutral-200">
          <Camera className="w-4 h-4 text-neutral-600" />
          <select
            value={selectedCamera}
            onChange={(e) => {
              setSelectedCamera(e.target.value);
              setSelectedCells(new Set());
              if (e.target.value) {
                handleLoadViewpoint(e.target.value);
              }
            }}
            className="flex-1 px-2 py-1.5 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00775B]"
          >
            <option value="">Select a camera...</option>
            {MOCK_CAMERAS.map((camera) => {
              const hasViewpoint = currentFloorViewpoints.some((v) => v.cameraId === camera.id);
              return (
                <option key={camera.id} value={camera.id}>
                  {camera.name} {hasViewpoint ? "✓" : ""}
                </option>
              );
            })}
          </select>
        </div>

        <div className="relative bg-neutral-900 rounded border-2 border-neutral-300 overflow-hidden" style={{ height: 480 }}>
          {/* Floor Plan Background */}
          {floorPlan && (
            <img
              src={floorPlan.imageUrl}
              alt="Floor Plan"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          )}

          {/* Hover Tooltip */}
          {hoveredCamera && (() => {
            const viewpoint = currentFloorViewpoints.find(v => v.cameraId === hoveredCamera);
            if (!viewpoint) return null;
            
            return (
              <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm px-3 py-2 rounded shadow-lg border border-neutral-200">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-neutral-600" />
                  <span className="text-xs font-bold text-neutral-800">{viewpoint.cameraName}</span>
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  {viewpoint.cells.size} cells visible
                </div>
              </div>
            );
          })()}

          <svg
            ref={canvasRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
            className="cursor-crosshair relative z-10"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Grid Pattern */}
            <defs>
              <pattern id="grid-pattern-camera" width={CELL_SIZE} height={CELL_SIZE} patternUnits="userSpaceOnUse">
                <rect width={CELL_SIZE} height={CELL_SIZE} fill="none" stroke="#D1D5DB" strokeWidth="1" opacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern-camera)" />

            {/* Zones (as reference) */}
            {currentFloorZones.map((zone) => {
              const cells = Array.from(zone.cells).map((cell) => {
                const [x, y] = cell.split(",").map(Number);
                return { x, y };
              });

              // Calculate center of zone for label
              const centerX = cells.reduce((sum, cell) => sum + cell.x, 0) / cells.length;
              const centerY = cells.reduce((sum, cell) => sum + cell.y, 0) / cells.length;

              // Get zone outline path
              const outlinePath = getZoneOutlinePath(zone.cells);

              return (
                <g key={zone.id}>
                  {/* Zone outline - thick continuous border */}
                  <path
                    d={outlinePath}
                    fill="none"
                    stroke={zone.color}
                    strokeWidth={4}
                    strokeLinecap="square"
                    className="pointer-events-none"
                  />
                  
                  {/* Zone Label with background */}
                  <g transform={`translate(${centerX * CELL_SIZE + CELL_SIZE / 2}, ${centerY * CELL_SIZE + CELL_SIZE / 2})`}>
                    <rect
                      x={-zone.name.length * 3}
                      y={-10}
                      width={zone.name.length * 6}
                      height={20}
                      fill={zone.color}
                      rx={3}
                      className="pointer-events-none"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      {zone.name}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Existing Camera Viewpoints (except currently selected) */}
            {currentFloorViewpoints
              .filter((v) => v.cameraId !== selectedCamera)
              .map((viewpoint) => {
                const cells = Array.from(viewpoint.cells).map((cell) => {
                  const [x, y] = cell.split(",").map(Number);
                  return { x, y };
                });

                // Calculate center for camera icon label
                const centerX = cells.reduce((sum, cell) => sum + cell.x, 0) / cells.length;
                const centerY = cells.reduce((sum, cell) => sum + cell.y, 0) / cells.length;

                return (
                  <g key={viewpoint.id}>
                    {/* Camera FOV cells */}
                    {cells.map(({ x, y }) => (
                      <rect
                        key={`${x},${y}`}
                        x={x * CELL_SIZE}
                        y={y * CELL_SIZE}
                        width={CELL_SIZE}
                        height={CELL_SIZE}
                        fill={viewpoint.color}
                        fillOpacity={0.7}
                        stroke="none"
                      />
                    ))}
                    
                    {/* Camera Icon Label */}
                    <g 
                      transform={`translate(${centerX * CELL_SIZE + CELL_SIZE / 2}, ${centerY * CELL_SIZE + CELL_SIZE / 2})`}
                      onMouseEnter={() => setHoveredCamera(viewpoint.cameraId)}
                      onMouseLeave={() => setHoveredCamera(null)}
                      className="cursor-pointer"
                    >
                      {/* Icon background circle */}
                      <circle
                        cx={0}
                        cy={0}
                        r={18}
                        fill="white"
                        stroke={viewpoint.color}
                        strokeWidth={3}
                      />
                      {/* Camera icon */}
                      <g transform="scale(1.5)" className="pointer-events-none">
                        <rect x={-4} y={-2} width={8} height={4} fill={viewpoint.color} rx={0.5} />
                        <rect x={-2} y={-4} width={4} height={2} fill={viewpoint.color} />
                        <circle cx={1} cy={0} r={1.5} fill="white" />
                      </g>
                    </g>
                  </g>
                );
              })}

            {/* Grid Cells - Interactive */}
            {Array.from({ length: GRID_SIZE }).map((_, y) =>
              Array.from({ length: GRID_SIZE }).map((_, x) => {
                const cellKey = getCellKey(x, y);
                const isSelected = selectedCells.has(cellKey);

                return (
                  <rect
                    key={cellKey}
                    x={x * CELL_SIZE}
                    y={y * CELL_SIZE}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    fill={isSelected ? "#FF6B6B" : "transparent"}
                    fillOpacity={isSelected ? 0.6 : 0}
                    stroke={isSelected ? "#FF0000" : "none"}
                    strokeWidth={isSelected ? 2 : 0}
                    className="cursor-pointer hover:fill-[#FF6B6B] hover:fill-opacity-30 transition-all"
                    onClick={() => handleCellClick(x, y)}
                  />
                );
              })
            )}
          </svg>
        </div>

        <div className="text-xs text-neutral-500 space-y-1">
          <p>• Select a camera and mark which cells it can see</p>
          <p>• Camera viewpoints can overlap (multiple cameras can see the same area)</p>
          <p>• Zones are shown in the background as reference</p>
        </div>
      </div>

      {/* Camera Viewpoints List */}
      <div className="w-64 bg-white rounded border border-neutral-200 p-3 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
          Camera Viewpoints ({currentFloorViewpoints.length})
        </h4>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {currentFloorViewpoints.map((viewpoint) => (
            <div
              key={viewpoint.id}
              onClick={() => handleLoadViewpoint(viewpoint.cameraId)}
              className={cn(
                "p-2 rounded border cursor-pointer transition-all",
                selectedCamera === viewpoint.cameraId
                  ? "border-[#00775B] bg-[#00775B]/5"
                  : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Camera className="w-3 h-3 text-neutral-600" />
                  <span className="text-xs font-bold text-neutral-800">{viewpoint.cameraName}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete viewpoint for "${viewpoint.cameraName}"?`)) {
                      onViewpointDelete(viewpoint.id);
                      if (selectedCamera === viewpoint.cameraId) {
                        setSelectedCamera("");
                        setSelectedCells(new Set());
                      }
                    }
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="text-[10px] text-neutral-500">
                {viewpoint.cells.size} cell{viewpoint.cells.size !== 1 ? 's' : ''} visible
              </div>
            </div>
          ))}
        </div>

        {currentFloorViewpoints.length === 0 && (
          <div className="text-xs text-neutral-400 text-center py-8">
            No camera viewpoints yet.<br />Select a camera to begin!
          </div>
        )}
      </div>
    </div>
  );
};

// Main Modal Component
export const ZoneConfigurationModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [currentFloor, setCurrentFloor] = useState<string>("L1");
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [zones, setZones] = useState<ZoneConfig[]>([]);
  const [cameraViewpoints, setCameraViewpoints] = useState<CameraViewpoint[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const currentFloorPlan = floorPlans.find((fp) => fp.floor === currentFloor);

  const handleFloorPlanUpload = (imageUrl: string) => {
    setFloorPlans([
      ...floorPlans.filter((fp) => fp.floor !== currentFloor),
      { floor: currentFloor, imageUrl },
    ]);
  };

  const handleZoneCreate = (zoneData: Omit<ZoneConfig, "id">) => {
    const newZone: ZoneConfig = {
      ...zoneData,
      id: `zone-${Date.now()}`,
    };
    setZones([...zones, newZone]);
    setSelectedZone(newZone.id);
  };

  const handleZoneUpdate = (zoneId: string, updates: Partial<ZoneConfig>) => {
    setZones(zones.map((z) => (z.id === zoneId ? { ...z, ...updates } : z)));
  };

  const handleZoneDelete = (zoneId: string) => {
    setZones(zones.filter((z) => z.id !== zoneId));
    setSelectedZone(null);
  };

  const handleViewpointCreate = (viewpointData: Omit<CameraViewpoint, "id">) => {
    const newViewpoint: CameraViewpoint = {
      ...viewpointData,
      id: `viewpoint-${Date.now()}`,
    };
    setCameraViewpoints([...cameraViewpoints, newViewpoint]);
  };

  const handleViewpointUpdate = (id: string, updates: Partial<CameraViewpoint>) => {
    setCameraViewpoints(cameraViewpoints.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const handleViewpointDelete = (id: string) => {
    setCameraViewpoints(cameraViewpoints.filter((v) => v.id !== id));
  };

  const canProceedToStep2 = currentFloorPlan !== undefined;
  const canProceedToStep3 = zones.filter((z) => z.floor === currentFloor).length > 0;

  const steps = [
    { number: 1, title: "Upload Floor Plan", icon: Upload },
    { number: 2, title: "Draw Zones", icon: Grid3x3 },
    { number: 3, title: "Cameras Field of View", icon: Camera },
  ];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed inset-4 md:inset-8 bg-neutral-100 rounded-lg shadow-2xl z-50 flex flex-col animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00775B] rounded">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <Dialog.Title asChild>
                  <h2 className="text-lg font-bold text-neutral-800">Zone Configuration - {currentFloor}</h2>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <p className="text-xs text-neutral-500">Step {currentStep} of 3: {steps[currentStep - 1].title}</p>
                </Dialog.Description>
              </div>
            </div>

            {/* Floor Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded border border-neutral-200">
                <Layers className="w-4 h-4 text-neutral-600" />
                <select
                  value={currentFloor}
                  onChange={(e) => setCurrentFloor(e.target.value)}
                  className="text-sm font-bold text-neutral-700 bg-transparent border-none focus:outline-none cursor-pointer"
                >
                  {FLOORS.map((floor) => (
                    <option key={floor} value={floor}>
                      Floor {floor}
                    </option>
                  ))}
                </select>
              </div>

              <Dialog.Close asChild>
                <button className="p-2 hover:bg-neutral-100 rounded transition-colors">
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Step Progress */}
          <div className="flex items-center justify-center gap-2 p-4 bg-white border-b border-neutral-200">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded transition-all",
                      isActive && "bg-[#00775B] text-white",
                      isCompleted && "bg-green-100 text-green-700",
                      !isActive && !isCompleted && "bg-neutral-100 text-neutral-400"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                    <span className="text-xs font-bold">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 mx-1 text-neutral-300" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {currentStep === 1 && (
              <FloorPlanUpload
                floor={currentFloor}
                floorPlan={currentFloorPlan || null}
                onFloorPlanUpload={handleFloorPlanUpload}
              />
            )}

            {currentStep === 2 && (
              <ZoneDrawingCanvas
                zones={zones}
                selectedZone={selectedZone}
                onZoneCreate={handleZoneCreate}
                onZoneSelect={setSelectedZone}
                onZoneDelete={handleZoneDelete}
                onZoneUpdate={handleZoneUpdate}
                floor={currentFloor}
                floorPlan={currentFloorPlan || null}
              />
            )}

            {currentStep === 3 && (
              <CameraViewpointCanvas
                zones={zones}
                cameraViewpoints={cameraViewpoints}
                onViewpointCreate={handleViewpointCreate}
                onViewpointUpdate={handleViewpointUpdate}
                onViewpointDelete={handleViewpointDelete}
                floor={currentFloor}
                floorPlan={currentFloorPlan || null}
              />
            )}
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between p-4 border-t border-neutral-200 bg-white shrink-0">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1) as 1 | 2 | 3)}
              disabled={currentStep === 1}
              className={cn(
                "px-4 py-2 text-sm font-bold rounded transition-colors flex items-center gap-2",
                currentStep === 1
                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-2">
              {currentStep < 3 ? (
                <button
                  onClick={() => {
                    if (currentStep === 1 && !canProceedToStep2) {
                      alert("Please upload a floor plan before proceeding!");
                      return;
                    }
                    if (currentStep === 2 && !canProceedToStep3) {
                      alert("Please create at least one zone before proceeding!");
                      return;
                    }
                    setCurrentStep(Math.min(3, currentStep + 1) as 1 | 2 | 3);
                  }}
                  className="px-4 py-2 text-sm font-bold text-white bg-[#00775B] rounded hover:bg-[#009e78] transition-colors flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    alert("Configuration saved successfully!");
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-bold text-white bg-[#00775B] rounded hover:bg-[#009e78] transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save & Close
                </button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};