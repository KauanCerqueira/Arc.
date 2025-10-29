'use client'

import { useCallback, useState, useEffect, useMemo, useRef, MouseEvent as ReactMouseEvent } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
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
  OnSelectionChangeParams,
  ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Trash2, Palette, Link as LinkIcon, X } from 'lucide-react'
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData'
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types'

// Cores disponíveis
const nodeColorOptions = [
  { id: 'blue', name: 'Azul', bg: '#3b82f6', border: '#2563eb' },
  { id: 'green', name: 'Verde', bg: '#22c55e', border: '#15803d' },
  { id: 'emerald', name: 'Esmeralda', bg: '#10b981', border: '#047857' },
  { id: 'red', name: 'Vermelho', bg: '#ef4444', border: '#dc2626' },
  { id: 'rose', name: 'Magenta', bg: '#f43f5e', border: '#e11d48' },
  { id: 'yellow', name: 'Amarelo', bg: '#eab308', border: '#ca8a04' },
  { id: 'orange', name: 'Laranja', bg: '#f97316', border: '#ea580c' },
  { id: 'purple', name: 'Roxo', bg: '#a855f7', border: '#7e22ce' },
  { id: 'indigo', name: 'Índigo', bg: '#6366f1', border: '#4f46e5' },
  { id: 'pink', name: 'Rosa', bg: '#ec4899', border: '#db2777' },
  { id: 'cyan', name: 'Ciano', bg: '#06b6d4', border: '#0891b2' },
  { id: 'teal', name: 'Turquesa', bg: '#14b8a6', border: '#0f766e' },
  { id: 'gray', name: 'Cinza', bg: '#6b7280', border: '#4b5563' },
  { id: 'slate', name: 'Ardósia', bg: '#475569', border: '#334155' },
]

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

