"use client";

import { useState } from 'react';
import { Plus, BookOpen, CheckCircle2, Circle, Clock } from 'lucide-react';

type Topic = {
  id: number;
  title: string;
  subject: string;
  completed: boolean;
  timeSpent: number;
  notes?: string;
};

export default function StudyTemplate() {
  const [topics, setTopics] = useState<Topic[]>([
    { id: 1, title: 'Estruturas de Dados', subject: 'Algoritmos', completed: false, timeSpent: 45 },
    { id: 2, title: 'React Hooks', subject: 'Frontend', completed: true, timeSpent: 120 },
    { id: 3, title: 'Clean Architecture', subject: 'Backend', completed: false, timeSpent: 60 },
    { id: 4, title: 'SQL Avançado', subject: 'Banco de Dados', completed: false, timeSpent: 30 },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', subject: '' });
  const [filter, setFilter] = useState<string>('all');

  const addTopic = () => {
    if (!newTopic.title.trim() || !newTopic.subject.trim()) return;

    setTopics([...topics, {
      id: Date.now(),
      title: newTopic.title,
      subject: newTopic.subject,
      completed: false,
      timeSpent: 0
    }]);

    setNewTopic({ title: '', subject: '' });
    setShowAddForm(false);
  };

  const toggleTopic = (id: number) => {
    setTopics(topics.map(topic =>
      topic.id === id ? { ...topic, completed: !topic.completed } : topic
    ));
  };

  const subjects = ['all', ...Array.from(new Set(topics.map(t => t.subject)))];
  const filteredTopics = filter === 'all' 
    ? topics 
    : topics.filter(t => t.subject === filter);

  const completedCount = topics.filter(t => t.completed).length;
  const totalTime = topics.reduce((acc, t) => acc + t.timeSpent, 0);
  const hours = Math.floor(totalTime / 60);
  const minutes = totalTime % 60;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total de Tópicos</div>
          <div className="text-2xl font-semibold text-gray-900">{topics.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Concluídos</div>
          <div className="text-2xl font-semibold text-green-600">{completedCount}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Tempo Total</div>
          <div className="text-2xl font-semibold text-gray-900">
            {hours}h {minutes}m
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">Progresso Geral</span>
          <span className="text-sm text-gray-600">
            {Math.round((completedCount / topics.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all"
            style={{ width: `${(completedCount / topics.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-gray-600 mr-2">Filtrar por:</span>
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setFilter(subject)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition ${
              filter === subject
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {subject === 'all' ? 'Todos' : subject}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="mb-6 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Adicionar Tópico
      </button>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <input
            type="text"
            value={newTopic.title}
            onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
            placeholder="Título do tópico"
            className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <input
            type="text"
            value={newTopic.subject}
            onChange={(e) => setNewTopic({ ...newTopic, subject: e.target.value })}
            placeholder="Matéria"
            className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={addTopic}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              Adicionar
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Topics List */}
      <div className="space-y-3">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleTopic(topic.id)}
                className="flex-shrink-0 mt-0.5"
              >
                {topic.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className={`font-medium ${
                      topic.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}>
                      {topic.title}
                    </h3>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {topic.subject}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{topic.timeSpent} min</span>
                  </div>
                </div>

                {topic.notes && (
                  <p className="text-sm text-gray-600 mt-2">{topic.notes}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Nenhum tópico encontrado</p>
        </div>
      )}
    </div>
  );
}