import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';

export function TasksWidget() {
  const tasks = [
    { id: 1, title: 'Revisar Orçamento', completed: false },
    { id: 2, title: 'Daily com time', completed: true },
    { id: 3, title: 'Enviar proposta', completed: false },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Minhas Tarefas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center text-sm">
              {task.completed ? (
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <Circle className="mr-2 h-4 w-4 text-gray-300" />
              )}
              <span className={task.completed ? 'line-through text-gray-400' : ''}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
