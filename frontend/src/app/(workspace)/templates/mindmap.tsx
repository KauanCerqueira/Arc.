"use client";

import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Palette
} from 'lucide-react';

type Position = {
  x: number;
  y: number;
};

type MindMapNode = {
  id: string;
  label: string;
  color: string;
  position: Position;
  parentId: string | null;
  children: string[];
};

const COLORS = [
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Laranja', value: '#F97316' },
  { name: 'Âmbar', value: '#F59E0B' },
  { name: 'Amarelo', value: '#EAB308' },
  { name: 'Lima', value: '#84CC16' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Esmeralda', value: '#059669' },
  { name: 'Ciano', value: '#06B6D4' },
  { name: 'Azul Claro', value: '#0EA5E9' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Índigo', value: '#6366F1' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Violeta', value: '#A855F7' },
  { name: 'Fúcsia', value: '#D946EF' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Rosa Forte', value: '#F43F5E' },
];

export default function MindMap() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Record<string, MindMapNode>>({
    root: {
      id: 'root',
      label: 'Ideia Central',
      color: '#8B5CF6',
      position: { x: 600, y: 400 },
      parentId: null,
      children: ['1', '2', '3'],
    },
    '1': {
      id: '1',
      label: 'Ramificação 1',
      color: '#EF4444',
      position: { x: 350, y: 250 },
      parentId: 'root',
      children: ['1-1', '1-2'],
    },
    '1-1': {
      id: '1-1',
      label: 'Subnó 1.1',
      color: '#EF4444',
      position: { x: 180, y: 200 },
      parentId: '1',
      children: [],
    },
    '1-2': {
      id: '1-2',
      label: 'Subnó 1.2',
      color: '#EF4444',
      position: { x: 180, y: 300 },
      parentId: '1',
      children: [],
    },
    '2': {
      id: '2',
      label: 'Ramificação 2',
      color: '#3B82F6',
      position: { x: 850, y: 250 },
      parentId: 'root',
      children: ['2-1'],
    },
    '2-1': {
      id: '2-1',
      label: 'Subnó 2.1',
      color: '#3B82F6',
      position: { x: 1020, y: 200 },
      parentId: '2',
      children: [],
    },
    '3': {
      id: '3',
      label: 'Ramificação 3',
      color: '#10B981',
      position: { x: 600, y: 600 },
      parentId: 'root',
      children: [],
    },
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Gerar curva Bézier suave
  const generateCurve = (start: Position, end: Position): string => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // Controle da curvatura baseado na distância
    const distance = Math.sqrt(dx * dx + dy * dy);
    const curvature = Math.min(distance * 0.4, 100);

    // Pontos de controle para curva suave
    const cp1x = start.x + curvature;
    const cp1y = start.y;
    const cp2x = end.x - curvature;
    const cp2y = end.y;

    return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
  };

  // Adicionar novo nó
  const addNode = (parentId: string) => {
    const parent = nodes[parentId];
    if (!parent) return;

    const newId = `${parentId}-${Date.now()}`;

    // Calcular posição baseada no pai
    const angle = (parent.children.length * 60) - 30; // Distribuir em leque
    const distance = 200;
    const rad = (angle * Math.PI) / 180;

    let newX = parent.position.x + Math.cos(rad) * distance;
    let newY = parent.position.y + Math.sin(rad) * distance;

    // Ajuste para evitar sobreposição
    if (parent.id === 'root') {
      const childCount = parent.children.length;
      if (childCount === 0) newX = parent.position.x - 250;
      else if (childCount === 1) newX = parent.position.x + 250;
      else if (childCount === 2) newY = parent.position.y + 200;
    }

    const newNode: MindMapNode = {
      id: newId,
      label: 'Novo Nó',
      color: parent.color,
      position: { x: newX, y: newY },
      parentId,
      children: [],
    };

    setNodes({
      ...nodes,
      [newId]: newNode,
      [parentId]: {
        ...parent,
        children: [...parent.children, newId],
      },
    });

    setSelectedNode(newId);
    setEditingNode(newId);
    setEditLabel('Novo Nó');
  };

  // Deletar nó
  const deleteNode = (nodeId: string) => {
    if (nodeId === 'root') return;
    if (!confirm('Deletar este nó e todos os seus filhos?')) return;

    const node = nodes[nodeId];
    const parent = node.parentId ? nodes[node.parentId] : null;

    // Deletar nó e filhos recursivamente
    const toDelete = [nodeId];
    const processChildren = (id: string) => {
      const n = nodes[id];
      if (n) {
        n.children.forEach(childId => {
          toDelete.push(childId);
          processChildren(childId);
        });
      }
    };
    processChildren(nodeId);

    const newNodes = { ...nodes };
    toDelete.forEach(id => delete newNodes[id]);

    // Remover do pai
    if (parent) {
      newNodes[parent.id] = {
        ...parent,
        children: parent.children.filter(id => id !== nodeId),
      };
    }

    setNodes(newNodes);
    setSelectedNode(null);
  };

  // Atualizar label
  const updateLabel = (nodeId: string, newLabel: string) => {
    if (!newLabel.trim()) return;
    setNodes({
      ...nodes,
      [nodeId]: {
        ...nodes[nodeId],
        label: newLabel,
      },
    });
  };

  // Atualizar cor
  const updateColor = (nodeId: string, newColor: string) => {
    const updateNodeAndChildren = (id: string, color: string) => {
      const node = nodes[id];
      if (!node) return;

      const updated = {
        ...node,
        color,
      };

      const newNodes = {
        ...nodes,
        [id]: updated,
      };

      // Atualizar filhos recursivamente
      node.children.forEach(childId => {
        if (nodes[childId]) {
          newNodes[childId] = {
            ...nodes[childId],
            color,
          };
          const child = nodes[childId];
          child.children.forEach(grandChildId => {
            if (nodes[grandChildId]) {
              newNodes[grandChildId] = {
                ...nodes[grandChildId],
                color,
              };
            }
          });
        }
      });

      setNodes(newNodes);
    };

    updateNodeAndChildren(nodeId, newColor);
  };

  // Drag & Drop
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (editingNode) return;

    const node = nodes[nodeId];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    setDraggingNode(nodeId);
    setDragOffset({
      x: mouseX - node.position.x,
      y: mouseY - node.position.y,
    });
    setSelectedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (draggingNode) {
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      setNodes({
        ...nodes,
        [draggingNode]: {
          ...nodes[draggingNode],
          position: {
            x: mouseX - dragOffset.x,
            y: mouseY - dragOffset.y,
          },
        },
      });
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
    setIsPanning(false);
  };

  // Pan com espaço ou botão do meio
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
   if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };

  // Zoom com scroll - prevenir scroll da página
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.3, Math.min(2, zoom + delta));
    setZoom(newZoom);
  };

  // Prevenir scroll da página quando mouse estiver no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener('wheel', preventScroll, { passive: false });
    return () => canvas.removeEventListener('wheel', preventScroll);
  }, []);

  // Reset view - centralizar o nó root
  const resetView = () => {
    const rootNode = nodes['root'];
    if (!rootNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setZoom(1);
    setPan({
      x: centerX - rootNode.position.x,
      y: centerY - rootNode.position.y,
    });
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Mapa Mental
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Arraste os nós • Clique para editar • Scroll para zoom
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <button
              onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
              className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={resetView}
              className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition"
              title="Reset View"
            >
              <Maximize2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-slate-700 mx-2"></div>

            {/* Node Controls */}
            {selectedNode && (
              <>
                <button
                  onClick={() => {
                    setEditingNode(selectedNode);
                    setEditLabel(nodes[selectedNode]?.label || '');
                  }}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Editar</span>
                </button>
                <button
                  onClick={() => addNode(selectedNode)}
                  className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Adicionar</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition flex items-center gap-2"
                    title="Mudar Cor"
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 shadow-md"
                      style={{ backgroundColor: nodes[selectedNode]?.color || '#8B5CF6' }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cor</span>
                  </button>

                  {showColorPicker && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)}></div>
                      <div className="absolute top-full right-0 mt-2 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 min-w-[280px]">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            Escolha uma cor
                          </p>
                          <button
                            onClick={() => setShowColorPicker(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Paleta de cores em círculo */}
                        <div className="relative w-64 h-64 mx-auto mb-4">
                          {/* Círculo externo com cores */}
                          <div className="absolute inset-0 rounded-full" style={{
                            background: `conic-gradient(
                              from 0deg,
                              #EF4444 0deg 22.5deg,
                              #F97316 22.5deg 45deg,
                              #F59E0B 45deg 67.5deg,
                              #EAB308 67.5deg 90deg,
                              #84CC16 90deg 112.5deg,
                              #10B981 112.5deg 135deg,
                              #059669 135deg 157.5deg,
                              #06B6D4 157.5deg 180deg,
                              #0EA5E9 180deg 202.5deg,
                              #3B82F6 202.5deg 225deg,
                              #6366F1 225deg 247.5deg,
                              #8B5CF6 247.5deg 270deg,
                              #A855F7 270deg 292.5deg,
                              #D946EF 292.5deg 315deg,
                              #EC4899 315deg 337.5deg,
                              #F43F5E 337.5deg 360deg
                            )`
                          }}>
                          </div>

                          {/* Centro branco */}
                          <div className="absolute inset-8 bg-white dark:bg-slate-900 rounded-full shadow-inner flex items-center justify-center">
                            <div
                              className="w-20 h-20 rounded-full shadow-lg border-4 border-white dark:border-slate-700"
                              style={{ backgroundColor: nodes[selectedNode]?.color || '#8B5CF6' }}
                            />
                          </div>

                          {/* Botões de cores invisíveis sobre o círculo */}
                          {COLORS.map((color, index) => {
                            const angle = (index * 22.5) - 90; // -90 para começar do topo
                            const rad = (angle * Math.PI) / 180;
                            const radius = 100; // raio do círculo
                            const x = 128 + radius * Math.cos(rad); // 128 = metade de 256px
                            const y = 128 + radius * Math.sin(rad);

                            return (
                              <button
                                key={color.value}
                                onClick={() => {
                                  updateColor(selectedNode, color.value);
                                  setShowColorPicker(false);
                                }}
                                className="absolute w-10 h-10 rounded-full hover:scale-125 transition-transform cursor-pointer"
                                style={{
                                  left: `${x}px`,
                                  top: `${y}px`,
                                  transform: 'translate(-50%, -50%)',
                                  backgroundColor: color.value,
                                  border: nodes[selectedNode]?.color === color.value ? '3px solid white' : '2px solid rgba(255,255,255,0.3)',
                                  boxShadow: nodes[selectedNode]?.color === color.value ? '0 0 0 2px rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
                                }}
                                title={color.name}
                              />
                            );
                          })}
                        </div>

                        {/* Lista de cores como fallback */}
                        <div className="grid grid-cols-8 gap-2 pt-3 border-t border-gray-200 dark:border-slate-700">
                          {COLORS.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => {
                                updateColor(selectedNode, color.value);
                                setShowColorPicker(false);
                              }}
                              className={`w-8 h-8 rounded-lg hover:scale-110 transition-transform shadow-md ${
                                nodes[selectedNode]?.color === color.value ? 'ring-2 ring-gray-900 dark:ring-white ring-offset-2' : ''
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {selectedNode !== 'root' && (
                  <button
                    onClick={() => deleteNode(selectedNode)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition"
                    title="Deletar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative cursor-move select-none"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isPanning ? 'grabbing' : draggingNode ? 'grabbing' : 'default' }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
        >
          {/* SVG para as linhas */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            {Object.values(nodes).map(node => {
              if (!node.parentId) return null;
              const parent = nodes[node.parentId];
              if (!parent) return null;

              const path = generateCurve(parent.position, node.position);

              return (
                <g key={`${node.id}-line`}>
                  <path
                    d={path}
                    stroke={node.color}
                    strokeWidth="3"
                    fill="none"
                    opacity="0.6"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {Object.values(nodes).map(node => {
            const isRoot = node.id === 'root';
            const isSelected = selectedNode === node.id;
            const isEditing = editingNode === node.id;

            return (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: node.position.x,
                  top: node.position.y,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isSelected ? 1000 : isRoot ? 100 : 10,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e, node.id);
                }}
                className={`cursor-move transition-transform ${
                  isSelected ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                <div
                  className={`
                    bg-white dark:bg-slate-900 rounded-xl shadow-lg
                    border-3 transition-all
                    ${isRoot ? 'min-w-[180px] p-4' : 'min-w-[140px] p-3'}
                    ${isSelected ? 'shadow-2xl ring-4 ring-opacity-30' : 'hover:shadow-xl'}
                  `}
                  style={{
                    borderColor: node.color,
                    borderWidth: '3px',
                    ...(isSelected && {
                      ringColor: node.color,
                    }),
                  }}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onBlur={() => {
                        updateLabel(node.id, editLabel);
                        setEditingNode(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateLabel(node.id, editLabel);
                          setEditingNode(null);
                        } else if (e.key === 'Escape') {
                          setEditingNode(null);
                        }
                      }}
                      className="w-full px-2 py-1 text-center font-semibold bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      className={`text-center font-semibold text-gray-900 dark:text-gray-100 ${
                        isRoot ? 'text-base' : 'text-sm'
                      }`}
                      style={{
                        color: 'inherit',
                        userSelect: 'none'
                      }}
                    >
                      {node.label}
                    </div>
                  )}

                  {isRoot && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                        {node.children.length} ramificaç{node.children.length === 1 ? 'ão' : 'ões'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Indicador de cor */}
                <div
                  className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-md"
                  style={{ backgroundColor: node.color }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-6">
            <span>Total de nós: <strong className="text-gray-900 dark:text-gray-100">{Object.keys(nodes).length}</strong></span>
            <span>Nó selecionado: <strong className="text-gray-900 dark:text-gray-100">{selectedNode ? nodes[selectedNode]?.label : 'Nenhum'}</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <span>💡 Dica: Arraste os nós para reorganizar</span>
            <span>⚡ Use scroll para zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
}
