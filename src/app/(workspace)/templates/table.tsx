"use client";

import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

type TableRow = {
  id: number;
  [key: string]: any;
};

export default function TableTemplate() {
  const [columns, setColumns] = useState<string[]>(['Nome', 'Email', 'Cargo', 'Status']);
  const [rows, setRows] = useState<TableRow[]>([
    { id: 1, Nome: 'João Silva', Email: 'joao@email.com', Cargo: 'Desenvolvedor', Status: 'Ativo' },
    { id: 2, Nome: 'Maria Santos', Email: 'maria@email.com', Cargo: 'Designer', Status: 'Ativo' },
    { id: 3, Nome: 'Pedro Costa', Email: 'pedro@email.com', Cargo: 'Product Manager', Status: 'Inativo' },
  ]);

  const [editingCell, setEditingCell] = useState<{ rowId: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const addRow = () => {
    const newRow: TableRow = { id: Date.now() };
    columns.forEach(col => {
      newRow[col] = '';
    });
    setRows([...rows, newRow]);
  };

  const deleteRow = (id: number) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const addColumn = () => {
    if (!newColumnName.trim()) return;
    
    setColumns([...columns, newColumnName]);
    setRows(rows.map(row => ({ ...row, [newColumnName]: '' })));
    setNewColumnName('');
    setShowAddColumn(false);
  };

  const deleteColumn = (columnName: string) => {
    setColumns(columns.filter(col => col !== columnName));
    setRows(rows.map(row => {
      const newRow = { ...row };
      delete newRow[columnName];
      return newRow;
    }));
  };

  const startEditing = (rowId: number, column: string, currentValue: any) => {
    setEditingCell({ rowId, column });
    setEditValue(currentValue?.toString() || '');
  };

  const saveEdit = () => {
    if (editingCell) {
      setRows(rows.map(row =>
        row.id === editingCell.rowId
          ? { ...row, [editingCell.column]: editValue }
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          {rows.length} registro{rows.length !== 1 ? 's' : ''}
        </div>
        
        <div className="flex items-center gap-2">
          {showAddColumn ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addColumn()}
                placeholder="Nome da coluna"
                autoFocus
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <button
                onClick={addColumn}
                className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setShowAddColumn(false);
                  setNewColumnName('');
                }}
                className="p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddColumn(true)}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              + Coluna
            </button>
          )}
          
          <button
            onClick={addRow}
            className="px-4 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Adicionar Linha
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-900 group"
                  >
                    <div className="flex items-center justify-between">
                      <span>{column}</span>
                      <button
                        onClick={() => deleteColumn(column)}
                        className="opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  {columns.map((column) => (
                    <td
                      key={`${row.id}-${column}`}
                      className="px-4 py-3 text-sm text-gray-900"
                    >
                      {editingCell?.rowId === row.id && editingCell?.column === column ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                            autoFocus
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                          <button
                            onClick={saveEdit}
                            className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => startEditing(row.id, column, row[column])}
                          className="cursor-pointer hover:bg-gray-100 px-2 py-1 -mx-2 -my-1 rounded transition"
                        >
                          {row[column] || <span className="text-gray-400">Vazio</span>}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhum registro. Clique em "Adicionar Linha" para começar.</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-sm text-gray-600">
        💡 Clique em qualquer célula para editar
      </div>
    </div>
  );
}