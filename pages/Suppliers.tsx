
import React, { useState } from 'react';
import { useData } from '../services/DataManager';
import { generateId } from '../utils';
import { Plus, Edit2, Trash2, Truck } from 'lucide-react';
import { Supplier } from '../types';

const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState = {
    name: '',
    contact: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setFormData({
      name: supplier.name,
      contact: supplier.contact || '',
      notes: supplier.notes || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) return;

    const supplierData: Supplier = {
      id: editingId || generateId(),
      name: formData.name.toUpperCase(),
      contact: formData.contact,
      notes: formData.notes,
    };

    if (editingId) {
      updateSupplier(supplierData);
    } else {
      addSupplier(supplierData);
    }

    setFormData(initialFormState);
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Fornecedores</h2>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData(initialFormState);
            setIsFormOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Novo Fornecedor</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100 animate-fade-in-down">
          <div className="flex items-center space-x-2 mb-4 text-emerald-800">
             <Truck size={20} />
             <h3 className="font-semibold text-lg">{editingId ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Fornecedor</label>
              <input 
                type="text" 
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: LUIS DOCE"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contato (Tel/Email)</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
              <textarea 
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="md:col-span-2 flex justify-end space-x-2 mt-2 pt-2 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Obs</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.sort((a,b) => a.name.localeCompare(b.name)).map((supplier) => (
              <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-800">{supplier.name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{supplier.contact || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-500 italic truncate max-w-xs">{supplier.notes || '-'}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <button 
                      onClick={() => handleEdit(supplier)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => {
                         if(confirm('Deseja excluir este fornecedor? Produtos associados manterão o nome mas perderão o vínculo.')) deleteSupplier(supplier.id);
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Suppliers;
