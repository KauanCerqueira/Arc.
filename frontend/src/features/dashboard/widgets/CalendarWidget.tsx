import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CalendarWidget() {
  const today = new Date();
  const events = [
    { time: '10:00', title: 'Reunião de Planejamento' },
    { time: '14:30', title: 'Call com Cliente' },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Agenda Hoje</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, i) => (
            <div key={i} className="flex items-start">
              <span className="text-xs font-bold text-gray-500 w-12 pt-0.5">{event.time}</span>
              <div className="bg-primary/5 p-2 rounded-md flex-1 text-sm border-l-2 border-primary">
                {event.title}
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Sem eventos hoje</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
