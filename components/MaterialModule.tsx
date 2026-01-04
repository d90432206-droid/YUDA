
import React, { useState } from 'react';
import { AppState, Material } from '../types';
import { Plus, Search, Calendar, Package, AlertTriangle, Trash, Edit, CheckCircle, X } from 'lucide-react';

interface MaterialModuleProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const MaterialModule: React.FC<MaterialModuleProps> = ({ state, setState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // 權限檢查：必須具備「樣本管理員」或「管理代表」資格
  const canModify = state.currentUser?.qualifications.some(q => q === '樣本管理員' || q === '管理代表');

  const filteredMaterials = state.materials.filter(mat =>
    mat.name.toLowerCase().includes(searchTerm.toLowerCase()) || mat.lot.includes(searchTerm)
  );

  const handleSaveMaterial = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canModify) return alert('權限不足：您必須具備「樣本管理員」資格方可執行此操作');

    const formData = new FormData(e.currentTarget);
    const lot = formData.get('lot') as string;
    const name = formData.get('name') as string;
    const expiryDate = formData.get('expiryDate') as string;
    const isExpired = new Date(expiryDate) < new Date();

    const newMaterial: Material = {
      lot,
      name,
      purchaseDate: formData.get('purchaseDate') as string,
      expiryDate: expiryDate,
      stock: parseInt(formData.get('stock') as string),
      status: isExpired ? '已過期' : '正常'
    };

    setState(prev => {
      const updatedNames = prev.materialNames.includes(name)
        ? prev.materialNames
        : [...prev.materialNames, name];

      const exists = prev.materials.find(m => m.lot === lot);
      if (editingMaterial || exists) {
        return {
          ...prev,
          materialNames: updatedNames,
          materials: prev.materials.map(m => m.lot === (editingMaterial?.lot || lot) ? newMaterial : m)
        };
      } else {
        return {
          ...prev,
          materialNames: updatedNames,
          materials: [...prev.materials, newMaterial]
        };
      }
    });

    setIsFormOpen(false);
    setEditingMaterial(null);
  };

  const handleDelete = (lot: string) => {
    if (!canModify) return alert('權限不足：您必須具備「樣本管理員」資格方可執行此操作');
    if (confirm('確定要刪除此物資資料嗎？')) {
      setState(prev => ({
        ...prev,
        materials: prev.materials.filter(m => m.lot !== lot)
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">介質管理模組</h2>
          <p className="text-slate-500 text-sm italic">監控標準品效期與批號(Lot)庫存，僅限樣本管理員操作</p>
        </div>

        {canModify && (
          <button
            onClick={() => { setEditingMaterial(null); setIsFormOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-medium shadow-lg shadow-indigo-100"
          >
            <Plus size={18} />
            購入新物資
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="搜尋物資名稱或批號..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">物資名稱 / 批號(Lot)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">庫存量</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">購入日期</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">有效期限</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">合規狀態</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMaterials.map((mat) => {
                const isExpired = mat.status === '已過期';
                return (
                  <tr key={mat.lot} className={`hover:bg-slate-50 transition-colors ${isExpired ? 'bg-red-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isExpired ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                          <Package size={16} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{mat.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">{mat.lot}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">
                      {mat.stock} units
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {mat.purchaseDate}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-slate-800'}`}>
                        {mat.expiryDate}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isExpired ? (
                        <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold">
                          <AlertTriangle size={14} />
                          已過期，嚴禁使用
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                          <CheckCircle size={14} />
                          合規使用中
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {canModify && (
                          <>
                            <button
                              onClick={() => { setEditingMaterial(mat); setIsFormOpen(true); }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(mat.lot)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                            >
                              <Trash size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-0 lg:p-4">
          <div className="bg-white w-full lg:max-w-md h-full lg:h-auto lg:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">{editingMaterial ? '編輯物資資料' : '購入新物資'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:bg-white rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveMaterial} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">批號 (LOT)</label>
                <input name="lot" defaultValue={editingMaterial?.lot} readOnly={!!editingMaterial} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">物資名稱</label>
                <div className="relative">
                  <input
                    name="name"
                    list="material-names-list"
                    defaultValue={editingMaterial?.name}
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <datalist id="material-names-list">
                    {state.materialNames.map(name => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">購入日期</label>
                  <input type="date" name="purchaseDate" defaultValue={editingMaterial?.purchaseDate} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">有效期限</label>
                  <input type="date" name="expiryDate" defaultValue={editingMaterial?.expiryDate} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">目前庫存</label>
                <input type="number" name="stock" defaultValue={editingMaterial?.stock} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">取消</button>
                <button type="submit" className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">儲存物資</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialModule;
