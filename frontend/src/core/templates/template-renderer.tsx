'use client';

import { useMemo, useState, useEffect } from 'react';
import type {
  Template,
  TemplateComponent,
  ComponentProps,
  DataBinding,
} from './schema';

/**
 * TemplateRenderer - Renderiza templates JSON dinamicamente
 *
 * Lê templates JSON e renderiza componentes React correspondentes,
 * vinculando dados e eventos automaticamente
 */

interface TemplateRendererProps {
  template: Template;
  data?: Record<string, any>; // Dados externos passados para o template
  onEvent?: (eventType: string, eventData: any) => void;
}

/**
 * Map de componentes disponíveis para renderização
 * Adicione novos componentes aqui conforme necessário
 */
const COMPONENT_MAP: Record<string, any> = {
  Container: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  Grid: ({ children, ...props }: any) => (
    <div {...props} style={{ display: 'grid', ...props.style }}>
      {children}
    </div>
  ),
  Flex: ({ children, ...props }: any) => (
    <div {...props} style={{ display: 'flex', ...props.style }}>
      {children}
    </div>
  ),
  Stack: ({ children, ...props }: any) => (
    <div
      {...props}
      style={{ display: 'flex', flexDirection: 'column', ...props.style }}
    >
      {children}
    </div>
  ),
  Card: ({ children, ...props }: any) => (
    <div {...props} className={`rounded-lg border bg-card p-6 ${props.className || ''}`}>
      {children}
    </div>
  ),
  Button: ({ children, ...props }: any) => (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ${props.className || ''}`}
    >
      {children}
    </button>
  ),
  Input: (props: any) => (
    <input
      {...props}
      className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ${props.className || ''}`}
    />
  ),
  Text: ({ children, ...props }: any) => (
    <p {...props}>{children}</p>
  ),
  Header: ({ children, ...props }: any) => (
    <h2 {...props} className={`text-2xl font-bold ${props.className || ''}`}>
      {children}
    </h2>
  ),
  Divider: (props: any) => (
    <hr {...props} className={`my-4 border-t ${props.className || ''}`} />
  ),
  Spacer: (props: any) => (
    <div {...props} style={{ flex: 1, ...props.style }} />
  ),
};

/**
 * Resolve data binding para um componente
 */
function resolveDataBinding(
  binding: DataBinding | any,
  context: Record<string, any>
): any {
  if (!binding || typeof binding !== 'object' || !('type' in binding)) {
    return binding;
  }

  const { type, source, transform, defaultValue } = binding;

  let value = context[source];

  if (value === undefined || value === null) {
    return defaultValue;
  }

  // Apply transform if specified
  if (transform) {
    // Simple transform functions
    switch (transform) {
      case 'length':
        value = Array.isArray(value) ? value.length : 0;
        break;
      case 'uppercase':
        value = typeof value === 'string' ? value.toUpperCase() : value;
        break;
      case 'lowercase':
        value = typeof value === 'string' ? value.toLowerCase() : value;
        break;
      // Add more transforms as needed
    }
  }

  return value;
}

/**
 * Renderiza um componente individual do template
 */
function renderComponent(
  component: TemplateComponent,
  context: Record<string, any>,
  onEvent?: (eventType: string, eventData: any) => void,
  key?: string
): React.ReactNode {
  const { id, type, props = {}, children = [], condition, loop } = component;

  // Check condition
  if (condition) {
    const conditionValue = resolveDataBinding(condition, context);
    if (!conditionValue) {
      return null;
    }
  }

  // Handle loop
  if (loop) {
    const loopData = resolveDataBinding(loop, context);
    if (Array.isArray(loopData)) {
      return loopData.map((item, index) => {
        const loopContext = { ...context, item, index };
        return renderComponent(
          { ...component, loop: undefined },
          loopContext,
          onEvent,
          `${id}-${index}`
        );
      });
    }
  }

  // Get component from map
  const Component = COMPONENT_MAP[type];

  if (!Component) {
    console.warn(`Component type "${type}" not found in COMPONENT_MAP`);
    return null;
  }

  // Resolve props
  const resolvedProps: any = {};

  for (const [propKey, propValue] of Object.entries(props)) {
    if (propKey === 'events') {
      // Handle events
      const events = propValue as any[];
      events?.forEach((event) => {
        const eventHandler = () => {
          onEvent?.(event.action, event.params);
        };
        resolvedProps[`on${event.type.charAt(0).toUpperCase()}${event.type.slice(1)}`] = eventHandler;
      });
    } else if (propKey === 'data' || propKey === 'value') {
      resolvedProps[propKey] = resolveDataBinding(propValue, context);
    } else {
      resolvedProps[propKey] = propValue;
    }
  }

  // Render children
  const renderedChildren = children.map((child, index) =>
    renderComponent(child, context, onEvent, `${id}-child-${index}`)
  );

  return (
    <Component key={key || id} {...resolvedProps}>
      {renderedChildren}
    </Component>
  );
}

/**
 * Main TemplateRenderer component
 */
export function TemplateRenderer({
  template,
  data = {},
  onEvent,
}: TemplateRendererProps) {
  // Merge external data with template state
  const [state, setState] = useState<Record<string, any>>(() => {
    const initialState: Record<string, any> = {};
    template.state?.forEach((stateItem) => {
      initialState[stateItem.key] = stateItem.initialValue;
    });
    return initialState;
  });

  // Create context for data binding
  const context = useMemo(
    () => ({
      ...state,
      ...data,
    }),
    [state, data]
  );

  // Handle events from components
  const handleEvent = (eventType: string, eventData: any) => {
    // Update internal state if needed
    if (eventType.startsWith('setState:')) {
      const stateKey = eventType.replace('setState:', '');
      setState((prev) => ({ ...prev, [stateKey]: eventData }));
    }

    // Call external event handler
    onEvent?.(eventType, eventData);
  };

  // Render layout
  const { layout } = template;

  return (
    <div className="template-container">
      {layout.header && renderComponent(layout.header, context, handleEvent, 'header')}
      <div className="template-main">
        {layout.sidebar && (
          <aside className="template-sidebar">
            {renderComponent(layout.sidebar, context, handleEvent, 'sidebar')}
          </aside>
        )}
        <main className="template-content">
          {renderComponent(layout.main, context, handleEvent, 'main')}
        </main>
      </div>
      {layout.footer && renderComponent(layout.footer, context, handleEvent, 'footer')}
    </div>
  );
}

/**
 * Hook para carregar template JSON
 */
export function useTemplate(templateId: string) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadTemplate() {
      try {
        setLoading(true);
        const response = await fetch(`/templates/${templateId}.json`);

        if (!response.ok) {
          throw new Error(`Failed to load template: ${templateId}`);
        }

        const data = await response.json();
        setTemplate(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadTemplate();
  }, [templateId]);

  return { template, loading, error };
}
