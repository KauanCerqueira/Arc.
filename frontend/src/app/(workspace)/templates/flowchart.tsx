'use client'

import { useCallback, useState, useEffect, useMemo, useRef, MouseEvent as ReactMouseEvent } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  MarkerType,
  Handle,
  Position,
  NodeProps,
  ReactFlowInstance,
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  Plus,
  Trash2,
  X,
  Circle,
  Square,
  Diamond,
  Hexagon,
  Cylinder,
  FileText,
  User,
  Settings,
  Save,
  Download,
  Upload,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from 'lucide-react'
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData'
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types'

const cloneNodes = (source: Node[]): Node[] =>
  source.map((node) => ({
    ...node,
    data: node.data ? { ...node.data } : node.data,
  }))

const cloneEdges = (source: Edge[]): Edge[] =>
  source.map((edge) => ({
    ...edge,
    data: edge.data ? { ...edge.data } : edge.data,
  }))

// Paleta de cores expandida
const COLOR_PALETTE = [
  { id: 'blue', name: 'Azul', bg: '#3b82f6', text: '#ffffff' },
  { id: 'green', name: 'Verde', bg: '#10b981', text: '#ffffff' },
  { id: 'red', name: 'Vermelho', bg: '#ef4444', text: '#ffffff' },
  { id: 'yellow', name: 'Amarelo', bg: '#f59e0b', text: '#000000' },
  { id: 'purple', name: 'Roxo', bg: '#8b5cf6', text: '#ffffff' },
  { id: 'pink', name: 'Rosa', bg: '#ec4899', text: '#ffffff' },
  { id: 'gray', name: 'Cinza', bg: '#6b7280', text: '#ffffff' },
  { id: 'cyan', name: 'Ciano', bg: '#06b6d4', text: '#ffffff' },
  { id: 'indigo', name: 'Índigo', bg: '#6366f1', text: '#ffffff' },
  { id: 'orange', name: 'Laranja', bg: '#f97316', text: '#ffffff' },
  { id: 'teal', name: 'Turquesa', bg: '#14b8a6', text: '#ffffff' },
  { id: 'lime', name: 'Lima', bg: '#84cc16', text: '#000000' },
]

// Custom Edge com labels editáveis
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 font-medium shadow-sm"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

// Nó Processo (Retângulo)
const ProcessNode = ({ data, selected }: NodeProps) => {
  const color = COLOR_PALETTE.find(c => c.id === data.colorId) || COLOR_PALETTE[0]
  const textAlign = data.textAlign || 'center'
  const fontWeight = data.bold ? 'bold' : 'semibold'
  const fontStyle = data.italic ? 'italic' : 'normal'
  const textDecoration = data.underline ? 'underline' : 'none'

  return (
    <div
      className={`px-6 py-3 rounded-lg shadow-lg border-2 transition-all ${
        selected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
      }`}
      style={{
        backgroundColor: color.bg,
        borderColor: color.bg,
        color: color.text,
        minWidth: '140px',
        filter: selected ? 'brightness(1.1)' : 'none',
      }}
    >
      {/* Handles em todas as direções */}
      <Handle type="target" position={Position.Top} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg }} />
      <Handle type="source" position={Position.Bottom} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg }} />
      <Handle type="target" position={Position.Left} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg }} />
      <Handle type="source" position={Position.Right} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg }} />
      <div
        className="text-sm whitespace-pre-wrap"
        style={{
          textAlign: textAlign as any,
          fontWeight,
          fontStyle,
          textDecoration,
        }}
      >
        {data.label}
      </div>
    </div>
  )
}

// Nó Início/Fim (Oval)
const TerminalNode = ({ data, selected }: NodeProps) => {
  const color = COLOR_PALETTE.find(c => c.id === data.colorId) || COLOR_PALETTE[0]
  const fontWeight = data.bold ? 'bold' : 'semibold'
  const fontStyle = data.italic ? 'italic' : 'normal'
  const textDecoration = data.underline ? 'underline' : 'none'

  return (
    <div
      className={`px-8 py-3 rounded-full shadow-lg border-2 transition-all ${
        selected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
      }`}
      style={{
        backgroundColor: color.bg,
        borderColor: color.bg,
        color: color.text,
        minWidth: '120px',
        filter: selected ? 'brightness(1.1)' : 'none',
      }}
    >
      <Handle type="target" position={Position.Top} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg }} />
      <Handle type="source" position={Position.Bottom} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg }} />
      <Handle type="target" position={Position.Left} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg }} />
      <Handle type="source" position={Position.Right} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg }} />
      <div
        className="text-sm text-center whitespace-pre-wrap"
        style={{
          fontWeight,
          fontStyle,
          textDecoration,
        }}
      >
        {data.label}
      </div>
    </div>
  )
}

