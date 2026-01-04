
import React from 'react';
import { AppState, InstrumentStatus } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { AlertTriangle, CheckCircle, PenTool, Trash2, Send } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const stats = [
    { label: '廠內儀器', value: state.instruments.filter(i => i.status === InstrumentStatus.NORMAL).length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
    { label: '出借中', value: state.instruments.filter(i => i.status === InstrumentStatus.LOANED).length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Send },
    { label: '待校正/異常', value: state.instruments.filter(i => i.status === InstrumentStatus.PENDING_CALIBRATION || i.status === InstrumentStatus.REPAIRING).length, color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertTriangle },
    { label: '標準物資過期', value: state.materials.filter(m => m.status === '已過期').length, color: 'text-red-600', bg: 'bg-red-50', icon: Trash2 },
  ];

  const maintenanceByMonth = state.instruments.reduce((acc: any[], inst) => {
    inst.maintenanceLogs.forEach(log => {
      const month = new Date(log.date).toLocaleString('zh-TW', { month: 'short' });
      const existing = acc.find(a => a.name === month);
      if (existing) {
        existing.cost += log.cost;
      } else {
        acc.push({ name: month, cost: log.cost });
      }
    });
    return acc;
  }, []);

  const statusDistribution = [
    { name: '廠內', value: state.instruments.filter(i => i.status === InstrumentStatus.NORMAL).length, color: '#10b981' },
    { name: '出借', value: state.instruments.filter(i => i.status === InstrumentStatus.LOANED).length, color: '#6366f1' },
    { name: '待校正', value: state.instruments.filter(i => i.status === InstrumentStatus.PENDING_CALIBRATION).length, color: '#f59e0b' },
    { name: '維修中', value: state.instruments.filter(i => i.status === InstrumentStatus.REPAIRING).length, color: '#3b82f6' },
    { name: '送校中', value: state.instruments.filter(i => i.status === InstrumentStatus.CALIBRATING).length, color: '#8b5cf6' },
    { name: '報廢', value: state.instruments.filter(i => i.status === InstrumentStatus.SCRAPPED).length, color: '#ef4444' },
  ];
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="list-none space-y-1.5 text-sm">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2 whitespace-nowrap">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-bold text-slate-600">{entry.payload.name}:</span>
            <span className="font-bold text-slate-800">{entry.payload.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 font-medium">{stat.label}</p>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
            <div className={`p-2.5 md:p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-6">年度維修費用統計 (NTD)</h3>
          <div className="h-60 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceByMonth.length ? maintenanceByMonth : [{ name: '尚未記錄', cost: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => `NT$ ${Number(value).toLocaleString()}`} />
                <Bar dataKey="cost" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-6">儀器狀態分佈</h3>
          <div className="h-64 lg:h-64 flex flex-col md:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend content={renderCustomLegend} layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-4">合規性警報</h3>
        <div className="space-y-3">
          {state.instruments.filter(i => i.status === InstrumentStatus.PENDING_CALIBRATION).map(inst => (
            <div key={inst.instrumentNo} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-amber-500" size={20} />
                <div>
                  <p className="text-sm font-semibold text-amber-900">儀器待送校通知</p>
                  <p className="text-xs text-amber-700">{inst.instrumentNo} - {inst.instrumentName} 應於 {inst.nextCalibrationDate} 前完成校正</p>
                </div>
              </div>
            </div>
          ))}
          {state.materials.filter(m => m.status === '已過期').map(mat => (
            <div key={mat.lot} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-500" size={20} />
                <div>
                  <p className="text-sm font-semibold text-red-900">標準物資過期</p>
                  <p className="text-xs text-red-700">{mat.name} 已於 {mat.expiryDate} 過期，嚴禁使用</p>
                </div>
              </div>
            </div>
          ))}
          {!state.instruments.some(i => i.status === InstrumentStatus.PENDING_CALIBRATION) &&
            !state.materials.some(m => m.status === '已過期') && (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle size={48} className="mx-auto mb-2 opacity-20" />
                <p>目前無任何合規性警告</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
