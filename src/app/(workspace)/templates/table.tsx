"use client";

import { useState } from 'react';
import { 
  Plus, Trash2, Edit2, Check, X, Download, Upload,
  Filter, Search, SortAsc, SortDesc, Copy, Eye,
  EyeOff, Lock, MoreVertical, Grid3x3, ChevronDown
} from 'lucide-react';

type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'url';

type Column = {
  id: string;
  name: string;
  type: ColumnType;
  width?: number;
  visible: boolean;
  locked: boolean;
  options?: string[]; // Para tipo 'select'
};

type TableRow = {
  id: number;
  [key: string]: any;
};

const COLUMN_TYPES = [
  { value: 'text', label: 'Texto', icon: '📝' },
  { value: 'number', label: 'Número', icon: '🔢' },
  { value: 'date', label: 'Data', icon: '📅' },
  { value: 'select', label: 'Seleção', icon: '📋' },
  { value: 'checkbox', label: 'Checkbox', icon: '✅' },
  { value: 'url', label: 'Link', icon: '🔗' },
];

export default function TableTemplate() {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'col1', name: 'Nome', type: 'text', visible: true, locked: false },
    { id: 'col2', name: 'Email', type: 'text', visible: true, locked: false },
    { id: 'col3', name: 'Cargo', type: 'text', visible: true, locked: false },
    { id: 'col4', name: 'Status', type: 'select', visible: true, locked: false, options: ['Ativo', 'Inativo', 'Férias'] },
    { id: 'col5', name: 'Salário', type: 'number', visible: true, locked: false },
    { id: 'col6', name: 'Data Admissão', type: 'date', visible: true, locked: false },
  ]);

  const [rows, setRows] = useState<TableRow[]>([
    { 
      id: 1, 
      col1: 'João Silva', 
      col2: 'joao@email.com', 
      col3: 'Desenvolvedor', 
      col4: 'Ativo',
      col5: '8000',
      col6: '2024-01-15'
    },
    { 
      id: 2, 
      col1: 'Maria Santos', 
      col2: 'maria@email.com', 
      col3: 'Designer', 
      col4: 'Ativo',
      col5: '7500',
      col6: '2024-02-20'
    },
    { 
      id: 3, 
      col1: 'Pedro Costa', 
      col2: 'pedro@email.com', 
      col3: 'Product Manager', 
      col4: 'Férias',
      col5: '9000',
      col6: '2023-11-10'
    },
  ]);

  const [editingCell, setEditingCell] = useState<{ rowId: number; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const [newColumn, setNewColumn] = useState({
    name: '',
    type: 'text' as ColumnType,
    options: '',
  });

  const addRow = () => {
    const newRow: TableRow = { id: Date.now() };
    columns.forEach(col => {
      if (col.type === 'checkbox') {
        newRow[col.id] = false;
      } else {
        newRow[col.id] = '';
      }
    });
    setRows([...rows, newRow]);
  };

  const deleteRow = (id: number) => {
    if (confirm('Excluir esta linha?')) {
      setRows(rows.filter(row => row.id !== id));
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    }
  };

  const deleteSelectedRows = () => {
    if (selectedRows.length === 0) return;
    if (confirm(`Excluir ${selectedRows.length} linha(s) selecionada(s)?`)) {
      setRows(rows.filter(row => !selectedRows.includes(row.id)));
      setSelectedRows([]);
    }
  };

  const duplicateRow = (rowId: number) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;
    
    const newRow = { ...row, id: Date.now() };
    setRows([...rows, newRow]);
  };

  const addColumn = () => {
    if (!newColumn.name.trim()) return;

    const col: Column = {
      id: `col${Date.now()}`,
      name: newColumn.name,
      type: newColumn.type,
      visible: true,
      locked: false,
      options: newColumn.type === 'select' ? newColumn.options.split(',').map(o => o.trim()).filter(o => o) : undefined,
    };

    setColumns([...columns, col]);
    setRows(rows.map(row => ({ 
      ...row, 
      [col.id]: col.type === 'checkbox' ? false : '' 
    })));
    
    setNewColumn({ name: '', type: 'text', options: '' });
    setShowAddColumn(false);
  };

  const deleteColumn = (columnId: string) => {
    if (confirm('Excluir esta coluna?')) {
      setColumns(columns.filter(col => col.id !== columnId));
      setRows(rows.map(row => {
        const newRow = { ...row };
        delete newRow[columnId];
        return newRow;
      }));
    }
  };

  const toggleColumnVisibility = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const startEditing = (rowId: number, columnId: string, currentValue: any) => {
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

      setRows(rows.map(row =>
        row.id === editingCell.rowId
          ? { ...row, [editingCell.columnId]: value }
          : row
      ));
      setEditingCell(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const toggleCheckbox = (rowId: number, columnId: string) => {
    setRows(rows.map(row =>
      row.id === rowId
        ? { ...row, [columnId]: !row[columnId] }
        : row
    ));
  };

  const toggleRowSelection = (rowId: number) => {
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

  // Filtros e ordenação
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
      
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
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
      return <span className="text-gray-400 italic">Vazio</span>;
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
          className="text-blue-600 dark:text-blue-400 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </a>
      );
    }

    return value.toString();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Planilha</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredAndSortedRows.length} {filteredAndSortedRows.length === 1 ? 'linha' : 'linhas'} • {visibleColumns.length} {visibleColumns.length === 1 ? 'coluna' : 'colunas'}
              {selectedRows.length > 0 && ` • ${selectedRows.length} selecionada(s)`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <button
                onClick={deleteSelectedRows}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
              >
                Excluir ({selectedRows.length})
              </button>
            )}
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition font-medium flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
            <button
              onClick={addRow}
              className="px-4 py-2 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Linha
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar em todas as colunas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
            />
          </div>

          {showAddColumn ? (
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
              <input
                type="text"
                value={newColumn.name}
                onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                placeholder="Nome da coluna"
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              />
              <select
                value={newColumn.type}
                onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value as ColumnType })}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
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
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              )}
              <button
                onClick={addColumn}
                className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setShowAddColumn(false);
                  setNewColumn({ name: '', type: 'text', options: '' });
                }}
                className="p-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddColumn(true)}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition font-medium whitespace-nowrap"
            >
              + Coluna
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950 p-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
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

      {/* Footer Tip */}
      <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-6 py-3">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 <strong>Dica:</strong> Clique em qualquer célula para editar • Use os menus das colunas para ordenar e filtrar
        </p>
      </div>
    </div>
  );
}