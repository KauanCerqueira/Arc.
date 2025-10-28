"use client";

import { useState } from 'react';
import { 
  Plus, Trash2, Edit2, Check, X, Download, Upload,
  Filter, Search, SortAsc, SortDesc, Copy, Eye,
  EyeOff, Lock, MoreVertical, Grid3x3, ChevronDown,
  Menu, Settings, List, LayoutGrid
} from 'lucide-react';
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData';
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types';

type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'url';

type Column = {
  id: string;
  name: string;
  type: ColumnType;
  width?: number;
  visible: boolean;
  locked: boolean;
  options?: string[];
};

type TableRow = {
  id: string;
  [key: string]: unknown;
};

const COLUMN_TYPES = [
  { value: 'text', label: 'Texto', icon: '📝' },
  { value: 'number', label: 'Número', icon: '🔢' },
  { value: 'date', label: 'Data', icon: '📅' },
  { value: 'select', label: 'Seleção', icon: '📋' },
  { value: 'checkbox', label: 'Checkbox', icon: '✅' },
  { value: 'url', label: 'Link', icon: '🔗' },
];

type TableTemplateData = {
  columns: Column[];
  rows: TableRow[];
};

const DEFAULT_DATA: TableTemplateData = {
  columns: [
    { id: 'col1', name: 'Nome', type: 'text', visible: true, locked: false },
    { id: 'col2', name: 'Email', type: 'text', visible: true, locked: false },
    { id: 'col3', name: 'Cargo', type: 'text', visible: true, locked: false },
    {
      id: 'col4',
      name: 'Status',
      type: 'select',
      visible: true,
      locked: false,
      options: ['Ativo', 'Inativo', 'Férias'],
    },
    { id: 'col5', name: 'Salário', type: 'number', visible: true, locked: false },
    { id: 'col6', name: 'Data Admissão', type: 'date', visible: true, locked: false },
  ],
  rows: [
    {
      id: '1',
      col1: 'João Silva',
      col2: 'joao@email.com',
      col3: 'Desenvolvedor',
      col4: 'Ativo',
      col5: '8000',
      col6: '2024-01-15',
    },
    {
      id: '2',
      col1: 'Maria Santos',
      col2: 'maria@email.com',
      col3: 'Designer',
      col4: 'Ativo',
      col5: '7500',
      col6: '2024-02-20',
    },
    {
      id: '3',
      col1: 'Pedro Costa',
      col2: 'pedro@email.com',
      col3: 'Product Manager',
      col4: 'Férias',
      col5: '9000',
      col6: '2023-11-10',
    },
  ],
};

