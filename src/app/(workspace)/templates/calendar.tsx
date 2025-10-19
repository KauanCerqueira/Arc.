"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

type Event = {
  id: number;
  title: string;
  date: string;
  time: string;
  color: string;
};

export default function CalendarTemplate() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([
    { id: 1, title: 'Reunião de equipe', date: '2025-01-20', time: '10:00', color: 'bg-blue-500' },
    { id: 2, title: 'Apresentação cliente', date: '2025-01-22', time: '14:30', color: 'bg-purple-500' },
    { id: 3, title: 'Sprint planning', date: '2025-01-25', time: '09:00', color: 'bg-green-500' },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '' });

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;

    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setEvents([...events, {
      id: Date.now(),
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time || '09:00',
      color: randomColor
    }]);

    setNewEvent({ title: '', date: '', time: '' });
    setShowAddForm(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Evento
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Título do evento"
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              onClick={addEvent}
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

      {/* Calendar Grid */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Day Names */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] p-2 border-b border-r border-gray-200 ${
                day === null ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
              } ${index % 7 === 6 ? 'border-r-0' : ''}`}
            >
              {day !== null && (
                <>
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(day) 
                      ? 'w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center' 
                      : 'text-gray-900'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {getEventsForDay(day).map((event) => (
                      <div
                        key={event.id}
                        className={`${event.color} text-white text-xs px-2 py-1 rounded truncate`}
                        title={`${event.title} - ${event.time}`}
                      >
                        {event.time} {event.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Próximos Eventos</h3>
        <div className="space-y-2">
          {events
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">{event.title}</div>
                  <div className="text-sm text-gray-600">{event.date} • {event.time}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}