// Nó customizado com botões de conexão
const CustomNode = ({ data, id, selected }: NodeProps) => {
  const color = nodeColorOptions.find(c => c.id === data.color) || nodeColorOptions[0]

  return (
    <div
      className={`relative group ${selected ? 'ring-4 ring-blue-400 dark:ring-blue-600 rounded-lg' : ''}`}
      style={{ minWidth: '140px' }}
    >
      {/* Handles - mais visíveis */}
      <Handle
        id={`${id}-target-top`}
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-white !border-2 !border-gray-400 dark:!border-gray-600"
        style={{ borderColor: color.border }}
      />
      <Handle
        id={`${id}-source-top`}
        type="source"
        position={Position.Top}
        className="!w-3 !h-3 !bg-white !border-2 !border-gray-400 dark:!border-gray-600"
        style={{ borderColor: color.border }}
      />
      <Handle
        id={`${id}-target-bottom`}
        type="target"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-white !border-2 !border-gray-400 dark:!border-gray-600"
        style={{ borderColor: color.border }}
      />
      <Handle
        id={`${id}-source-bottom`}
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-white !border-2 !border-gray-400 dark:!border-gray-600"
        style={{ borderColor: color.border }}
      />
      <Handle
        id={`${id}-target-left`}
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-white !border-2 !border-gray-400 dark:!border-gray-600"
        style={{ borderColor: color.border }}
      />
      <Handle
        id={`${id}-source-left`}
        type="source"
        position={Position.Left}
        className="!w-3 !h-3 !bg-white !border-2 !border-gray-400 dark:!border-gray-600"
        style={{ borderColor: color.border }}
      />
      <Handle
        id={`${id}-target-right`}
        type="target"
        position={Position.Right}
        className="!w-3 !h-3 !bg-white !border-2 !border-gray-400 dark:!border-gray-600"
        style={{ borderColor: color.border }}
      />
      <Handle
        id={`${id}-source-right`}
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-white !border-2 !border-gray-400 dark:!border-gray-600"
        style={{ borderColor: color.border }}
      />

      {/* Conteúdo do nó */}
      <div
        style={{
          padding: '14px 24px',
          borderRadius: '10px',
          background: color.bg,
          border: `3px solid ${color.border}`,
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '14px',
          textAlign: 'center',
          boxShadow: selected
            ? '0 8px 24px rgba(0, 0, 0, 0.25)'
            : '0 4px 12px rgba(0, 0, 0, 0.15)',
          cursor: 'grab',
          minWidth: '140px',
          maxWidth: '220px',
          wordWrap: 'break-word',
        }}
        className="transition-shadow duration-200"
      >
        {data.label}
      </div>

      {/* Indicador de tipo */}
      {data.type && data.type !== 'default' && (
        <div
          className="absolute -top-2 -right-2 text-xs px-2 py-0.5 rounded-full font-semibold text-white"
          style={{ background: color.border }}
        >
          {data.type === 'start' ? '▶' : data.type === 'end' ? '⏹' : data.type === 'decision' ? '?' : ''}
        </div>
      )}
    </div>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

type FlowchartTemplateData = {
  nodes: Node[]
  edges: Edge[]
}

const DEFAULT_DATA: FlowchartTemplateData = {
  nodes: [],
  edges: [],
}

export default function FlowchartTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<FlowchartTemplateData>(groupId, pageId, DEFAULT_DATA)
  const persistedNodes = data.nodes ?? DEFAULT_DATA.nodes
  const persistedEdges = data.edges ?? DEFAULT_DATA.edges

  const storageKey = useMemo(() => `flowchart-template-${groupId}-${pageId}`, [groupId, pageId])

  const initialDataRef = useRef<{ key: string; data: FlowchartTemplateData } | null>(null)
  if (!initialDataRef.current || initialDataRef.current.key !== storageKey) {
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

    initialDataRef.current = {
      key: storageKey,
      data: {
        nodes: initialNodes,
        edges: initialEdges,
      },
    }
  }

  const initialNodes = initialDataRef.current.data.nodes
  const initialEdges = initialDataRef.current.data.edges

  const [nodes, setNodesState, onNodesChangeState] = useNodesState(initialNodes)
  const [edges, setEdgesState, onEdgesChangeState] = useEdgesState(initialEdges)
  const [nodeName, setNodeName] = useState('')
  const [selectedType, setSelectedType] = useState<'default' | 'start' | 'end' | 'decision'>('default')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [edgeColor, setEdgeColor] = useState('#64748b')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editType, setEditType] = useState<'default' | 'start' | 'end' | 'decision'>('default')
  const [editColor, setEditColor] = useState('blue')

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
      setEditType(activeNode.data?.type ?? 'default')
      setEditColor(activeNode.data?.color ?? 'blue')
    } else {
      setEditLabel('')
    }
  }, [activeNode])

  useEffect(() => {
    if (activeNodeId && !nodes.some((node) => node.id === activeNodeId)) {
      setActiveNodeId(null)
    }
  }, [nodes, activeNodeId])

  const setNodes = useCallback(
    (
      updater:
        | Node[]
        | ((nodes: Node[]) => Node[]),
    ) => {
      skipNodesSyncRef.current = true
      setNodesState(updater)
    },
    [setNodesState],
  )

  const setEdges = useCallback(
    (
      updater:
        | Edge[]
        | ((edges: Edge[]) => Edge[]),
    ) => {
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

  // Conectar nós
  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => {
        const newEdges = addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: edgeColor, strokeWidth: 2.5 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: edgeColor,
            },
          },
          eds
        )
        return newEdges
      }),
    [setEdges, edgeColor]
  )

  // Adicionar nó
  const addNode = () => {
    const trimmedName = nodeName.trim()
    if (!trimmedName) return

    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'custom',
      position: {
        x: Math.random() * 300 + 150,
        y: Math.random() * 200 + 100,
      },
      data: {
        label: trimmedName,
        type: selectedType,
        color: selectedColor,
      },
    }

    setNodes((nds) => [...nds, newNode])
    setNodeName('')
    setActiveNodeId(newNode.id)
    setEditLabel(trimmedName)
    setEditType(selectedType)
    setEditColor(selectedColor)
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

    if (!selectedNodes.length && !selectedEdges.length) {
      return
    }

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

  // Limpar tudo
  const clearAll = () => {
    if (confirm('Limpar todo o fluxograma?')) {
      setNodes([])
      setEdges([])
      setActiveNodeId(null)
    }
  }

  // Alterar cor dos nós selecionados
  const changeSelectedNodesColor = (colorId: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.selected
          ? { ...node, data: { ...node.data, color: colorId } }
          : node
      )
    )
    setShowColorPicker(false)
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

  const handleEditTypeChange = (value: 'default' | 'start' | 'end' | 'decision') => {
    setEditType(value)
    setSelectedType(value)
    updateActiveNodeData((data) => ({ ...data, type: value }))
  }

  const handleEditColorChange = (colorId: string) => {
    setEditColor(colorId)
    setSelectedColor(colorId)
    updateActiveNodeData((data) => ({ ...data, color: colorId }))
  }

  const deleteActiveNode = useCallback(() => {
    if (!activeNodeId) return
    removeNodesByIds([activeNodeId])
    setActiveNodeId(null)
  }, [activeNodeId, removeNodesByIds])

  const handlePaneDoubleClick = useCallback(
    (event: ReactMouseEvent) => {
      event.preventDefault()
      const bounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!bounds) return

      const rawPosition = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      }

      const position = reactFlowInstance.current
        ? reactFlowInstance.current.project(rawPosition)
        : rawPosition

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: 'Novo bloco',
          type: selectedType,
          color: selectedColor,
        },
      }

      setNodes((nds) => [...nds, newNode])
      setActiveNodeId(newNode.id)
      setEditLabel('Novo bloco')
      setEditType(selectedType)
      setEditColor(selectedColor)
    },
    [selectedType, selectedColor, setNodes],
  )

  const handleFlowInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance
  }, [])

  const handleNodeClick = useCallback((_: ReactMouseEvent, node: Node) => {
    setActiveNodeId(node.id)
  }, [])

  const handlePaneClick = useCallback((event: ReactMouseEvent) => {
    const target = event.target as HTMLElement | null
    if (!target || !target.classList.contains('react-flow__pane')) {
      return
    }

    if (event.detail === 2) {
      handlePaneDoubleClick(event)
      return
    }

    setActiveNodeId(null)
    setShowColorPicker(false)
  }, [handlePaneDoubleClick])

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length) {
        setActiveNodeId(selectedNodes[selectedNodes.length - 1].id)
      } else {
        setActiveNodeId(null)
      }
    },
    [],
  )

  const nodeTypeOptions = [
    { id: 'default', name: 'Processo', icon: '□' },
    { id: 'start', name: 'Início', icon: '▶' },
    { id: 'end', name: 'Fim', icon: '⏹' },
    { id: 'decision', name: 'Decisão', icon: '?' },
  ]

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

  const hasSelection = nodes.some(n => n.selected) || edges.some(e => e.selected)

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      {/* Barra de ferramentas */}
      <div className="flex-none bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="p-3 space-y-3">
          {/* Linha 1: Criação de nó */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Tipo:</span>
              {nodeTypeOptions.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedType === type.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="mr-1">{type.icon}</span>
                  {type.name}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-slate-700"></div>

            {/* Seletor de cor */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Cor:</span>
              <div className="flex gap-1">
                {nodeColorOptions.slice(0, 6).map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`w-7 h-7 rounded-lg transition-all ${
                      selectedColor === color.id
                        ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ background: color.bg }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-slate-700"></div>

            {/* Input */}
            <input
              type="text"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addNode()}
              placeholder="Nome do nó..."
              className="flex-1 min-w-[200px] px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
            />

            <button
              onClick={addNode}
              disabled={!nodeName.trim()}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          {/* Linha 2: Ações */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Cor das Conexões:</span>
              <input
                type="color"
                value={edgeColor}
                onChange={(e) => setEdgeColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-2 border-gray-300 dark:border-slate-700"
              />
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-slate-700"></div>

            {/* Botão de colorir selecionados */}
            {hasSelection && (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition flex items-center gap-1.5"
                  >
                    <Palette className="w-4 h-4" />
                    Colorir Selecionados
                  </button>

                  {showColorPicker && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowColorPicker(false)} />
                      <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 z-20">
                        <div className="grid grid-cols-3 gap-2">
                          {nodeColorOptions.map((color) => (
                            <button
                              key={color.id}
                              onClick={() => changeSelectedNodesColor(color.id)}
                              className="w-10 h-10 rounded-lg hover:scale-110 transition-transform"
                              style={{ background: color.bg }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={deleteSelected}
                  className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Deletar Selecionados
                </button>

                <div className="h-6 w-px bg-gray-300 dark:bg-slate-700"></div>
              </>
            )}

            <button
              onClick={clearAll}
              className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition"
            >
              Limpar Tudo
            </button>

            <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
              💡 Dica: Arraste das bolinhas coloridas para conectar nós
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          onSelectionChange={handleSelectionChange}
          onInit={handleFlowInit}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.1}
          maxZoom={4}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900"
        >
          <Background
            color="#94a3b8"
            className="dark:!bg-slate-900"
            gap={20}
            size={1}
          />
          <Controls
            showInteractive={false}
            className="bg-white dark:!bg-slate-800 border dark:!border-slate-700 rounded-lg shadow-lg"
          />
          <MiniMap
            nodeColor={(node) => {
              const colorId = node.data.color || 'blue'
              const color = nodeColorOptions.find(c => c.id === colorId)
              return color?.bg || '#3b82f6'
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
            className="!bg-white dark:!bg-slate-800 !border-2 !border-gray-200 dark:!border-slate-700 !rounded-xl !shadow-lg"
            pannable
            zoomable
          />
        </ReactFlow>

        {activeNode && (
          <div className="absolute right-4 top-4 z-20 w-72 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-4 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Bloco selecionado
                </p>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 break-words">
                  {editLabel || 'Sem título'}
                </h3>
              </div>
              <button
                onClick={() => setActiveNodeId(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition"
                aria-label="Fechar painel de edição"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Título
              </label>
              <input
                type="text"
                value={editLabel}
                onChange={(e) => handleEditLabelChange(e.target.value)}
                placeholder="Descreva o bloco..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Tipo
              </span>
              <div className="flex flex-wrap gap-2">
                {nodeTypeOptions.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleEditTypeChange(type.id as 'default' | 'start' | 'end' | 'decision')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      editType === type.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="mr-1">{type.icon}</span>
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Cor
              </span>
              <div className="grid grid-cols-7 gap-2">
                {nodeColorOptions.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleEditColorChange(color.id)}
                    className={`w-8 h-8 rounded-lg border-2 transition-transform ${
                      editColor === color.id
                        ? 'scale-110 border-gray-900 dark:border-gray-100'
                        : 'border-transparent hover:scale-110'
                    }`}
                    style={{ background: color.bg }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={deleteActiveNode}
              className="w-full px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Remover bloco
            </button>

           
          </div>
        )}

        {/* Dica inicial */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-slate-700 p-8 max-w-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <LinkIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Crie seu primeiro nó
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Escolha um tipo e cor, digite o nome e clique em Adicionar
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Depois arraste das bolinhas coloridas para conectar os nós
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
