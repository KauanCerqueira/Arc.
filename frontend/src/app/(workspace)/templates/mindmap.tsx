"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData'
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types'
import {
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Circle,
  Square,
  Hexagon,
  MessageSquare,
  X,
  Copy,
  Search,
  Undo,
  Redo,
  Lightbulb,
  Star,
  Heart,
  Brain,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Send,
  Minimize2,
  Grid3x3,
  Eye,
  EyeOff,
} from 'lucide-react'

// ===========================================
// TYPES
// ===========================================

type Position = { x: number; y: number }

type NodeShape = 'rectangle' | 'circle' | 'hexagon' | 'diamond'

type NodeIcon = 'none' | 'lightbulb' | 'star' | 'heart' | 'brain' | 'zap' | 'target' | 'trending' | 'check' | 'alert'

type MindMapNode = {
  id: string
  label: string
  description?: string
  color: string
  shape: NodeShape
  icon: NodeIcon
  position: Position
  parentId: string | null
  children: string[]
  isCollapsed: boolean
  comments: { id: string; text: string; author: string; timestamp: string }[]
}

type MindMapData = {
  nodes: Record<string, MindMapNode>
}

// ===========================================
// CONSTANTS
// ===========================================

const COLORS = [
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Amarelo', value: '#F59E0B' },
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Ciano', value: '#06B6D4' },
  { name: 'Laranja', value: '#F97316' },
  { name: 'Índigo', value: '#6366F1' },
  { name: 'Esmeralda', value: '#059669' },
]

const ICONS: { id: NodeIcon; Icon: any; label: string }[] = [
  { id: 'none', Icon: null, label: 'Sem ícone' },
  { id: 'lightbulb', Icon: Lightbulb, label: 'Ideia' },
  { id: 'star', Icon: Star, label: 'Importante' },
  { id: 'heart', Icon: Heart, label: 'Favorito' },
  { id: 'brain', Icon: Brain, label: 'Conceito' },
  { id: 'zap', Icon: Zap, label: 'Ação' },
  { id: 'target', Icon: Target, label: 'Meta' },
  { id: 'trending', Icon: TrendingUp, label: 'Crescimento' },
  { id: 'check', Icon: CheckCircle, label: 'Completo' },
  { id: 'alert', Icon: AlertCircle, label: 'Atenção' },
]

const DEFAULT_NODES: Record<string, MindMapNode> = {
  root: {
    id: 'root',
    label: 'Mapa Mental',
    description: 'Organize suas ideias visualmente',
    color: '#8B5CF6',
    shape: 'circle',
    icon: 'brain',
    position: { x: 600, y: 400 },
    parentId: null,
    children: [],
    isCollapsed: false,
    comments: [],
  },
}

const DEFAULT_DATA: MindMapData = { nodes: DEFAULT_NODES }

// ===========================================
// HELPER FUNCTIONS
// ===========================================

