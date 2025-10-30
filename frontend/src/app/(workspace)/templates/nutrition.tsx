"use client"

import { useState } from 'react'
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData'
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types'
import { Plus, Apple, Trash2, Flame } from 'lucide-react'

type Food = {
  id: string
  name: string
  calories: string
  protein: string
  carbs: string
  fats: string
  quantity: string
}

type Meal = {
  id: string
  name: string
  time: string
  foods: Food[]
}

type DailyGoals = {
  calories: string
  protein: string
  carbs: string
  fats: string
}

type NutritionTemplateData = {
  meals: Meal[]
  goals?: DailyGoals
}

const DEFAULT_DATA: NutritionTemplateData = {
  meals: [],
  goals: {
    calories: '2000',
    protein: '150',
    carbs: '200',
    fats: '65',
  },
}

export default function NutritionTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<NutritionTemplateData>(groupId, pageId, DEFAULT_DATA)
  const meals = data.meals ?? []

  const addMeal = () => {
    const newMeal: Meal = {
      id: `meal-${Date.now()}`,
      name: 'Nova Refeição',
      time: '12:00',
      foods: [],
    }

    setData((current) => ({
      ...current,
      meals: [...(current.meals || []), newMeal],
    }))
  }

  const updateMeal = (id: string, updates: Partial<Meal>) => {
    setData((current) => ({
      ...current,
      meals: (current.meals || []).map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }))
  }

  const deleteMeal = (id: string) => {
    if (confirm('Deletar esta refeição?')) {
      setData((current) => ({
        ...current,
        meals: (current.meals || []).filter((m) => m.id !== id),
      }))
    }
  }

  const addFood = (mealId: string) => {
    const newFood: Food = {
      id: `food-${Date.now()}`,
      name: 'Novo Alimento',
      calories: '0',
      protein: '0',
      carbs: '0',
      fats: '0',
      quantity: '100',
    }

    setData((current) => ({
      ...current,
      meals: (current.meals || []).map((m) => (m.id === mealId ? { ...m, foods: [...m.foods, newFood] } : m)),
    }))
  }

  const updateFood = (mealId: string, foodId: string, updates: Partial<Food>) => {
    setData((current) => ({
      ...current,
      meals: (current.meals || []).map((m) =>
        m.id === mealId ? { ...m, foods: m.foods.map((f) => (f.id === foodId ? { ...f, ...updates } : f)) } : m
      ),
    }))
  }

  const deleteFood = (mealId: string, foodId: string) => {
    setData((current) => ({
      ...current,
      meals: (current.meals || []).map((m) => (m.id === mealId ? { ...m, foods: m.foods.filter((f) => f.id !== foodId) } : m)),
    }))
  }

  const getTotalCalories = (meal: Meal) => {
    return meal.foods.reduce((sum, f) => sum + (parseInt(f.calories) || 0), 0)
  }

  const getTotalProtein = (meal: Meal) => {
    return meal.foods.reduce((sum, f) => sum + (parseFloat(f.protein) || 0), 0)
  }

  const getTotalCarbs = (meal: Meal) => {
    return meal.foods.reduce((sum, f) => sum + (parseFloat(f.carbs) || 0), 0)
  }

  const getTotalFats = (meal: Meal) => {
    return meal.foods.reduce((sum, f) => sum + (parseFloat(f.fats) || 0), 0)
  }

  const getDailyTotals = () => {
    return {
      calories: meals.reduce((sum, m) => sum + getTotalCalories(m), 0),
      protein: meals.reduce((sum, m) => sum + getTotalProtein(m), 0),
      carbs: meals.reduce((sum, m) => sum + getTotalCarbs(m), 0),
      fats: meals.reduce((sum, m) => sum + getTotalFats(m), 0),
    }
  }

  const updateGoals = (updates: Partial<DailyGoals>) => {
    setData((current) => ({
      ...current,
      goals: { ...(current.goals || DEFAULT_DATA.goals!), ...updates },
    }))
  }

  const goals = data.goals || DEFAULT_DATA.goals!
  const dailyTotals = getDailyTotals()
  const getPercentage = (current: number, goal: string) => {
    const goalNum = parseFloat(goal) || 1
    return Math.round((current / goalNum) * 100)
  }

  const sortedMeals = [...meals].sort((a, b) => a.time.localeCompare(b.time))

  if (meals.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
            <Apple className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Monte sua Dieta</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Planeje suas refeições, controle macros e alcance seus objetivos
          </p>
          <button
            onClick={addMeal}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Primeira Refeição
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
              <Apple className="text-green-600" />
              Minha Dieta
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {meals.length} {meals.length === 1 ? 'refeição' : 'refeições'} • {dailyTotals.calories} / {goals.calories} kcal
            </p>
          </div>
          <button
            onClick={addMeal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Refeição
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Daily Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Resumo Diário</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Calorias</span>
                  <span className="text-xs text-gray-500">{getPercentage(dailyTotals.calories, goals.calories)}%</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dailyTotals.calories}</span>
                  <span className="text-sm text-gray-500">/ {goals.calories} kcal</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
                    style={{ width: `${Math.min(getPercentage(dailyTotals.calories, goals.calories), 100)}%` }}
                  />
                </div>
                <input
                  type="number"
                  value={goals.calories}
                  onChange={(e) => updateGoals({ calories: e.target.value })}
                  className="mt-2 w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300"
                  placeholder="Meta"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Proteína</span>
                  <span className="text-xs text-gray-500">{getPercentage(dailyTotals.protein, goals.protein)}%</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dailyTotals.protein.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">/ {goals.protein} g</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                    style={{ width: `${Math.min(getPercentage(dailyTotals.protein, goals.protein), 100)}%` }}
                  />
                </div>
                <input
                  type="number"
                  value={goals.protein}
                  onChange={(e) => updateGoals({ protein: e.target.value })}
                  className="mt-2 w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300"
                  placeholder="Meta"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Carboidratos</span>
                  <span className="text-xs text-gray-500">{getPercentage(dailyTotals.carbs, goals.carbs)}%</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dailyTotals.carbs.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">/ {goals.carbs} g</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all"
                    style={{ width: `${Math.min(getPercentage(dailyTotals.carbs, goals.carbs), 100)}%` }}
                  />
                </div>
                <input
                  type="number"
                  value={goals.carbs}
                  onChange={(e) => updateGoals({ carbs: e.target.value })}
                  className="mt-2 w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300"
                  placeholder="Meta"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Gorduras</span>
                  <span className="text-xs text-gray-500">{getPercentage(dailyTotals.fats, goals.fats)}%</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dailyTotals.fats.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">/ {goals.fats} g</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all"
                    style={{ width: `${Math.min(getPercentage(dailyTotals.fats, goals.fats), 100)}%` }}
                  />
                </div>
                <input
                  type="number"
                  value={goals.fats}
                  onChange={(e) => updateGoals({ fats: e.target.value })}
                  className="mt-2 w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300"
                  placeholder="Meta"
                />
              </div>
            </div>
          </div>

          {/* Meals */}
          <div className="space-y-4">
            {sortedMeals.map((meal) => (
              <div key={meal.id} className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="time"
                      value={meal.time}
                      onChange={(e) => updateMeal(meal.id, { time: e.target.value })}
                      className="px-3 py-2 bg-white/20 text-white border-none rounded focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <input
                      type="text"
                      value={meal.name}
                      onChange={(e) => updateMeal(meal.id, { name: e.target.value })}
                      className="flex-1 min-w-0 text-xl font-bold text-white bg-white/20 border-none rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Nome da refeição"
                    />
                    <div className="flex items-center gap-4 text-white/90 text-sm bg-white/20 px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        {getTotalCalories(meal)} kcal
                      </div>
                      <div>P: {getTotalProtein(meal).toFixed(0)}g</div>
                      <div>C: {getTotalCarbs(meal).toFixed(0)}g</div>
                      <div>G: {getTotalFats(meal).toFixed(0)}g</div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {meal.foods.length > 0 ? (
                    <div className="space-y-3 mb-3">
                      {meal.foods.map((food) => (
                        <div key={food.id} className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                          <div className="flex gap-2 items-center mb-3">
                            <input
                              type="text"
                              value={food.name}
                              onChange={(e) => updateFood(meal.id, food.id, { name: e.target.value })}
                              className="flex-1 font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-2 -mx-2"
                              placeholder="Alimento"
                            />
                            <button
                              onClick={() => deleteFood(meal.id, food.id)}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Quantidade (g)</label>
                              <input
                                type="number"
                                value={food.quantity}
                                onChange={(e) => updateFood(meal.id, food.id, { quantity: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                                placeholder="100"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Calorias</label>
                              <input
                                type="number"
                                value={food.calories}
                                onChange={(e) => updateFood(meal.id, food.id, { calories: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Proteína (g)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={food.protein}
                                onChange={(e) => updateFood(meal.id, food.id, { protein: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Carboidrato (g)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={food.carbs}
                                onChange={(e) => updateFood(meal.id, food.id, { carbs: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Gordura (g)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={food.fats}
                                onChange={(e) => updateFood(meal.id, food.id, { fats: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">Nenhum alimento ainda</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => addFood(meal.id)}
                      className="flex-1 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Alimento
                    </button>
                    <button
                      onClick={() => deleteMeal(meal.id)}
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
    </div>
  )
}
