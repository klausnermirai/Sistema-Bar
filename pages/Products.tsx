
import React, { useState } from 'react';
import { useData } from '../services/DataManager';
import { formatCurrency, generateId } from '../utils';
import { Plus, Edit2, Trash2, Tag, Calculator } from 'lucide-react';
import { Product } from '../types';

const Products: React.FC = () => {
  const { products, suppliers, addProduct, updateProduct, deleteProduct } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState = {
    name: '',
    category: 'Doces',
    supplier: '',
    measureUnit: 'Cx',
    packagePrice: '',
    unitsPerPackage: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  const calculateUnitCost = (price: string, qty: string) => {
    const p = parseFloat(price);
    const q = parseInt(qty);
    if (!isNaN(p) && !isNaN(q) && q > 0) return p / q;
    return 0;
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      supplier: product.supplier,
      measureUnit: product.measureUnit,
      packagePrice: product.packagePrice.toString(),
      unitsPerPackage: product.unitsPerPackage.toString(),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(formData.packagePrice);
    const units = parseInt(formData.unitsPerPackage);
    
    if (isNaN(price) || isNaN(units) || units <= 0) return;

    const productData: Product = {
      id: editingId || generateId(),
      name: formData.name.toUpperCase(),
      category: formData.category,
      supplier: formData.supplier.toUpperCase(),
      measureUnit: formData.measureUnit as any,
      packagePrice: price,
      unitsPerPackage: units,
      unitCost: price / units,
    };

    if (editingId) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }

    setFormData(initialFormState);
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Cadastro de Produtos</h2>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData(initialFormState);
            setIsFormOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Novo Produto</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100 animate-fade-in-down">
          <div className="flex items-center space-x-2 mb-4 text-emerald-800">
             <Tag size={20} />
             <h3 className="font-semibold text-lg">{editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
              <input 
                type="text" 
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: COCA COLA LATA"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Unidade Compra</label>
              <select 
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                value={formData.measureUnit}
                onChange={(e) => setFormData({...formData, measureUnit: e.target.value})}
              >
                <option value="Cx">Caixa (Cx)</option>
                <option value="Pct">Pacote (Pct)</option>
                <option value="Fardo">Fardo</option>
                <option value="Kg">Quilo (Kg)</option>
                <option value="Un">Unidade</option>
              </select>
            </div>

            <div className="md:col-span-1">
               <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
               <select
                 className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                 value={formData.category}
                 onChange={(e) => setFormData({...formData, category: e.target.value})}
               >
                 <option value="Doces">Doces</option>
                 <option value="Salgados">Salgados</option>
                 <option value="Bebidas">Bebidas</option>
                 <option value="Outros">Outros</option>
               </select>
            </div>

             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Fornecedor</label>
              <select 
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              >
                <option value="">Selecione...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço da Embalagem ({formData.measureUnit})</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.packagePrice}
                onChange={(e) => setFormData({...formData, packagePrice: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Qtd. na Embalagem</label>
              <input 
                type="number" 
                min="1"
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.unitsPerPackage}
                onChange={(e) => setFormData({...formData, unitsPerPackage: e.target.value})}
                placeholder="Ex: 12"
              />
            </div>

            <div className="md:col-span-2 bg-emerald-50 rounded-lg p-2 flex items-center justify-between border border-emerald-100 h-[42px]">
               <div className="flex items-center text-emerald-800 text-sm">
                 <Calculator size={16} className="mr-2" />
                 <span>Custo Unitário:</span>
               </div>
               <span className="font-bold text-emerald-700 text-lg">
                 {formatCurrency(calculateUnitCost(formData.packagePrice, formData.unitsPerPackage))}
               </span>
            </div>

            <div className="md:col-span-6 flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-100">
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
                {editingId ? 'Atualizar Produto' : 'Cadastrar Produto'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produto</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fornecedor</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Embalagem</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Preço Pct.</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Qtd. Unit.</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right bg-emerald-50/50">Custo Unit.</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.sort((a,b) => a.name.localeCompare(b.name)).map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-800">{product.name}</div>
                  <div className="text-xs text-slate-500">{product.category}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{product.supplier}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium border border-slate-200">
                    {product.measureUnit}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 text-right">{formatCurrency(product.packagePrice)}</td>
                <td className="px-6 py-4 text-sm text-slate-600 text-right">{product.unitsPerPackage}</td>
                <td className="px-6 py-4 text-sm font-bold text-emerald-700 text-right bg-emerald-50/30">
                  {formatCurrency(product.unitCost)}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => {
                         if(confirm('Tem certeza que deseja excluir este produto?')) deleteProduct(product.id);
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

export default Products;