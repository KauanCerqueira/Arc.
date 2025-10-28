"use client"

import { useState } from "react"
import { Plus, BookOpen, CheckCircle2, Circle, Clock, Trash2 } from "lucide-react"
import { usePageTemplateData } from "@/core/hooks/usePageTemplateData"
import { WorkspaceTemplateComponentProps } from "@/core/types/workspace.types"

type Topic = {
  id: string
  title: string
  subject: string
  completed: boolean
  timeSpent: number
  notes?: string
}

type StudyTemplateData = {
  topics: Topic[]
}

const DEFAULT_DATA: StudyTemplateData = {
  topics: [
    { id: "1", title: "Estruturas de Dados", subject: "Algoritmos", completed: false, timeSpent: 45 },
    { id: "2", title: "React Hooks", subject: "Frontend", completed: true, timeSpent: 120 },
    { id: "3", title: "Clean Architecture", subject: "Backend", completed: false, timeSpent: 60 },
    { id: "4", title: "SQL Avançado", subject: "Banco de Dados", completed: false, timeSpent: 30 },
  ],
}

export default function StudyTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<StudyTemplateData>(groupId, pageId, DEFAULT_DATA)
  const topics = data.topics ?? DEFAULT_DATA.topics

  const updateTopics = (updater: Topic[] | ((current: Topic[]) => Topic[])) => {
    setData((current) => {
      const currentTopics = current.topics ?? DEFAULT_DATA.topics
      const nextTopics =
        typeof updater === "function"
          ? (updater as (current: Topic[]) => Topic[])(JSON.parse(JSON.stringify(currentTopics)))
          : updater
      return {
        ...current,
        topics: nextTopics,
      }
    })
  }

  const [showAddForm, setShowAddForm] = useState(false)
  const [newTopic, setNewTopic] = useState({ title: "", subject: "", timeSpent: 0 })
  const [filter, setFilter] = useState<string>("all")

  const addTopic = () => {
    if (!newTopic.title.trim() || !newTopic.subject.trim()) return

    updateTopics((current) => [
      ...current,
      {
        id: Date.now().toString(),
        title: newTopic.title,
        subject: newTopic.subject,
        completed: false,
        timeSpent: newTopic.timeSpent,
      },
    ])

    setNewTopic({ title: "", subject: "", timeSpent: 0 })
    setShowAddForm(false)
  }

  const toggleTopic = (id: string) => {
    updateTopics((current) => current.map((topic) => (topic.id === id ? { ...topic, completed: !topic.completed } : topic)))
  }

  const deleteTopic = (id: string) => {
    updateTopics((current) => current.filter((topic) => topic.id !== id))
  }

  const updateTime = (id: string, timeSpent: number) => {
    updateTopics((current) =>
      current.map((topic) => (topic.id === id ? { ...topic, timeSpent: Math.max(0, timeSpent) } : topic)),
    )
  }

  const subjects = ["all", ...Array.from(new Set(topics.map((t) => t.subject)))]
  const filteredTopics = filter === "all" ? topics : topics.filter((t) => t.subject === filter)

  const completedCount = topics.filter((t) => t.completed).length
  const totalTime = topics.reduce((acc, t) => acc + t.timeSpent, 0)
  const hours = Math.floor(totalTime / 60)
  const minutes = totalTime % 60

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Total de Tópicos</div>
          <div className="text-3xl font-bold text-gray-900">{topics.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Concluídos</div>
          <div className="text-3xl font-bold text-green-600">{completedCount}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Tempo Total</div>
          <div className="text-3xl font-bold text-gray-900">
            {hours}h {minutes}m
          </div>
        </div>
      </div>

      <div className="mb-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900">Progresso Geral</span>
          <span className="text-sm font-medium text-gray-600">
            {Math.round((completedCount / topics.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(completedCount / topics.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setFilter(subject)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === subject
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            {subject === "all" ? "Todos" : subject}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="mb-6 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
      >
        <Plus className="w-5 h-5" />
        Adicionar Tópico
      </button>

      {showAddForm && (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <input
            type="text"
            value={newTopic.title}
            onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
            placeholder="Título do tópico"
            className="w-full px-4 py-3 mb-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
          />
          <input
            type="text"
            value={newTopic.subject}
            onChange={(e) => setNewTopic({ ...newTopic, subject: e.target.value })}
            placeholder="Matéria"
            className="w-full px-4 py-3 mb-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tempo estimado (minutos)</label>
            <input
              type="number"
              min="0"
              value={newTopic.timeSpent}
              onChange={(e) => setNewTopic({ ...newTopic, timeSpent: Number.parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={addTopic}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              Adicionar
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => toggleTopic(topic.id)}
                className="flex-shrink-0 mt-1 transition-transform hover:scale-110"
              >
                {topic.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300 hover:text-gray-500 transition-colors" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-base mb-2 ${
                        topic.completed ? "text-gray-400 line-through" : "text-gray-900"
                      }`}
                    >
                      {topic.title}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                      {topic.subject}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <input
                        type="number"
                        min="0"
                        value={topic.timeSpent}
                        onChange={(e) => updateTime(topic.id, Number.parseInt(e.target.value) || 0)}
                        className="w-16 bg-transparent text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 rounded px-1"
                      />
                      <span className="text-sm text-gray-600">min</span>
                    </div>
                    <button
                      onClick={() => deleteTopic(topic.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Deletar tópico"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {topic.notes && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{topic.notes}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <BookOpen className="w-14 h-14 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">Nenhum tópico encontrado</p>
        </div>
      )}
    </div>
  )
}
