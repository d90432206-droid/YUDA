
import React, { useState } from 'react';
import { AppState, User, TrainingRecord } from '../types';
import { TRAINING_REQUIREMENTS, TRAINING_COURSES } from '../constants';
import { User as UserIcon, ShieldCheck, Trash, Edit, Plus, X, Key, BadgeCheck, Tag, Award, BookOpen, Clock, Calendar, GraduationCap, AlertCircle, Briefcase, ChevronRight, CheckCircle2, List, Printer } from 'lucide-react';

interface PersonnelModuleProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const QUAL_PRESETS = [
  '管理代表',
  '技術主管',
  '品質主管',
  '儀器管理員',
  '樣本管理員',
  '技術員',
  '報告簽署人',
  '內部稽核員'
];

const PersonnelModule: React.FC<PersonnelModuleProps> = ({ state, setState }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [tempQuals, setTempQuals] = useState<string[]>([]);

  const [qualInput, setQualInput] = useState('');
  const [activeModalTab, setActiveModalTab] = useState<'basic' | 'training'>('basic');
  const [selectedCourseCategory, setSelectedCourseCategory] = useState<string>('');
  const [selectedPredefinedCourse, setSelectedPredefinedCourse] = useState<string>('');

  const canModify = state.currentUser?.qualifications.includes('管理代表');

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setTempQuals(user.qualifications || []);
    setIsFormOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setTempQuals([]);
    setIsFormOpen(true);
  };

  const handleAddQual = (qual: string) => {
    const trimmed = qual.trim();
    if (trimmed && !tempQuals.includes(trimmed)) {
      setTempQuals([...tempQuals, trimmed]);
      setQualInput('');
    }
  };

  const removeQual = (idx: number) => {
    setTempQuals(tempQuals.filter((_, i) => i !== idx));
  };

  const handleAddTrainingLog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.currentTarget);
    const newRecord: TrainingRecord = {
      id: `t-${Date.now()}`,
      type: formData.get('type') as '內訓' | '外訓',
      courseName: formData.get('courseName') as string,
      provider: formData.get('provider') as string,
      hours: parseFloat(formData.get('hours') as string),
      date: formData.get('date') as string,
      expiryDate: formData.get('expiryDate') as string,
      retrainingDate: formData.get('retrainingDate') as string,
    };

    const updatedUser = {
      ...editingUser,
      trainingLogs: [newRecord, ...editingUser.trainingLogs]
    };

    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.username === editingUser.username ? updatedUser : u)
    }));

    setEditingUser(updatedUser);
    e.currentTarget.reset();
  };

  const handleSaveUserBasic = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;

    const newUser: User = {
      username,
      name: formData.get('name') as string,
      password: (formData.get('password') as string) || editingUser?.password || '1111',
      qualifications: tempQuals,
      trainingLogs: editingUser ? editingUser.trainingLogs : []
    };

    setState(prev => {
      const exists = prev.users.find(u => u.username === username);
      if (editingUser || exists) {
        return {
          ...prev,
          users: prev.users.map(u => u.username === (editingUser?.username || username) ? newUser : u)
        };
      } else {
        return {
          ...prev,
          users: [...prev.users, newUser]
        };
      }
    });

    if (!editingUser) {
      setIsFormOpen(false);
    } else {
      setEditingUser(newUser);
      alert('人員基本資訊與資格已儲存');
    }
  };

  const handleDelete = (username: string) => {
    if (username === 'admin') return alert('系統管理員帳號不可刪除');
    if (!canModify) return alert('權限不足');
    if (confirm(`確定要刪除人員 ${username} 嗎？`)) {
      setState(prev => ({
        ...prev,
        users: prev.users.filter(u => u.username !== username)
      }));
    }
  };

  const getTrainingStats = (logs: TrainingRecord[]) => {
    const currentYear = new Date().getFullYear();
    const currentYearLogs = logs.filter(l => new Date(l.date).getFullYear() === currentYear);

    const internal = currentYearLogs.filter(l => l.type === '內訓').reduce((sum, l) => sum + l.hours, 0);
    const external = currentYearLogs.filter(l => l.type === '外訓').reduce((sum, l) => sum + l.hours, 0);

    return {
      internal,
      external,
      internalGap: Math.max(0, TRAINING_REQUIREMENTS.INTERNAL - internal),
      externalGap: Math.max(0, TRAINING_REQUIREMENTS.EXTERNAL - external),
      internalProgress: Math.min(100, (internal / TRAINING_REQUIREMENTS.INTERNAL) * 100),
      externalProgress: Math.min(100, (external / TRAINING_REQUIREMENTS.EXTERNAL) * 100)
    };
  };

  const checkTrainingStatus = (records: TrainingRecord[]) => {
    if (records.length === 0) return '尚未安排教育訓練';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let status = '合規';

    for (const record of records) {
      const expiry = new Date(record.expiryDate);
      const retrain = new Date(record.retrainingDate);
      if (expiry < today || retrain < today) return '過期';
    }
    return status;
  };

  const handlePrintAnnualPlan = () => {
    const currentYear = new Date().getFullYear();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>年度教育訓練計畫 - ${currentYear}</title>
          <style>
            @page { size: A4 landscape; margin: 15mm; }
            body { font-family: "Microsoft JhengHei", sans-serif; color: #1e293b; line-height: 1.4; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; border-bottom: 2px solid #000; display: inline-block; padding-bottom: 5px; }
            .meta { margin-top: 10px; font-size: 14px; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            th { background: #f8fafc; }
            .stamp-area { margin-top: 40px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center; }
            .stamp-box { border: 1px solid #000; height: 100px; display: flex; flex-direction: column; justify-content: space-between; padding: 5px; }
            .stamp-label { font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 5px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px;">
            <button onclick="window.print()" style="background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">列印計畫表</button>
          </div>
          <div class="header">
            <div class="title">祐大技術顧問股份有限公司 - ${currentYear} 年度教育訓練計畫表 (圖二)</div>
            <div class="meta">計畫日期: ${new Date().toISOString().split('T')[0]}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>姓名</th>
                <th>認可資格</th>
                <th>訓練類型</th>
                <th>課程名稱</th>
                <th>主辦單位</th>
                <th>預定日期</th>
                <th>時數</th>
                <th>備註</th>
              </tr>
            </thead>
            <tbody>
              ${state.users.map(u => `
                <tr>
                  <td rowspan="${Math.max(1, u.trainingLogs.length)}">${u.name}</td>
                  <td rowspan="${Math.max(1, u.trainingLogs.length)}">${u.qualifications.join(', ')}</td>
                  ${u.trainingLogs.length > 0 ? `
                    <td>${u.trainingLogs[0].type}</td>
                    <td>${u.trainingLogs[0].courseName}</td>
                    <td>${u.trainingLogs[0].provider}</td>
                    <td>${u.trainingLogs[0].date}</td>
                    <td>${u.trainingLogs[0].hours}</td>
                    <td></td>
                  ` : '<td colspan="6">尚無計畫</td>'}
                </tr>
                ${u.trainingLogs.slice(1).map(log => `
                  <tr>
                    <td>${log.type}</td>
                    <td>${log.courseName}</td>
                    <td>${log.provider}</td>
                    <td>${log.date}</td>
                    <td>${log.hours}</td>
                    <td></td>
                  </tr>
                `).join('')}
              `).join('')}
            </tbody>
          </table>
          <div class="stamp-area">
            <div class="stamp-box"><div class="stamp-label">管理代表</div></div>
            <div class="stamp-box"><div class="stamp-label">品質主管</div></div>
            <div class="stamp-box"><div class="stamp-label">技術主管</div></div>
            <div class="stamp-box"><div class="stamp-label">核定</div></div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4 lg:space-y-6 text-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-center lg:text-left">實驗室人員能力與訓練管理</h2>
          <p className="text-slate-500 text-xs lg:text-sm italic text-center lg:text-left">整合認可資格授權、內外訓紀錄與法定時數達成率追蹤</p>
        </div>
        {canModify && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handlePrintAnnualPlan}
              className="flex-1 lg:flex-none bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all font-medium shadow-sm text-sm"
            >
              <Printer size={18} />
              列印年度計畫表
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex-1 lg:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all font-medium shadow-lg shadow-indigo-100 text-sm"
            >
              <Plus size={18} />
              新增人員
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">姓名 / 帳號</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">訓練達成率 (Hr)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">認可資格</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">訓練狀態</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {state.users.map((u) => {
                const trainingStatus = checkTrainingStatus(u.trainingLogs);
                const stats = getTrainingStats(u.trainingLogs);

                return (
                  <tr key={u.username} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm shadow-inner">
                          {u.name.substring(0, 1)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5 min-w-[120px]">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">內訓: {stats.internal}h</span>
                          {stats.internalGap > 0 ? (
                            <span className="text-red-500 font-bold">還差 {stats.internalGap}h</span>
                          ) : (
                            <span className="text-emerald-500 font-bold flex items-center gap-0.5"><CheckCircle2 size={10} />達標</span>
                          )}
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${stats.internalProgress}%` }}></div>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">外訓: {stats.external}h</span>
                          {stats.externalGap > 0 ? (
                            <span className="text-amber-600 font-bold">還差 {stats.externalGap}h</span>
                          ) : (
                            <span className="text-emerald-500 font-bold flex items-center gap-0.5"><CheckCircle2 size={10} />達標</span>
                          )}
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${stats.externalProgress}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {u.qualifications.map((q, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold border border-slate-200">
                            {q}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full w-fit ${trainingStatus === '過期' ? 'bg-red-100 text-red-600' :
                        trainingStatus === '待回訓' ? 'bg-amber-100 text-amber-600' :
                          trainingStatus === '尚未安排教育訓練' ? 'bg-slate-100 text-slate-500' :
                            'bg-emerald-100 text-emerald-600'
                        }`}>
                        {trainingStatus === '過期' && <AlertCircle size={12} />}
                        {trainingStatus === '合規' && <BadgeCheck size={12} />}
                        {trainingStatus === '尚未安排教育訓練' && <AlertCircle size={12} />}
                        {trainingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        {canModify && u.username !== 'admin' && (
                          <button
                            onClick={() => handleDelete(u.username)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          >
                            <Trash size={16} />
                          </button>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-5xl h-full md:h-auto md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:max-h-[95vh]">
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserIcon size={18} lg:size={20} />
                </div>
                <div>
                  <h3 className="text-base lg:text-lg font-bold text-slate-800 truncate max-w-[200px] lg:max-w-none">
                    {editingUser ? `人員檔案: ${editingUser.name}` : '新增實驗室人員'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">{editingUser?.username || 'NEW_ACCOUNT'}</p>
                </div>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:bg-white rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10">
              <button
                onClick={() => setActiveModalTab('basic')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeModalTab === 'basic' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <BadgeCheck size={16} /> 基本資料與資格
              </button>
              <button
                onClick={() => editingUser ? setActiveModalTab('training') : alert('請先儲存新人員的基本資料後，再進行訓練登錄')}
                disabled={!editingUser}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeModalTab === 'training' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-slate-500 hover:text-slate-700'} ${!editingUser ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <GraduationCap size={16} /> 教育訓練紀錄
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/30 relative">
              {activeModalTab === 'basic' && (
                <div className="p-4 md:p-6">
                  <form onSubmit={handleSaveUserBasic} className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">帳號 ID</label>
                        <input name="username" defaultValue={editingUser?.username} readOnly={!!editingUser} required className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">真實姓名</label>
                        <input name="name" defaultValue={editingUser?.name} required className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">登入密碼</label>
                        <input name="password" type="password" placeholder={editingUser ? "保留空白則不修改" : "1111"} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">認可資格授權</label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={qualInput}
                          onChange={(e) => setQualInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQual(qualInput))}
                          placeholder="手動輸入資格後按 Enter 或從下方點選..."
                          className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button type="button" onClick={() => handleAddQual(qualInput)} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">新增資格</button>
                      </div>

                      <div className="mb-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">快速點選預設資格:</p>
                        <div className="flex flex-wrap gap-2">
                          {QUAL_PRESETS.map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleAddQual(preset)}
                              className={`px-2 py-1 text-[10px] font-semibold rounded-md border transition-all ${tempQuals.includes(preset)
                                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                                }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2 p-3 bg-white border border-slate-200 rounded-lg min-h-[42px]">
                        {tempQuals.length === 0 && <span className="text-slate-300 text-[10px] italic">尚未授權任何資格</span>}
                        {tempQuals.map((q, i) => (
                          <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[10px] font-bold flex items-center gap-1 group">
                            <ShieldCheck size={10} /> {q}
                            <button type="button" onClick={() => removeQual(i)} className="text-indigo-300 hover:text-red-500 transition-colors"><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
                      <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">儲存基本資訊與資格</button>
                    </div>
                  </form>
                </div>
              )}

              {activeModalTab === 'training' && editingUser && (
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">


                    <div className="lg:col-span-1 space-y-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
                          <Clock size={16} className="text-indigo-500" /> 法定時數統計
                        </h4>
                        {(() => {
                          const stats = getTrainingStats(editingUser.trainingLogs);
                          return (
                            <div className="space-y-5">
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-slate-500">內訓進度 ({stats.internal} / {TRAINING_REQUIREMENTS.INTERNAL}h)</span>
                                  <span className={stats.internalGap === 0 ? 'text-emerald-500' : 'text-blue-600'}>
                                    {stats.internalGap === 0 ? '已達標' : `尚差 ${stats.internalGap}h`}
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${stats.internalProgress}%` }}></div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-slate-500">外訓進度 ({stats.external} / {TRAINING_REQUIREMENTS.EXTERNAL}h)</span>
                                  <span className={stats.externalGap === 0 ? 'text-emerald-500' : 'text-amber-600'}>
                                    {stats.externalGap === 0 ? '已達標' : `尚差 ${stats.externalGap}h`}
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500 transition-all" style={{ width: `${stats.externalProgress}%` }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                          <Plus size={14} className="text-emerald-500" /> 登錄新訓練課程
                        </h4>
                        <form onSubmit={handleAddTrainingLog} className="space-y-4">
                          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1">快速選課 (Course Preset)</label>
                              <select
                                value={selectedCourseCategory}
                                onChange={(e) => {
                                  setSelectedCourseCategory(e.target.value);
                                  setSelectedPredefinedCourse('');
                                }}
                                className="w-full px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                              >
                                <option value="">選擇課程類別...</option>
                                {Object.entries(TRAINING_COURSES).map(([key, val]) => (
                                  <option key={key} value={key}>{val.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1">特定子課程 (Sub-Course)</label>
                              <select
                                disabled={!selectedCourseCategory}
                                value={selectedPredefinedCourse}
                                onChange={(e) => {
                                  const courseName = e.target.value;
                                  setSelectedPredefinedCourse(courseName);
                                  if (courseName && selectedCourseCategory) {
                                    const course = (TRAINING_COURSES as any)[selectedCourseCategory].courses.find((c: any) => c.name === courseName);
                                    if (course) {
                                      const nameInput = document.getElementById('training-course-name') as HTMLInputElement;
                                      const hoursInput = document.getElementById('training-course-hours') as HTMLInputElement;
                                      if (nameInput) nameInput.value = course.name;
                                      if (hoursInput) hoursInput.value = course.hours.toString();
                                    }
                                  }
                                }}
                                className="w-full px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-bold disabled:opacity-50"
                              >
                                <option value="">選擇課程內容...</option>
                                {selectedCourseCategory && (TRAINING_COURSES as any)[selectedCourseCategory].courses.map((c: any) => (
                                  <option key={c.name} value={c.name}>{c.name} ({c.hours}h)</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <select name="type" className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-10">
                              <option value="內訓">內訓 (Internal)</option>
                              <option value="外訓">外訓 (External)</option>
                            </select>
                            <input id="training-course-name" name="courseName" placeholder="課程名稱" required className="sm:col-span-2 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-10" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input name="provider" placeholder="受訓單位" required className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-10" />
                            <div className="relative">
                              <input id="training-course-hours" type="number" step="0.5" name="hours" placeholder="時數" required className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none pr-8 h-10" />
                              <span className="absolute right-3 top-2.5 text-xs text-slate-400">hr</span>
                            </div>
                            <input type="date" name="date" required className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-10" />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="col-span-1">
                              <label className="block text-[10px] font-bold text-slate-400 mb-1">資格期限</label>
                              <input type="date" name="expiryDate" required className="w-full px-3 py-2 text-xs lg:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-10" />
                            </div>
                            <div className="col-span-1">
                              <label className="block text-[10px] font-bold text-slate-400 mb-1">預定回訓日</label>
                              <input type="date" name="retrainingDate" required className="w-full px-3 py-2 text-xs lg:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-10" />
                            </div>
                            <div className="col-span-2 sm:col-span-1 flex items-end">
                              <button type="submit" className="w-full h-10 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md">登錄紀錄</button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <List size={14} /> 歷史受訓紀錄列表 (Historical Training Logs)
                    </h4>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">類型</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">課程名稱</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">受訓單位</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">時數</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">上課日期</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">回訓日期</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">效期期限</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {editingUser.trainingLogs.length > 0 ? (
                            editingUser.trainingLogs.map(log => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const isExpired = new Date(log.expiryDate) < today;
                              const isNeedRetrain = new Date(log.retrainingDate) < today;

                              return (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-3">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${log.type === '外訓' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                      {log.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm font-bold text-slate-800">{log.courseName}</td>
                                  <td className="px-4 py-3 text-xs text-slate-500">{log.provider}</td>
                                  <td className="px-4 py-3 text-xs font-mono text-slate-600">{log.hours} h</td>
                                  <td className="px-4 py-3 text-xs text-slate-500">{log.date}</td>
                                  <td className={`px-4 py-3 text-xs font-bold ${isNeedRetrain ? 'text-amber-600' : 'text-slate-600'}`}>
                                    {log.retrainingDate}
                                    {isNeedRetrain && !isExpired && <span className="ml-1 text-[9px] bg-amber-50 px-1 rounded border border-amber-100">待回訓</span>}
                                  </td>
                                  <td className={`px-4 py-3 text-xs font-bold ${isExpired ? 'text-red-600' : 'text-indigo-600'}`}>
                                    {log.expiryDate}
                                    {isExpired && <span className="ml-1 text-[9px] bg-red-50 px-1 rounded border border-red-100">已失效</span>}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={7} className="text-center py-12 text-slate-400 text-sm italic bg-slate-50/50">
                                尚無任何教育訓練紀錄
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              )}
            </div>

            {/* Modal Footer (for Training Tab or general close) */}
            {activeModalTab === 'training' && (
              <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">關閉</button>
              </div>
            )}
          </div>
        </div>
      )
      }


      {/* Thresholds Block */}
      <div className="bg-slate-800 text-slate-200 p-6 rounded-2xl shadow-xl shadow-slate-200/50">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-400" /> ISO 17025 能力監控門檻 (Thresholds)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold uppercase">內訓訓練要求 (Internal)</p>
            <p className="text-2xl font-bold text-blue-400">{TRAINING_REQUIREMENTS.INTERNAL} <span className="text-xs font-normal text-slate-500">小時 / 年度</span></p>
            <p className="text-xs text-slate-500 italic">適用於實驗室內部技術操作規範、儀器操作 SOP 等。</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold uppercase">外訓訓練要求 (External)</p>
            <p className="text-2xl font-bold text-amber-400">{TRAINING_REQUIREMENTS.EXTERNAL} <span className="text-xs font-normal text-slate-500">小時 / 年度</span></p>
            <p className="text-xs text-slate-500 italic">適用於 ISO 17025 外部訓練課程、認證機構專題等。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonnelModule;
