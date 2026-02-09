"use client";

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TasksWidget } from '../widgets/TasksWidget';
import { FinanceWidget } from '../widgets/FinanceWidget';
import { CalendarWidget } from '../widgets/CalendarWidget';
import { cn } from '@/shared/lib/utils';

// Mapeamento de widgets disponíveis
const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
  'tasks': TasksWidget,
  'finance': FinanceWidget,
  'calendar': CalendarWidget,
};

interface WidgetItem {
  id: string;
  type: string;
}

interface SortableWidgetProps {
  id: string;
  type: string;
}

function SortableWidget({ id, type }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const Component = WIDGET_COMPONENTS[type];

  if (!Component) return null;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full">
      <Component />
    </div>
  );
}

export function DashboardGrid() {
  const [items, setItems] = useState<WidgetItem[]>([
    { id: '1', type: 'finance' },
    { id: '2', type: 'tasks' },
    { id: '3', type: 'calendar' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {items.map((item) => (
            <SortableWidget key={item.id} id={item.id} type={item.type} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
