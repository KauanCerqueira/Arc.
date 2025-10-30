"use client"

import { useState } from 'react'
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData'
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types'
import { Plus, Dumbbell, Trash2, CheckCircle } from 'lucide-react'

type Exercise = {
  id: string
  name: string
  sets: string
  reps: string
  weight: string
  rest: string
  notes: string
  completed: boolean
}

type Workout = {
  id: string
  name: string
  day: string
  exercises: Exercise[]
  completed: boolean
  date?: string
}

type WorkoutTemplateData = {
  workouts: Workout[]
}

const DEFAULT_DATA: WorkoutTemplateData = {
  workouts: [],
}

export default function WorkoutTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<WorkoutTemplateData>(groupId, pageId, DEFAULT_DATA)
  const workouts = data.workouts ?? []

  const addWorkout = () => {
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
    const usedDays = workouts.map(w => w.day)
    const availableDay = days.find(d => !usedDays.includes(d)) || 'Treino'

    const newWorkout: Workout = {
      id: `workout-${Date.now()}`,
      name: 'Novo Treino',
      day: availableDay,
      exercises: [],
      completed: false,
    }

    setData((current) => ({
      ...current,
      workouts: [...(current.workouts || []), newWorkout],
    }))
  }

  const updateWorkout = (id: string, updates: Partial<Workout>) => {
    setData((current) => ({
      ...current,
      workouts: (current.workouts || []).map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }))
  }

  const deleteWorkout = (id: string) => {
    if (confirm('Deletar este treino?')) {
      setData((current) => ({
        ...current,
        workouts: (current.workouts || []).filter((w) => w.id !== id),
      }))
    }
  }

  const addExercise = (workoutId: string) => {
    const newExercise: Exercise = {
      id: `ex-${Date.now()}`,
      name: 'Novo Exercício',
      sets: '3',
      reps: '12',
      weight: '0',
      rest: '60',
      notes: '',
      completed: false,
    }

    setData((current) => ({
      ...current,
      workouts: (current.workouts || []).map((w) =>
        w.id === workoutId ? { ...w, exercises: [...w.exercises, newExercise] } : w
      ),
    }))
  }

  const updateExercise = (workoutId: string, exerciseId: string, updates: Partial<Exercise>) => {
    setData((current) => ({
      ...current,
      workouts: (current.workouts || []).map((w) =>
        w.id === workoutId
          ? { ...w, exercises: w.exercises.map((ex) => (ex.id === exerciseId ? { ...ex, ...updates } : ex)) }
          : w
      ),
    }))
  }

  const deleteExercise = (workoutId: string, exerciseId: string) => {
    setData((current) => ({
      ...current,
      workouts: (current.workouts || []).map((w) =>
        w.id === workoutId ? { ...w, exercises: w.exercises.filter((ex) => ex.id !== exerciseId) } : w
      ),
    }))
  }

  const dayOrder = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
  const sortedWorkouts = [...workouts].sort((a, b) => {
    const aIndex = dayOrder.indexOf(a.day)
    const bIndex = dayOrder.indexOf(b.day)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  const getTotalVolume = (workout: Workout) => {
    return workout.exercises.reduce((sum, ex) => {
      const sets = parseInt(ex.sets) || 0
      const reps = parseInt(ex.reps) || 0
      const weight = parseFloat(ex.weight) || 0
      return sum + (sets * reps * weight)
    }, 0)
  }

  const getCompletedExercises = (workout: Workout) => {
    return workout.exercises.filter(ex => ex.completed).length
  }

  if (workouts.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Monte seu Treino</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Organize seus treinos, acompanhe exercícios e monitore seu progresso
          </p>
          <button
            onClick={addWorkout}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Primeiro Treino
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <div className="flex-none border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Dumbbell className="text-orange-600" />
              Meus Treinos
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {workouts.length} {workouts.length === 1 ? 'treino' : 'treinos'} • {workouts.reduce((sum, w) => sum + w.exercises.length, 0)} exercícios
            </p>
          </div>
          <button
            onClick={addWorkout}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Treino
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {sortedWorkouts.map((workout) => (
            <div key={workout.id} className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="text"
                      value={workout.day}
                      onChange={(e) => updateWorkout(workout.id, { day: e.target.value })}
                      className="w-32 text-sm font-medium text-white bg-white/20 border-none rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Dia"
                    />
                    <input
                      type="text"
                      value={workout.name}
                      onChange={(e) => updateWorkout(workout.id, { name: e.target.value })}
                      className="flex-1 min-w-0 text-xl font-bold text-white bg-white/20 border-none rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Nome do treino"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-white/90 text-sm px-3 py-1 bg-white/20 rounded-lg">
                      {getCompletedExercises(workout)}/{workout.exercises.length} completos
                    </div>
                    <button
                      onClick={() => updateWorkout(workout.id, { completed: !workout.completed })}
                      className={`p-2 rounded-lg transition ${
                        workout.completed ? 'bg-green-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      title={workout.completed ? 'Treino completo' : 'Marcar como completo'}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {getTotalVolume(workout) > 0 && (
                  <div className="mt-2 text-white/80 text-sm">
                    Volume total: {getTotalVolume(workout).toFixed(0)} kg
                  </div>
                )}
              </div>

              <div className="p-4">
                {workout.exercises.length > 0 ? (
                  <div className="space-y-3 mb-3">
                    {workout.exercises.map((exercise) => (
                      <div key={exercise.id} className={`p-4 rounded-lg border-2 transition ${
                        exercise.completed
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                      }`}>
                        <div className="flex items-start gap-2 mb-3">
                          <button
                            onClick={() => updateExercise(workout.id, exercise.id, { completed: !exercise.completed })}
                            className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                              exercise.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300 dark:border-slate-600 hover:border-orange-500'
                            }`}
                          >
                            {exercise.completed && <CheckCircle className="w-4 h-4 text-white" />}
                          </button>
                          <input
                            type="text"
                            value={exercise.name}
                            onChange={(e) => updateExercise(workout.id, exercise.id, { name: e.target.value })}
                            className="flex-1 font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 -mx-2"
                            placeholder="Nome do exercício"
                          />
                          <button
                            onClick={() => deleteExercise(workout.id, exercise.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                          <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Séries</label>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => updateExercise(workout.id, exercise.id, { sets: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                              placeholder="3"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Repetições</label>
                            <input
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => updateExercise(workout.id, exercise.id, { reps: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                              placeholder="12"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Peso (kg)</label>
                            <input
                              type="number"
                              step="0.5"
                              value={exercise.weight}
                              onChange={(e) => updateExercise(workout.id, exercise.id, { weight: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Descanso (s)</label>
                            <input
                              type="number"
                              value={exercise.rest}
                              onChange={(e) => updateExercise(workout.id, exercise.id, { rest: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                              placeholder="60"
                            />
                          </div>
                        </div>
                        <input
                          type="text"
                          value={exercise.notes}
                          onChange={(e) => updateExercise(workout.id, exercise.id, { notes: e.target.value })}
                          className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 -mx-2"
                          placeholder="Observações (técnica, progressão, etc)..."
                        />
                        {(parseInt(exercise.sets) > 0 && parseInt(exercise.reps) > 0 && parseFloat(exercise.weight) > 0) && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Volume: {(parseInt(exercise.sets) * parseInt(exercise.reps) * parseFloat(exercise.weight)).toFixed(0)} kg
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">Nenhum exercício ainda</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => addExercise(workout.id)}
                    className="flex-1 px-4 py-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Exercício
                  </button>
                  <button
                    onClick={() => deleteWorkout(workout.id)}
                    className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