export default function TableTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData, isSaving } = usePageTemplateData<TableTemplateData>(
    groupId,
    pageId,
    DEFAULT_DATA,
  );
  const columns = data.columns ?? DEFAULT_DATA.columns;
  const rows = data.rows ?? DEFAULT_DATA.rows;

  const applyTableChanges = (
    updater: (state: { columns: Column[]; rows: TableRow[] }) => {
      columns?: Column[];
      rows?: TableRow[];
    },
  ) => {
    setData((current) => {
      const currentColumns = [...(current.columns ?? [])];
      const currentRows = [...(current.rows ?? [])];
      const result = updater({ columns: currentColumns, rows: currentRows });

      return {
        ...current,
        columns: result.columns ?? currentColumns,
        rows: result.rows ?? currentRows,
      };
    });
  };

  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState<string | null>(null);
  const [showRowMenu, setShowRowMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [newColumn, setNewColumn] = useState({
    name: '',
    type: 'text' as ColumnType,
    options: '',
  });

  const addRow = () => {
    applyTableChanges(({ columns, rows }) => {
      const newRow: TableRow = { id: Date.now().toString() };
      columns.forEach((col) => {
        if (col.type === 'checkbox') {
          newRow[col.id] = false;
        } else {
          newRow[col.id] = '';
        }
      });

      return {
        rows: [...rows, newRow],
      };
    });
  };

  const deleteRow = (id: string) => {
    if (confirm('Excluir esta linha?')) {
      applyTableChanges(({ rows }) => ({
        rows: rows.filter((row) => row.id !== id),
      }));
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const deleteSelectedRows = () => {
    if (selectedRows.length === 0) return;
    if (confirm(`Excluir ${selectedRows.length} linha(s) selecionada(s)?`)) {
      applyTableChanges(({ rows }) => ({
        rows: rows.filter((row) => !selectedRows.includes(row.id)),
      }));
      setSelectedRows([]);
    }
  };

  const duplicateRow = (rowId: string) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;

    applyTableChanges(({ rows }) => ({
      rows: [...rows, { ...row, id: Date.now().toString() }],
    }));
    setShowRowMenu(null);
  };

  const addColumn = () => {
    if (!newColumn.name.trim()) return;

    const col: Column = {
      id: `col${Date.now()}`,
      name: newColumn.name,
      type: newColumn.type,
      visible: true,
      locked: false,
      options:
        newColumn.type === 'select'
          ? newColumn.options.split(',').map((o) => o.trim()).filter((o) => o)
          : undefined,
    };

    applyTableChanges(({ columns, rows }) => ({
      columns: [...columns, col],
      rows: rows.map((row) => ({
        ...row,
        [col.id]: col.type === 'checkbox' ? false : '',
      })),
    }));

    setNewColumn({ name: '', type: 'text', options: '' });
    setShowAddColumn(false);
  };

  const deleteColumn = (columnId: string) => {
    if (confirm('Excluir esta coluna?')) {
      applyTableChanges(({ columns, rows }) => {
        const updatedColumns = columns.filter((col) => col.id !== columnId);
        const updatedRows = rows.map((row) => {
          const newRow = { ...row };
          delete newRow[columnId];
          return newRow;
        });

        return {
          columns: updatedColumns,
          rows: updatedRows,
        };
      });
    }
  };

  const toggleColumnVisibility = (columnId: string) => {
    applyTableChanges(({ columns }) => ({
      columns: columns.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col,
      ),
    }));
  };

  const startEditing = (rowId: string, columnId: string, currentValue: unknown) => {
    const column = columns.find(c => c.id === columnId);
    if (column?.locked) return;
    
    setEditingCell({ rowId, columnId });
    setEditValue(currentValue?.toString() || '');
  };

  const saveEdit = () => {
    if (editingCell) {
      const column = columns.find(c => c.id === editingCell.columnId);
      let value: any = editValue;

      if (column?.type === 'number') {
        value = parseFloat(editValue) || 0;
      } else if (column?.type === 'checkbox') {
        value = editValue === 'true';
      }

      applyTableChanges(({ rows }) => ({
        rows: rows.map((row) =>
          row.id === editingCell.rowId ? { ...row, [editingCell.columnId]: value } : row,
        ),
      }));
      setEditingCell(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const toggleCheckbox = (rowId: string, columnId: string) => {
    applyTableChanges(({ rows }) => ({
      rows: rows.map((row) => {
        if (row.id !== rowId) return row;
        const currentValue = Boolean(row[columnId]);
        return { ...row, [columnId]: !currentValue };
      }),
    }));
  };

  const toggleRowSelection = (rowId: string) => {
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter(id => id !== rowId));
    } else {
      setSelectedRows([...selectedRows, rowId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === rows.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(rows.map(r => r.id));
    }
  };

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const compareValues = (aVal: unknown, bVal: unknown, column?: Column): number => {
    const normalize = (value: unknown) => {
      if (value === null || value === undefined) return null;
      return value;
    };

    const aNormalized = normalize(aVal);
    const bNormalized = normalize(bVal);

    if (aNormalized === null && bNormalized === null) return 0;
    if (aNormalized === null) return -1;
    if (bNormalized === null) return 1;

    switch (column?.type) {
      case 'number': {
        const aNum = typeof aNormalized === 'number' ? aNormalized : Number(aNormalized);
        const bNum = typeof bNormalized === 'number' ? bNormalized : Number(bNormalized);
        if (Number.isNaN(aNum) && Number.isNaN(bNum)) return 0;
        if (Number.isNaN(aNum)) return -1;
        if (Number.isNaN(bNum)) return 1;
        return aNum - bNum;
      }
      case 'date': {
        const aTime = new Date(String(aNormalized)).getTime();
        const bTime = new Date(String(bNormalized)).getTime();
        return aTime - bTime;
      }
      case 'checkbox': {
        const aBool = Boolean(aNormalized);
        const bBool = Boolean(bNormalized);
        return Number(aBool) - Number(bBool);
      }
      default: {
        const aStr = String(aNormalized).toLowerCase();
        const bStr = String(bNormalized).toLowerCase();
        return aStr.localeCompare(bStr, 'pt-BR', { numeric: true, sensitivity: 'base' });
      }
    }
  };

  const filteredAndSortedRows = rows
    .filter(row => {
      if (!searchQuery) return true;
      return columns.some(col => {
        const value = row[col.id]?.toString().toLowerCase() || '';
        return value.includes(searchQuery.toLowerCase());
      });
    })
    .sort((a, b) => {
      if (!sortColumn) return 0;
      const column = columns.find((col) => col.id === sortColumn);
      const comparison = compareValues(a[sortColumn], b[sortColumn], column);
      if (comparison === 0) return 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const visibleColumns = columns.filter(col => col.visible);

  const exportToCSV = () => {
    const headers = visibleColumns.map(col => col.name).join(',');
    const data = filteredAndSortedRows.map(row => 
      visibleColumns.map(col => row[col.id] || '').join(',')
    ).join('\n');
    
    const csv = `${headers}\n${data}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tabela.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCellValue = (value: any, column: Column) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic text-sm">Vazio</span>;
    }

    if (column.type === 'number') {
      return new Intl.NumberFormat('pt-BR').format(value);
    }

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString('pt-BR');
    }

    if (column.type === 'url' && value) {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </a>
      );
    }

    return value.toString();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-950">
      {/* Header Mobile */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">Planilha</h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredAndSortedRows.length} {filteredAndSortedRows.length === 1 ? 'linha' : 'linhas'}
              {selectedRows.length > 0 && ` • ${selectedRows.length} selecionada(s)`}
            </p>
          </div>

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="hidden lg:flex items-center gap-2">
            {selectedRows.length > 0 && (
              <button
                onClick={deleteSelectedRows}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium text-sm"
              >
                Excluir ({selectedRows.length})
              </button>
            )}
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition font-medium flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button
              onClick={addRow}
              className="px-4 py-2 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Nova Linha
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <>
            <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)}></div>
            <div className="absolute right-4 top-16 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 py-2 z-50 lg:hidden">
              <button
                onClick={() => {
                  addRow();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Nova Linha</span>
              </button>
              <button
                onClick={() => {
                  exportToCSV();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <Download className="w-5 h-5" />
                <span className="font-medium">Exportar CSV</span>
              </button>
              {selectedRows.length > 0 && (
                <button
                  onClick={() => {
                    deleteSelectedRows();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="font-medium">Excluir ({selectedRows.length})</span>
                </button>
              )}
              <div className="border-t border-gray-200 dark:border-slate-700 my-2"></div>
              <button
                onClick={() => {
                  setViewMode(viewMode === 'cards' ? 'table' : 'cards');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition lg:hidden"
              >
                {viewMode === 'cards' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
                <span className="font-medium">Modo {viewMode === 'cards' ? 'Tabela' : 'Cards'}</span>
              </button>
            </div>
          </>
        )}

        {/* Search & Add Column */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
            />
          </div>

          {showAddColumn ? (
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Nova Coluna</h3>
                <button
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumn({ name: '', type: 'text', options: '' });
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <input
                type="text"
                value={newColumn.name}
                onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                placeholder="Nome da coluna"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              />
              
              <select
                value={newColumn.type}
                onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value as ColumnType })}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              >
                {COLUMN_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
              
              {newColumn.type === 'select' && (
                <input
                  type="text"
                  value={newColumn.options}
                  onChange={(e) => setNewColumn({ ...newColumn, options: e.target.value })}
                  placeholder="Opções (separadas por vírgula)"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              )}
              
              <button
                onClick={addColumn}
                disabled={!newColumn.name.trim()}
                className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar Coluna
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddColumn(true)}
              className="w-full px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition font-medium text-sm"
            >
              + Nova Coluna
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Mobile Cards View */}
        <div className={`space-y-3 ${viewMode === 'table' ? 'hidden lg:hidden' : 'lg:hidden'}`}>
          {filteredAndSortedRows.map((row) => (
            <div
              key={row.id}
              className={`bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm ${
                selectedRows.includes(row.id) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(row.id)}
                  onChange={() => toggleRowSelection(row.id)}
                  className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 mt-0.5"
                />
                
                <div className="relative">
                  <button
                    onClick={() => setShowRowMenu(showRowMenu === row.id ? null : row.id)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>

                  {showRowMenu === row.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowRowMenu(null)}></div>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 py-1 z-50">
                        <button
                          onClick={() => duplicateRow(row.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicar
                        </button>
                        <button
                          onClick={() => {
                            deleteRow(row.id);
                            setShowRowMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {visibleColumns.map((column) => (
                  <div key={column.id} className="flex flex-col">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <span>{COLUMN_TYPES.find(t => t.value === column.type)?.icon}</span>
                      {column.name}
                    </label>
                    
                    {column.type === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={!!row[column.id]}
                        onChange={() => toggleCheckbox(row.id, column.id)}
                        disabled={column.locked}
                        className="w-5 h-5 rounded border-gray-300 dark:border-slate-600"
                      />
                    ) : editingCell?.rowId === row.id && editingCell?.columnId === column.id ? (
                      <div className="flex items-center gap-2">
                        {column.type === 'select' && column.options ? (
                          <select
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                          >
                            <option value="">Selecione...</option>
                            {column.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                            autoFocus
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                          />
                        )}
                        <button
                          onClick={saveEdit}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => startEditing(row.id, column.id, row[column.id])}
                        className={`px-3 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 ${
                          column.locked 
                            ? 'cursor-not-allowed opacity-60' 
                            : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {formatCellValue(row[column.id], column)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredAndSortedRows.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
              <div className="text-5xl mb-3">📊</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhuma linha. Adicione uma para começar.'}
              </p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className={`bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm ${viewMode === 'cards' ? 'hidden lg:block' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === rows.length && rows.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 dark:border-slate-600"
                    />
                  </th>
                  {visibleColumns.map((column) => (
                    <th
                      key={column.id}
                      className="px-4 py-3 text-left group relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <button
                            onClick={() => handleSort(column.id)}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition"
                          >
                            <span className="truncate">{column.name}</span>
                            {sortColumn === column.id && (
                              sortDirection === 'asc' ? 
                                <SortAsc className="w-4 h-4 flex-shrink-0" /> : 
                                <SortDesc className="w-4 h-4 flex-shrink-0" />
                            )}
                          </button>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {COLUMN_TYPES.find(t => t.value === column.type)?.icon}
                          </span>
                        </div>

                        <div className="relative">
                          <button
                            onClick={() => setShowColumnMenu(showColumnMenu === column.id ? null : column.id)}
                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>

                          {showColumnMenu === column.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setShowColumnMenu(null)}></div>
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
                                <button
                                  onClick={() => {
                                    toggleColumnVisibility(column.id);
                                    setShowColumnMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                                >
                                  <EyeOff className="w-4 h-4" />
                                  Ocultar coluna
                                </button>
                                <button
                                  onClick={() => {
                                    deleteColumn(column.id);
                                    setShowColumnMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Excluir coluna
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedRows.map((row) => (
                  <tr 
                    key={row.id} 
                    className={`border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition group ${
                      selectedRows.includes(row.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleRowSelection(row.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-slate-600"
                      />
                    </td>
                    {visibleColumns.map((column) => (
                      <td
                        key={`${row.id}-${column.id}`}
                        className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                      >
                        {column.type === 'checkbox' ? (
                          <input
                            type="checkbox"
                            checked={!!row[column.id]}
                            onChange={() => toggleCheckbox(row.id, column.id)}
                            disabled={column.locked}
                            className="w-5 h-5 rounded border-gray-300 dark:border-slate-600"
                          />
                        ) : editingCell?.rowId === row.id && editingCell?.columnId === column.id ? (
                          <div className="flex items-center gap-2">
                            {column.type === 'select' && column.options ? (
                              <select
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                                className="flex-1 px-2 py-1 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                              >
                                <option value="">Selecione...</option>
                                {column.options.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                                autoFocus
                                className="flex-1 px-2 py-1 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                              />
                            )}
                            <button
                              onClick={saveEdit}
                              className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition flex-shrink-0"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition flex-shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => startEditing(row.id, column.id, row[column.id])}
                            className={`px-2 py-1 -mx-2 -my-1 rounded transition ${
                              column.locked 
                                ? 'cursor-not-allowed opacity-60' 
                                : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {formatCellValue(row[column.id], column)}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => duplicateRow(row.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                          title="Duplicar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRow(row.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedRows.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhuma linha. Clique em "Nova Linha" para começar.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-4 py-3">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 <strong>Dica:</strong> Clique em qualquer célula para editar
        </p>
      </div>
    </div>
  );
}