const generateCurve = (start: Position, end: Position, color: string): string => {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const curvature = Math.min(distance * 0.4, 120)

  const cp1x = start.x + curvature
  const cp1y = start.y
  const cp2x = end.x - curvature
  const cp2y = end.y

  return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`
}

const getShapePath = (shape: NodeShape, size: number): string => {
  const half = size / 2
  switch (shape) {
    case 'rectangle':
      return `M ${-half} ${-half} L ${half} ${-half} L ${half} ${half} L ${-half} ${half} Z`
    case 'circle':
      return `M 0 ${-half} A ${half} ${half} 0 1 1 0 ${half} A ${half} ${half} 0 1 1 0 ${-half} Z`
    case 'hexagon': {
      const angle = Math.PI / 3
      const points = []
      for (let i = 0; i < 6; i++) {
        const x = half * Math.cos(angle * i)
        const y = half * Math.sin(angle * i)
        points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`)
      }
      return points.join(' ') + ' Z'
    }
    case 'diamond':
      return `M 0 ${-half} L ${half} 0 L 0 ${half} L ${-half} 0 Z`
    default:
      return ''
  }
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function MindMap({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const { data, setData } = usePageTemplateData<MindMapData>(groupId, pageId, DEFAULT_DATA)
  const persistedNodes = data.nodes ?? DEFAULT_NODES

  const [nodes, setNodes] = useState<Record<string, MindMapNode>>(persistedNodes)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [history, setHistory] = useState<Record<string, MindMapNode>[]>([persistedNodes])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [showGrid, setShowGrid] = useState(false)
  const [showMinimap, setShowMinimap] = useState(true)

  // Sync nodes from data
  useEffect(() => {
    setNodes(persistedNodes)
  }, [persistedNodes])

  // Persist nodes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(nodes) === JSON.stringify(persistedNodes)) return
      setData((current) => ({ ...current, nodes }))
    }, 300)
    return () => clearTimeout(timer)
  }, [nodes, persistedNodes, setData])

  // Save to history
  const saveToHistory = useCallback((newNodes: Record<string, MindMapNode>) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(newNodes)
      if (newHistory.length > 50) newHistory.shift() // Limit history
      return newHistory
    })
    setHistoryIndex((prev) => Math.min(prev + 1, 49))
  }, [historyIndex])

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setNodes(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setNodes(history[historyIndex + 1])
    }
  }

  // Add node
  const addNode = (parentId: string) => {
    const parent = nodes[parentId]
    if (!parent) return

    const newId = `${Date.now()}`
    const childCount = parent.children.length

    // Calculate position in a circle around parent
    const angle = (childCount * (2 * Math.PI)) / Math.max(parent.children.length + 1, 6)
    const distance = 200
    const newX = parent.position.x + Math.cos(angle) * distance
    const newY = parent.position.y + Math.sin(angle) * distance

    const newNode: MindMapNode = {
      id: newId,
      label: 'Novo Nó',
      description: '',
      color: parent.color,
      shape: 'rectangle',
      icon: 'none',
      position: { x: newX, y: newY },
      parentId,
      children: [],
      isCollapsed: false,
      comments: [],
    }

    const newNodes = {
      ...nodes,
      [newId]: newNode,
      [parentId]: {
        ...parent,
        children: [...parent.children, newId],
      },
    }

    setNodes(newNodes)
    saveToHistory(newNodes)
    setSelectedNode(newId)
    setEditingNode(newId)
    setEditLabel('Novo Nó')
  }

  // Delete node
  const deleteNode = (nodeId: string) => {
    if (nodeId === 'root') return
    if (!confirm('Deletar este nó e todos os filhos?')) return

    const toDelete = new Set<string>([nodeId])
    const collectChildren = (id: string) => {
      const node = nodes[id]
      if (node) {
        node.children.forEach((childId) => {
          toDelete.add(childId)
          collectChildren(childId)
        })
      }
    }
    collectChildren(nodeId)

    const newNodes = { ...nodes }
    toDelete.forEach((id) => delete newNodes[id])

    const node = nodes[nodeId]
    if (node.parentId && newNodes[node.parentId]) {
      const parent = newNodes[node.parentId]
      newNodes[node.parentId] = {
        ...parent,
        children: parent.children.filter((id) => id !== nodeId),
      }
    }

    setNodes(newNodes)
    saveToHistory(newNodes)
    setSelectedNode(null)
  }

  // Update node
  const updateNode = (nodeId: string, updates: Partial<MindMapNode>) => {
    const newNodes = {
      ...nodes,
      [nodeId]: {
        ...nodes[nodeId],
        ...updates,
      },
    }
    setNodes(newNodes)
    saveToHistory(newNodes)
  }

  // Duplicate node
  const duplicateNode = (nodeId: string) => {
    const node = nodes[nodeId]
    if (!node || !node.parentId) return

    const newId = `${Date.now()}`
    const parent = nodes[node.parentId]

    const newNode: MindMapNode = {
      ...node,
      id: newId,
      label: `${node.label} (cópia)`,
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      children: [],
      comments: [],
    }

    const newNodes = {
      ...nodes,
      [newId]: newNode,
      [node.parentId]: {
        ...parent,
        children: [...parent.children, newId],
      },
    }

    setNodes(newNodes)
    saveToHistory(newNodes)
    setSelectedNode(newId)
  }

  // Toggle collapse
  const toggleCollapse = (nodeId: string) => {
    updateNode(nodeId, { isCollapsed: !nodes[nodeId].isCollapsed })
  }

  // Change color with children
  const updateColor = (nodeId: string, color: string) => {
    const newNodes = { ...nodes }
    const applyColor = (id: string) => {
      if (!newNodes[id]) return
      newNodes[id] = { ...newNodes[id], color }
      newNodes[id].children.forEach(applyColor)
    }
    applyColor(nodeId)
    setNodes(newNodes)
    saveToHistory(newNodes)
  }

  // Add comment
  const addComment = (nodeId: string) => {
    if (!newComment.trim()) return

    const comment = {
      id: Date.now().toString(),
      text: newComment,
      author: 'Você',
      timestamp: new Date().toISOString(),
    }

    updateNode(nodeId, {
      comments: [...(nodes[nodeId].comments || []), comment],
    })

    setNewComment('')
  }

  // Drag & Drop
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (editingNode) return

    const node = nodes[nodeId]
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = (e.clientX - rect.left - pan.x) / zoom
    const mouseY = (e.clientY - rect.top - pan.y) / zoom

    setDraggingNode(nodeId)
    setDragOffset({
      x: mouseX - node.position.x,
      y: mouseY - node.position.y,
    })
    setSelectedNode(nodeId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    if (draggingNode) {
      const mouseX = (e.clientX - rect.left - pan.x) / zoom
      const mouseY = (e.clientY - rect.top - pan.y) / zoom

      updateNode(draggingNode, {
        position: {
          x: mouseX - dragOffset.x,
          y: mouseY - dragOffset.y,
        },
      })
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setDraggingNode(null)
    setIsPanning(false)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 0) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      })
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.3, Math.min(3, zoom + delta))
    setZoom(newZoom)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const preventScroll = (e: WheelEvent) => e.preventDefault()
    canvas.addEventListener('wheel', preventScroll, { passive: false })
    return () => canvas.removeEventListener('wheel', preventScroll)
  }, [])

  // Reset view
  const resetView = () => {
    const rootNode = nodes['root']
    if (!rootNode || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    setZoom(1)
    setPan({
      x: centerX - rootNode.position.x,
      y: centerY - rootNode.position.y,
    })
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingNode) return

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      } else if (e.key === 'Delete' && selectedNode) {
        deleteNode(selectedNode)
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedNode) {
        e.preventDefault()
        duplicateNode(selectedNode)
      } else if (e.key === 'Enter' && selectedNode) {
        addNode(selectedNode)
      } else if (e.key === 'Escape') {
        setSelectedNode(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNode, editingNode, historyIndex])

  // Filter nodes by search
  const filteredNodeIds = searchQuery.trim()
    ? Object.values(nodes)
        .filter((n) => n.label.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((n) => n.id)
    : []

  const selectedNodeObj = selectedNode ? nodes[selectedNode] : null
  const commentsModalNode = showCommentsModal && selectedNode ? nodes[selectedNode] : null

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      {/* Header - COMPACTO */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-semibold text-neutral-900 dark:text-white">Mapa Mental</h1>
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
              <span>{Object.keys(nodes).length} nós</span>
              <span>•</span>
              <span>Arraste • Dê duplo clique • Scroll zoom</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="pl-7 pr-2 py-1 text-xs w-32 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            {/* Undo/Redo */}
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition disabled:opacity-30"
              title="Desfazer (Ctrl+Z)"
            >
              <Undo className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition disabled:opacity-30"
              title="Refazer (Ctrl+Y)"
            >
              <Redo className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </button>

            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700" />

            {/* Zoom */}
            <button
              onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
            >
              <ZoomOut className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </button>
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
            >
              <ZoomIn className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </button>
            <button
              onClick={resetView}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
              title="Centralizar"
            >
              <Maximize2 className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </button>

            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700" />

            {/* Grid */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1 rounded transition ${
                showGrid
                  ? 'bg-neutral-900 dark:bg-neutral-700 text-white'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
              title="Grade"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>

            {/* Minimap */}
            <button
              onClick={() => setShowMinimap(!showMinimap)}
              className={`p-1 rounded transition ${
                showMinimap
                  ? 'bg-neutral-900 dark:bg-neutral-700 text-white'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
              title="Mini mapa"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Node Controls Toolbar */}
      {selectedNodeObj && (
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Selecionado: <strong>{selectedNodeObj.label}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Shape */}
              <div className="flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded">
                {(['rectangle', 'circle', 'hexagon', 'diamond'] as NodeShape[]).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => updateNode(selectedNode!, { shape })}
                    className={`p-1 rounded transition ${
                      selectedNodeObj.shape === shape
                        ? 'bg-neutral-900 dark:bg-neutral-700 text-white'
                        : 'hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                    title={shape}
                  >
                    {shape === 'rectangle' && <Square className="w-3 h-3" />}
                    {shape === 'circle' && <Circle className="w-3 h-3" />}
                    {shape === 'hexagon' && <Hexagon className="w-3 h-3" />}
                    {shape === 'diamond' && <div className="w-3 h-3 rotate-45 border-2 border-current" />}
                  </button>
                ))}
              </div>

              {/* Icons */}
              <select
                value={selectedNodeObj.icon}
                onChange={(e) => updateNode(selectedNode!, { icon: e.target.value as NodeIcon })}
                className="px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none"
              >
                {ICONS.map((icon) => (
                  <option key={icon.id} value={icon.id}>
                    {icon.label}
                  </option>
                ))}
              </select>

              {/* Colors */}
              <div className="flex items-center gap-1 px-1 py-1 bg-neutral-100 dark:bg-neutral-800 rounded">
                {COLORS.slice(0, 6).map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateColor(selectedNode!, color.value)}
                    className={`w-5 h-5 rounded border-2 transition ${
                      selectedNodeObj.color === color.value
                        ? 'border-neutral-900 dark:border-white scale-110'
                        : 'border-white dark:border-neutral-900'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>

              <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

              {/* Actions */}
              <button
                onClick={() => {
                  setEditingNode(selectedNode)
                  setEditLabel(selectedNodeObj.label)
                }}
                className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition"
              >
                Editar
              </button>
              <button
                onClick={() => addNode(selectedNode!)}
                className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Filho
              </button>
              <button
                onClick={() => duplicateNode(selectedNode!)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
                title="Duplicar (Ctrl+D)"
              >
                <Copy className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              </button>
              <button
                onClick={() => setShowCommentsModal(true)}
                className="relative p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
                title="Comentários"
              >
                <MessageSquare className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                {selectedNodeObj.comments.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 text-white text-[8px] rounded-full flex items-center justify-center">
                    {selectedNodeObj.comments.length}
                  </span>
                )}
              </button>
              {selectedNode !== 'root' && (
                <button
                  onClick={() => deleteNode(selectedNode!)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded transition"
                  title="Deletar (Del)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Grid */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e5e5 1px, transparent 1px),
                linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
              `,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              transform: `translate(${pan.x % (20 * zoom)}px, ${pan.y % (20 * zoom)}px)`,
            }}
          />
        )}

        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
        >
          {/* SVG Lines */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {Object.values(nodes).map((node) => {
              if (!node.parentId || node.isCollapsed) return null
              const parent = nodes[node.parentId]
              if (!parent || parent.isCollapsed) return null

              const path = generateCurve(parent.position, node.position, node.color)

              return (
                <path
                  key={`${node.id}-line`}
                  d={path}
                  stroke={node.color}
                  strokeWidth="3"
                  fill="none"
                  opacity="0.6"
                  strokeLinecap="round"
                />
              )
            })}
          </svg>

          {/* Nodes */}
          {Object.values(nodes).map((node) => {
            if (node.parentId && nodes[node.parentId]?.isCollapsed) return null

            const isRoot = node.id === 'root'
            const isSelected = selectedNode === node.id
            const isEditing = editingNode === node.id
            const isHighlighted = searchQuery && filteredNodeIds.includes(node.id)
            const IconComponent = ICONS.find((i) => i.id === node.icon)?.Icon

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
                  e.stopPropagation()
                  handleMouseDown(e, node.id)
                }}
                onDoubleClick={() => {
                  setEditingNode(node.id)
                  setEditLabel(node.label)
                }}
                className={`cursor-move transition-transform ${isSelected || isHighlighted ? 'scale-110' : 'hover:scale-105'}`}
              >
                <div
                  className={`bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-3 border-3 transition-all ${
                    isRoot ? 'min-w-[160px]' : 'min-w-[120px]'
                  } ${isSelected ? 'shadow-2xl ring-4 ring-opacity-30' : 'hover:shadow-xl'} ${
                    isHighlighted ? 'ring-4 ring-yellow-400' : ''
                  }`}
                  style={{
                    borderColor: node.color,
                    borderWidth: '3px',
                  }}
                >
                  {/* Icon */}
                  {IconComponent && (
                    <div className="flex justify-center mb-1">
                      <IconComponent className="w-5 h-5" style={{ color: node.color }} />
                    </div>
                  )}

                  {/* Label */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onBlur={() => {
                        if (editLabel.trim()) {
                          updateNode(node.id, { label: editLabel })
                        }
                        setEditingNode(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editLabel.trim()) {
                            updateNode(node.id, { label: editLabel })
                          }
                          setEditingNode(null)
                        } else if (e.key === 'Escape') {
                          setEditingNode(null)
                        }
                      }}
                      className="w-full px-2 py-1 text-center text-sm font-semibold bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 rounded focus:outline-none text-neutral-900 dark:text-white"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="text-center text-sm font-semibold text-neutral-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">
                      {node.label}
                    </div>
                  )}

                  {/* Description preview */}
                  {node.description && !isEditing && (
                    <div className="text-[10px] text-neutral-600 dark:text-neutral-400 text-center mt-1 line-clamp-1">
                      {node.description}
                    </div>
                  )}

                  {/* Children count */}
                  {node.children.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCollapse(node.id)
                      }}
                      className="mt-2 w-full pt-2 border-t border-neutral-200 dark:border-neutral-700 text-[10px] text-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
                    >
                      {node.isCollapsed ? (
                        <Eye className="w-3 h-3 mx-auto" />
                      ) : (
                        <EyeOff className="w-3 h-3 mx-auto" />
                      )}{' '}
                      {node.children.length}
                    </button>
                  )}

                  {/* Comments indicator */}
                  {node.comments.length > 0 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold shadow-lg">
                      {node.comments.length}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Minimap */}
        {showMinimap && (
          <div className="absolute bottom-4 right-4 w-48 h-32 bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden">
            <div className="relative w-full h-full">
              {Object.values(nodes).map((node) => {
                const scale = 0.05
                return (
                  <div
                    key={node.id}
                    className="absolute rounded-full"
                    style={{
                      left: `${node.position.x * scale}px`,
                      top: `${node.position.y * scale}px`,
                      width: '4px',
                      height: '4px',
                      backgroundColor: node.color,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {commentsModalNode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCommentsModal(false)}>
          <div
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-neutral-200 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-none border-b border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">{commentsModalNode.label}</h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Comentários</p>
                </div>
                <button onClick={() => setShowCommentsModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {commentsModalNode.comments.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Nenhum comentário</p>
                </div>
              ) : (
                commentsModalNode.comments.map((comment) => (
                  <div key={comment.id} className="bg-neutral-50 dark:bg-neutral-800 rounded p-3">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-medium text-neutral-900 dark:text-white">{comment.author}</span>
                      <span className="text-xs text-neutral-500">{new Date(comment.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex-none border-t border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicione um comentário..."
                  className="flex-1 px-3 py-2 text-xs border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      addComment(selectedNode!)
                    }
                  }}
                />
                <button
                  onClick={() => addComment(selectedNode!)}
                  disabled={!newComment.trim()}
                  className="px-3 py-2 bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 transition disabled:opacity-50 self-end"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-2">Ctrl+Enter para enviar</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
