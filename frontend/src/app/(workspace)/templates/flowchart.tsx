'use client'

import { useCallback, useState, useEffect } from 'react'
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
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Trash2, Palette, Link as LinkIcon, Minus, ZoomIn, ZoomOut } from 'lucide-react'

// Cores disponíveis
const nodeColorOptions = [
  { id: 'blue', name: 'Azul', bg: '#3b82f6', border: '#2563eb' },
  { id: 'green', name: 'Verde', bg: '#22c55e', border: '#16a34a' },
  { id: 'red', name: 'Vermelho', bg: '#ef4444', border: '#dc2626' },
  { id: 'yellow', name: 'Amarelo', bg: '#eab308', border: '#ca8a04' },
  { id: 'purple', name: 'Roxo', bg: '#a855f7', border: '#9333ea' },
  { id: 'orange', name: 'Laranja', bg: '#f97316', border: '#ea580c' },
  { id: 'pink', name: 'Rosa', bg: '#ec4899', border: '#db2777' },
  { id: 'cyan', name: 'Ciano', bg: '#06b6d4', border: '#0891b2' },
  { id: 'gray', name: 'Cinza', bg: '#6b7280', border: '#4b5563' },
]

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
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-white !border-2 !border-gray-400 dark:!border-gray-600"
        style={{ borderColor: color.border }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-white !border-2 !border-gray-400 dark:!border-gray-600"
        style={{ borderColor: color.border }}
      />
      <Handle
        type="source"
        position={Position.Left}
        className="!w-3 !h-3 !bg-white !border-2 !border-gray-400 dark:!border-gray-600"
        style={{ borderColor: color.border }}
      />
      <Handle
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

type FlowchartTemplateProps = {
  data: any
  onDataChange: (data: any) => void
}

export default function FlowchartTemplate({ data, onDataChange }: FlowchartTemplateProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(data?.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(data?.edges || [])
  const [nodeName, setNodeName] = useState('')
  const [selectedType, setSelectedType] = useState<'default' | 'start' | 'end' | 'decision'>('default')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [edgeColor, setEdgeColor] = useState('#64748b')
  const [connectionMode, setConnectionMode] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Sincronizar com parent
  useEffect(() => {
    const timer = setTimeout(() => {
      onDataChange({ nodes, edges })
    }, 300)
    return () => clearTimeout(timer)
  }, [nodes, edges, onDataChange])

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
    if (!nodeName.trim()) return

    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'custom',
      position: {
        x: Math.random() * 300 + 150,
        y: Math.random() * 200 + 100,
      },
      data: {
        label: nodeName,
        type: selectedType,
        color: selectedColor,
      },
    }

    setNodes((nds) => [...nds, newNode])
    setNodeName('')
  }

  // Deletar selecionados
  const deleteSelected = () => {
    const selectedNodes = nodes.filter(n => n.selected)
    const selectedEdges = edges.filter(e => e.selected)

    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      return
    }

    setNodes((nds) => nds.filter((node) => !node.selected))
    setEdges((eds) => eds.filter((edge) => !edge.selected))
  }

  // Limpar tudo
  const clearAll = () => {
    if (confirm('Limpar todo o fluxograma?')) {
      setNodes([])
      setEdges([])
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

  const nodeTypeOptions = [
    { id: 'default', name: 'Processo', icon: '□' },
    { id: 'start', name: 'Início', icon: '▶' },
    { id: 'end', name: 'Fim', icon: '⏹' },
    { id: 'decision', name: 'Decisão', icon: '?' },
  ]

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
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