// Nó Decisão (Diamante)
const DecisionNode = ({ data, selected }: NodeProps) => {
  const color = COLOR_PALETTE.find(c => c.id === data.colorId) || COLOR_PALETTE[0]
  const fontWeight = data.bold ? 'bold' : 'semibold'
  const fontStyle = data.italic ? 'italic' : 'normal'
  const textDecoration = data.underline ? 'underline' : 'none'

  return (
    <div className="relative" style={{ width: '150px', height: '150px' }}>
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all shadow-lg ${
          selected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
        }`}
        style={{
          transform: 'rotate(45deg)',
          backgroundColor: color.bg,
          borderColor: color.bg,
          filter: selected ? 'brightness(1.1)' : 'none',
        }}
      >
        <div
          className="text-sm text-center px-4 whitespace-pre-wrap"
          style={{
            transform: 'rotate(-45deg)',
            color: color.text,
            maxWidth: '100px',
            fontWeight,
            fontStyle,
            textDecoration,
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, top: '0' }} />
      <Handle type="source" position={Position.Bottom} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, bottom: '0' }} />
      <Handle type="target" position={Position.Left} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, left: '0' }} />
      <Handle type="source" position={Position.Right} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, right: '0' }} />
    </div>
  )
}

// Nó Documento
const DocumentNode = ({ data, selected }: NodeProps) => {
  const color = COLOR_PALETTE.find(c => c.id === data.colorId) || COLOR_PALETTE[0]
  const fontWeight = data.bold ? 'bold' : 'semibold'
  const fontStyle = data.italic ? 'italic' : 'normal'
  const textDecoration = data.underline ? 'underline' : 'none'

  return (
    <div className="relative" style={{ width: '140px', paddingTop: '10px' }}>
      <svg viewBox="0 0 140 120" className="w-full h-auto">
        <path
          d="M 10 0 L 130 0 L 130 90 Q 105 110, 70 90 Q 35 110, 10 90 Z"
          fill={color.bg}
          stroke={color.bg}
          strokeWidth="2"
          className={`transition-all shadow-lg ${selected ? 'drop-shadow-xl' : ''}`}
          style={{ filter: selected ? 'brightness(1.1)' : 'none' }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-sm px-4 whitespace-pre-wrap"
        style={{
          color: color.text,
          top: '10px',
          fontWeight,
          fontStyle,
          textDecoration,
        }}
      >
        {data.label}
      </div>
      <Handle type="target" position={Position.Top} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, top: '10px' }} />
      <Handle type="source" position={Position.Bottom} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, bottom: '10px' }} />
      <Handle type="target" position={Position.Left} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, left: '10px', top: '50%' }} />
      <Handle type="source" position={Position.Right} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, right: '10px', top: '50%' }} />
    </div>
  )
}

// Nó Dados (Paralelogramo)
const DataNode = ({ data, selected }: NodeProps) => {
  const color = COLOR_PALETTE.find(c => c.id === data.colorId) || COLOR_PALETTE[0]
  const fontWeight = data.bold ? 'bold' : 'semibold'
  const fontStyle = data.italic ? 'italic' : 'normal'
  const textDecoration = data.underline ? 'underline' : 'none'

  return (
    <div className="relative" style={{ width: '160px', height: '80px' }}>
      <svg viewBox="0 0 160 80" className="w-full h-full">
        <path
          d="M 20 0 L 160 0 L 140 80 L 0 80 Z"
          fill={color.bg}
          stroke={color.bg}
          strokeWidth="2"
          className={`transition-all shadow-lg ${selected ? 'drop-shadow-xl' : ''}`}
          style={{ filter: selected ? 'brightness(1.1)' : 'none' }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-sm px-6 whitespace-pre-wrap"
        style={{
          color: color.text,
          fontWeight,
          fontStyle,
          textDecoration,
        }}
      >
        {data.label}
      </div>
      <Handle type="target" position={Position.Top} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, top: '0', left: '50%' }} />
      <Handle type="source" position={Position.Bottom} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, bottom: '0', left: '50%' }} />
      <Handle type="target" position={Position.Left} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, left: '10px', top: '50%' }} />
      <Handle type="source" position={Position.Right} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, right: '10px', top: '50%' }} />
    </div>
  )
}

// Nó Banco de Dados (Cilindro)
const DatabaseNode = ({ data, selected }: NodeProps) => {
  const color = COLOR_PALETTE.find(c => c.id === data.colorId) || COLOR_PALETTE[0]
  const fontWeight = data.bold ? 'bold' : 'semibold'
  const fontStyle = data.italic ? 'italic' : 'normal'
  const textDecoration = data.underline ? 'underline' : 'none'

  return (
    <div className="relative" style={{ width: '120px', height: '140px' }}>
      <svg viewBox="0 0 120 140" className="w-full h-full">
        <ellipse cx="60" cy="20" rx="50" ry="15" fill={color.bg} stroke={color.bg} strokeWidth="2" />
        <rect x="10" y="20" width="100" height="100" fill={color.bg} />
        <ellipse cx="60" cy="120" rx="50" ry="15" fill={color.bg} stroke={color.bg} strokeWidth="2" />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-sm px-4 whitespace-pre-wrap"
        style={{
          color: color.text,
          fontWeight,
          fontStyle,
          textDecoration,
        }}
      >
        {data.label}
      </div>
      <Handle type="target" position={Position.Top} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, top: '0' }} />
      <Handle type="source" position={Position.Bottom} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, bottom: '0' }} />
      <Handle type="target" position={Position.Left} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, left: '10px', top: '50%' }} />
      <Handle type="source" position={Position.Right} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, right: '10px', top: '50%' }} />
    </div>
  )
}

// Nó Usuário (Boneco)
const UserNode = ({ data, selected }: NodeProps) => {
  const color = COLOR_PALETTE.find(c => c.id === data.colorId) || COLOR_PALETTE[0]
  const fontWeight = data.bold ? 'bold' : 'semibold'
  const fontStyle = data.italic ? 'italic' : 'normal'
  const textDecoration = data.underline ? 'underline' : 'none'

  return (
    <div className="relative" style={{ width: '120px', height: '140px' }}>
      <svg viewBox="0 0 120 140" className="w-full h-full">
        {/* Cabeça */}
        <circle cx="60" cy="30" r="20" fill={color.bg} stroke={color.bg} strokeWidth="2" />
        {/* Corpo */}
        <path
          d="M 60 50 L 60 90 M 35 65 L 85 65 M 60 90 L 40 120 M 60 90 L 80 120"
          stroke={color.bg}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <div
        className="absolute bottom-0 left-0 right-0 text-xs text-center px-2 whitespace-pre-wrap"
        style={{
          color: color.text,
          fontWeight,
          fontStyle,
          textDecoration,
          backgroundColor: color.bg,
          padding: '2px 4px',
          borderRadius: '4px',
        }}
      >
        {data.label}
      </div>
      <Handle type="target" position={Position.Top} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, top: '0' }} />
      <Handle type="source" position={Position.Bottom} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, bottom: '0' }} />
      <Handle type="target" position={Position.Left} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, left: '10px', top: '50%' }} />
      <Handle type="source" position={Position.Right} className="w-5 h-5 !bg-white border-2" style={{ borderColor: color.bg, right: '10px', top: '50%' }} />
    </div>
  )
}

// Memoized node and edge types to prevent unnecessary re-renders
const nodeTypes: NodeTypes = {
  process: ProcessNode,
  terminal: TerminalNode,
  decision: DecisionNode,
  document: DocumentNode,
  data: DataNode,
  database: DatabaseNode,
  user: UserNode,
}

const edgeTypes = {
  custom: CustomEdge,
}

type FlowchartTemplateData = {
  nodes: Node[]
  edges: Edge[]
}

const DEFAULT_DATA: FlowchartTemplateData = {
  nodes: [],
  edges: [],
}

type NodeType = 'process' | 'terminal' | 'decision' | 'document' | 'data' | 'database' | 'user'

const NODE_TYPES = [
  { id: 'process' as NodeType, name: 'Processo', icon: Square, description: 'Ação ou operação' },
  { id: 'terminal' as NodeType, name: 'Início/Fim', icon: Circle, description: 'Ponto inicial ou final' },
  { id: 'decision' as NodeType, name: 'Decisão', icon: Diamond, description: 'Ponto de escolha' },
  { id: 'document' as NodeType, name: 'Documento', icon: FileText, description: 'Documento ou relatório' },
  { id: 'data' as NodeType, name: 'Dados', icon: Hexagon, description: 'Entrada/Saída de dados' },
  { id: 'database' as NodeType, name: 'Banco de Dados', icon: Cylinder, description: 'Armazenamento de dados' },
  { id: 'user' as NodeType, name: 'Usuário', icon: User, description: 'Ator ou usuário do sistema' },
]

function FlowchartTemplateInner({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<FlowchartTemplateData>(groupId, pageId, DEFAULT_DATA)
  const persistedNodes = data.nodes ?? DEFAULT_DATA.nodes
  const persistedEdges = data.edges ?? DEFAULT_DATA.edges

  const storageKey = useMemo(() => `flowchart-template-${groupId}-${pageId}`, [groupId, pageId])

  // Initialize data only once using useMemo
  const initialData = useMemo(() => {
    let initialNodes = cloneNodes(persistedNodes)
    let initialEdges = cloneEdges(persistedEdges)

    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(storageKey)
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<FlowchartTemplateData>
          if (parsed && Array.isArray(parsed.nodes)) {
            initialNodes = cloneNodes(parsed.nodes as Node[])
          }
          if (parsed && Array.isArray(parsed.edges)) {
            initialEdges = cloneEdges(parsed.edges as Edge[])
          }
        }
      } catch {
        // ignore invalid stored data
      }
    }

    return {
      nodes: initialNodes,
      edges: initialEdges,
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  const initialNodes = initialData.nodes
  const initialEdges = initialData.edges

  const [nodes, setNodesState, onNodesChangeState] = useNodesState(initialNodes)
  const [edges, setEdgesState, onEdgesChangeState] = useEdgesState(initialEdges)
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType>('process')
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)
  const skipNodesSyncRef = useRef(false)
  const skipEdgesSyncRef = useRef(false)
  const pendingSyncRef = useRef<FlowchartTemplateData | null>(null)
  const isHydratingRef = useRef(true)

  const nodesSignatureRef = useRef<string>(JSON.stringify(initialNodes))
  const edgesSignatureRef = useRef<string>(JSON.stringify(initialEdges))

  useEffect(() => {
    nodesSignatureRef.current = JSON.stringify(nodes)
  }, [nodes])

  useEffect(() => {
    edgesSignatureRef.current = JSON.stringify(edges)
  }, [edges])

  useEffect(() => {
    const payload: FlowchartTemplateData = {
      nodes,
      edges,
    }

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(payload))
      } catch {
        // ignore storage quota errors
      }
    }

    if (isHydratingRef.current) {
      isHydratingRef.current = false
      pendingSyncRef.current = null
      return
    }

    pendingSyncRef.current = payload
  }, [nodes, edges, storageKey])

  useEffect(() => {
    const persistedSignature = JSON.stringify(persistedNodes)
    if (skipNodesSyncRef.current) {
      skipNodesSyncRef.current = false
      nodesSignatureRef.current = persistedSignature
      return
    }
    if (persistedSignature === nodesSignatureRef.current) return
    isHydratingRef.current = true
    nodesSignatureRef.current = persistedSignature
    setNodesState(cloneNodes(persistedNodes))
  }, [persistedNodes, setNodesState])

  useEffect(() => {
    const persistedSignature = JSON.stringify(persistedEdges)
    if (skipEdgesSyncRef.current) {
      skipEdgesSyncRef.current = false
      edgesSignatureRef.current = persistedSignature
      return
    }
    if (persistedSignature === edgesSignatureRef.current) return
    isHydratingRef.current = true
    edgesSignatureRef.current = persistedSignature
    setEdgesState(cloneEdges(persistedEdges))
  }, [persistedEdges, setEdgesState])

  const activeNode = useMemo(
    () => nodes.find((node) => node.id === activeNodeId) ?? null,
    [nodes, activeNodeId],
  )

  useEffect(() => {
    if (activeNode) {
      setEditLabel(activeNode.data?.label ?? '')
    } else {
      setEditLabel('')
    }
  }, [activeNode])

  const setNodes = useCallback(
    (updater: Node[] | ((nodes: Node[]) => Node[])) => {
      skipNodesSyncRef.current = true
      setNodesState(updater)
    },
    [setNodesState],
  )

  const setEdges = useCallback(
    (updater: Edge[] | ((edges: Edge[]) => Edge[])) => {
      skipEdgesSyncRef.current = true
      setEdgesState(updater)
    },
    [setEdgesState],
  )

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChangeState>[0]) => {
      skipNodesSyncRef.current = true
      onNodesChangeState(changes)
    },
    [onNodesChangeState],
  )

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChangeState>[0]) => {
      skipEdgesSyncRef.current = true
      onEdgesChangeState(changes)
    },
    [onEdgesChangeState],
  )

  const flushPending = useCallback(() => {
    const payload = pendingSyncRef.current
    if (!payload) return

    pendingSyncRef.current = null
    skipNodesSyncRef.current = true
    skipEdgesSyncRef.current = true
    nodesSignatureRef.current = JSON.stringify(payload.nodes)
    edgesSignatureRef.current = JSON.stringify(payload.edges)

    setData(
      () => ({
        nodes: payload.nodes,
        edges: payload.edges,
      }),
      { immediate: true },
    )
  }, [setData])

  useEffect(() => {
    const intervalId = window.setInterval(flushPending, 3000)
    return () => {
      window.clearInterval(intervalId)
      flushPending()
    }
  }, [flushPending])

  useEffect(() => {
    const handleBeforeUnload = () => {
      flushPending()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [flushPending])

  // Conectar nós em todos os handles
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const sourceNode = nodes.find(n => n.id === params.source)
      let label = ''

      if (sourceNode?.type === 'decision') {
        // Auto-label decision edges: check existing edges from this decision node
        const existingDecisionEdges = edges.filter(e => e.source === params.source)

        if (existingDecisionEdges.length === 0) {
          label = 'Sim'
        } else if (existingDecisionEdges.length === 1) {
          label = 'Não'
        } else {
          // For 3rd+ edge, use empty label or could cycle/number them
          label = ''
        }
      }

      setEdges((eds) => {
        const newEdges = addEdge(
          {
            ...params,
            type: 'custom',
            animated: true,
            style: { stroke: '#64748b', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#64748b',
            },
            data: { label },
          },
          eds
        )
        return newEdges
      })
    },
    [setEdges, nodes, edges]
  )

  // Duplo clique no canvas para criar nó
  const handlePaneDoubleClick = useCallback(
    (event: ReactMouseEvent) => {
      // Prevenir propagação para evitar conflitos
      event.preventDefault()
      event.stopPropagation()

      console.log('🖱️ Double-click detectado!', { selectedNodeType, event })

      if (!reactFlowInstance.current) {
        console.log('❌ reactFlowInstance não existe')
        return
      }

      // Verificar se clicou em um elemento do ReactFlow (nó, edge, etc)
      const target = event.target as HTMLElement
      if (target.closest('.react-flow__node') || target.closest('.react-flow__edge')) {
        console.log('⚠️ Clicou em um nó ou edge, ignorando')
        return
      }

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      console.log('📍 Posição calculada:', position)

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: selectedNodeType,
        position,
        data: {
          label: 'Novo',
          colorId: 'blue',
        },
      }

      console.log('➕ Criando novo nó:', newNode)

      setNodes((nds) => [...nds, newNode])
      setActiveNodeId(newNode.id)
      setEditLabel('Novo')

      setTimeout(() => {
        const input = document.querySelector('#edit-label-input') as HTMLInputElement
        if (input) {
          input.focus()
          input.select()
        }
      }, 100)
    },
    [selectedNodeType, setNodes]
  )

  // Drag and Drop handlers
  const [draggedNodeType, setDraggedNodeType] = useState<NodeType | null>(null)

  const handleDragStart = useCallback((event: React.DragEvent, nodeType: NodeType) => {
    setDraggedNodeType(nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowInstance.current || !draggedNodeType) {
        return
      }

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: draggedNodeType,
        position,
        data: {
          label: 'Novo',
          colorId: 'blue',
        },
      }

      setNodes((nds) => [...nds, newNode])
      setActiveNodeId(newNode.id)
      setEditLabel('Novo')
      setDraggedNodeType(null)

      setTimeout(() => {
        const input = document.querySelector('#edit-label-input') as HTMLInputElement
        if (input) {
          input.focus()
          input.select()
        }
      }, 100)
    },
    [draggedNodeType, setNodes]
  )

  // Select node type from sidebar (doesn't create node, just changes selected type)
  const selectNodeTypeFromSidebar = (nodeType: NodeType) => {
    setSelectedNodeType(nodeType)
  }

  const removeNodesByIds = useCallback(
    (ids: string[]) => {
      if (!ids.length) return
      const idSet = new Set(ids)
      setNodes((nds) => nds.filter((node) => !idSet.has(node.id)))
      setEdges((eds) => eds.filter((edge) => !idSet.has(edge.source) && !idSet.has(edge.target)))
    },
    [setNodes, setEdges],
  )

  const deleteSelected = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected)
    const selectedEdges = edges.filter((e) => e.selected)

    if (!selectedNodes.length && !selectedEdges.length) return

    if (selectedNodes.length) {
      const selectedNodeIds = selectedNodes.map((node) => node.id)
      removeNodesByIds(selectedNodeIds)
      if (activeNodeId && selectedNodeIds.includes(activeNodeId)) {
        setActiveNodeId(null)
      }
    }

    if (selectedEdges.length) {
      setEdges((eds) => eds.filter((edge) => !edge.selected))
    }
  }, [nodes, edges, removeNodesByIds, activeNodeId, setEdges])

  const clearAll = () => {
    if (confirm('Limpar todo o fluxograma?')) {
      setNodes([])
      setEdges([])
      setActiveNodeId(null)
    }
  }

  const updateActiveNodeData = useCallback(
    (updater: (data: Record<string, any>) => Record<string, any>) => {
      if (!activeNodeId) return
      setNodes((nds) =>
        nds.map((node) =>
          node.id === activeNodeId
            ? { ...node, data: updater({ ...(node.data ?? {}) }) }
            : node
        )
      )
    },
    [activeNodeId, setNodes],
  )

  const handleEditLabelChange = (value: string) => {
    setEditLabel(value)
    updateActiveNodeData((data) => ({ ...data, label: value }))
  }

  const handleEditColorChange = (colorId: string) => {
    updateActiveNodeData((data) => ({ ...data, colorId }))
  }

  const toggleBold = () => {
    updateActiveNodeData((data) => ({ ...data, bold: !data.bold }))
  }

  const toggleItalic = () => {
    updateActiveNodeData((data) => ({ ...data, italic: !data.italic }))
  }

  const toggleUnderline = () => {
    updateActiveNodeData((data) => ({ ...data, underline: !data.underline }))
  }

  const setTextAlign = (align: 'left' | 'center' | 'right') => {
    updateActiveNodeData((data) => ({ ...data, textAlign: align }))
  }

  const deleteActiveNode = useCallback(() => {
    if (!activeNodeId) return
    removeNodesByIds([activeNodeId])
    setActiveNodeId(null)
  }, [activeNodeId, removeNodesByIds])

  const handleFlowInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance
  }, [])

  const handleNodeClick = useCallback((_: ReactMouseEvent, node: Node) => {
    setActiveNodeId(node.id)
  }, [])

  const handlePaneClick = useCallback(() => {
    setActiveNodeId(null)
  }, [])

  const handleEdgeClick = useCallback(
    (_: ReactMouseEvent, edge: Edge) => {
      const sourceNode = nodes.find(n => n.id === edge.source)
      if (sourceNode?.type === 'decision') {
        const newLabel = window.prompt('Editar label da conexão:', edge.data?.label || '')
        if (newLabel !== null) {
          setEdges((eds) =>
            eds.map((e) =>
              e.id === edge.id ? { ...e, data: { ...e.data, label: newLabel } } : e
            )
          )
        }
      }
    },
    [nodes, setEdges]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return

      const target = event.target as HTMLElement | null
      if (target) {
        const tagName = target.tagName.toLowerCase()
        if (tagName === 'input' || tagName === 'textarea' || target.isContentEditable) {
          return
        }
      }

      if (activeNodeId) {
        event.preventDefault()
        removeNodesByIds([activeNodeId])
        setActiveNodeId(null)
        return
      }

      const hasSelectedNodes = nodes.some((node) => node.selected)
      const hasSelectedEdges = edges.some((edge) => edge.selected)
      if (hasSelectedNodes || hasSelectedEdges) {
        event.preventDefault()
        deleteSelected()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeNodeId, nodes, edges, deleteSelected, removeNodesByIds])

  return (
    <div className="h-full w-full flex bg-gradient-to-br from-gray-50 to-white dark:from-slate-950 dark:to-slate-900">
      <style jsx global>{`
        .react-flow__pane {
          cursor: default !important;
        }
        .react-flow__pane:active {
          cursor: grabbing !important;
        }
        .react-flow .react-flow__node {
          cursor: pointer !important;
        }
        .react-flow .react-flow__edge {
          cursor: pointer !important;
        }
        .react-flow__handle {
          cursor: crosshair !important;
        }
      `}</style>
      {/* Sidebar - Apenas Elementos */}
      <div
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-72'
        } flex-none bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 shadow-lg transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          {!sidebarCollapsed && (
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Elementos</h3>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={sidebarCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
              />
            </svg>
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Tipos de Nó */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-wider">
                Tipos de Nó
              </h4>
              <div className="space-y-2">
                {NODE_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <div
                      key={type.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, type.id)}
                      onClick={() => selectNodeTypeFromSidebar(type.id)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md cursor-move ${
                        selectedNodeType === type.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                          : 'border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {type.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{type.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Ações */}
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-2">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-wider">
                Ações
              </h4>
              <button
                onClick={clearAll}
                className="w-full px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center gap-2 justify-center"
              >
                <Trash2 className="w-4 h-4" />
                Limpar Tudo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div
        className="flex-1 relative"
        ref={reactFlowWrapper}
        onDoubleClick={handlePaneDoubleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ cursor: 'default' }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          onInit={handleFlowInit}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          minZoom={0.2}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          deleteKeyCode={null}
          className="cursor-default"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={2}
            color="#94a3b8"
            className="dark:opacity-30"
          />
          <Controls className="!bg-white dark:!bg-slate-800 !border !border-gray-200 dark:!border-slate-700 !rounded-lg !shadow-lg" />
        </ReactFlow>

        {/* Painel de edição do elemento ativo */}
        {activeNode && (
          <div className="absolute right-4 top-4 w-80 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-4 space-y-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Configurar Elemento
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {NODE_TYPES.find(t => t.id === activeNode.type)?.name}
                </p>
              </div>
              <button
                onClick={() => setActiveNodeId(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Texto */}
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-2">
                Texto
              </label>
              <textarea
                id="edit-label-input"
                value={editLabel}
                onChange={(e) => handleEditLabelChange(e.target.value)}
                placeholder="Digite o texto..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Formatação de texto (apenas para processo) */}
            {activeNode.type === 'process' && (
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-2">
                  Formatação
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={toggleBold}
                    className={`flex-1 p-2 rounded-lg border transition ${
                      activeNode.data?.bold
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400'
                        : 'border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bold className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={toggleItalic}
                    className={`flex-1 p-2 rounded-lg border transition ${
                      activeNode.data?.italic
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400'
                        : 'border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Italic className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={toggleUnderline}
                    className={`flex-1 p-2 rounded-lg border transition ${
                      activeNode.data?.underline
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400'
                        : 'border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Underline className="w-4 h-4 mx-auto" />
                  </button>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setTextAlign('left')}
                    className={`flex-1 p-2 rounded-lg border transition ${
                      activeNode.data?.textAlign === 'left'
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400'
                        : 'border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <AlignLeft className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setTextAlign('center')}
                    className={`flex-1 p-2 rounded-lg border transition ${
                      !activeNode.data?.textAlign || activeNode.data?.textAlign === 'center'
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400'
                        : 'border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <AlignCenter className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setTextAlign('right')}
                    className={`flex-1 p-2 rounded-lg border transition ${
                      activeNode.data?.textAlign === 'right'
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400'
                        : 'border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <AlignRight className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            )}

            {/* Cor */}
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-2">Cor</label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleEditColorChange(color.id)}
                    className={`w-full aspect-square rounded-lg transition-all shadow-md ${
                      activeNode.data?.colorId === color.id
                        ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.bg }}
                  />
                ))}
              </div>
            </div>

            {/* Deletar */}
            <button
              onClick={deleteActiveNode}
              className="w-full px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Remover Elemento
            </button>
          </div>
        )}

        {/* Dica inicial */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-slate-700 p-8 max-w-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Square className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Crie seu fluxograma
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                📌 Arraste elementos da sidebar para o canvas
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                🖱️ Ou selecione e dê duplo clique para adicionar
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                🔗 Arraste das bolinhas para conectar elementos
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FlowchartTemplate(props: WorkspaceTemplateComponentProps) {
  return (
    <ReactFlowProvider>
      <FlowchartTemplateInner {...props} />
    </ReactFlowProvider>
  )
}
