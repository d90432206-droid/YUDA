
import React, { useState, useEffect } from 'react';
import { AppState, Instrument, InstrumentStatus, MaintenanceRecord, CalibrationRecord } from '../types';
import { Search, Calendar, Filter, Wrench, Trash, Edit, X, Info, Activity, Plus, Award, ShieldCheck, DollarSign, Tag, HardDrive, List, LayoutGrid, CheckCircle2, ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, Send, Clock, Archive, RefreshCcw, History } from 'lucide-react';

interface InstrumentModuleProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

const InstrumentModule: React.FC<InstrumentModuleProps> = ({ state, setState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'plan'>('list');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'basic' | 'calibration' | 'maintenance' | 'loan'>('basic');
  const [planYear, setPlanYear] = useState(new Date().getFullYear());
  const [isLoanFormOpen, setIsLoanFormOpen] = useState(false);
  const [loanTypeFilter, setLoanTypeFilter] = useState<'all' | '單位' | '個人'>('all');
  const [showArchived, setShowArchived] = useState(false);

  const [calFormDate, setCalFormDate] = useState('');
  const [calFormNextDate, setCalFormNextDate] = useState('');
  const [showCalHistory, setShowCalHistory] = useState(false);
  const [showMaintHistory, setShowMaintHistory] = useState(false);
  const purchaseDateRef = React.useRef<HTMLInputElement>(null);
  const purchaseDateTextRef = React.useRef<HTMLInputElement>(null);

  const canModify = state.currentUser?.qualifications.some(q => q === '儀器管理員' || q === '管理代表');

  useEffect(() => {
    setCalFormDate('');
    setCalFormNextDate('');
    setShowCalHistory(false);
    setShowMaintHistory(false);
  }, [editingInstrument]);

  const filteredInstruments = state.instruments.filter(inst => {
    const matchesSearch = inst.instrumentName.toLowerCase().includes(searchTerm.toLowerCase()) || inst.instrumentNo.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || inst.status === statusFilter;
    const isArchived = inst.status === InstrumentStatus.ARCHIVED;

    if (showArchived) {
      // Archive View: Only show archived, ignore status filter (or maybe filter archived items by other criteria if needed, but simple is better)
      return matchesSearch && isArchived;
    } else {
      // Normal View: Hide archived
      return matchesSearch && matchesStatus && !isArchived;
    }

    let matchesLoanType = true;
    if (loanTypeFilter !== 'all') {
      const activeLoan = state.loanRecords.find(l => l.instrumentNo === inst.instrumentNo && l.status === '出借中');
      matchesLoanType = activeLoan?.loanType === loanTypeFilter;
    }

    return matchesSearch && matchesStatus && matchesLoanType;
  });

  const checkIsExpired = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = new Date(dateStr);
    return nextDate < today;
  };

  const handleCalDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    setCalFormDate(dateStr);

    if (dateStr && editingInstrument) {
      const date = new Date(dateStr);
      // ISO 17025 慣例：有效日為 (報告日 + 週期) - 1 天
      date.setMonth(date.getMonth() + editingInstrument.calibrationCycle);
      date.setDate(date.getDate() - 1);
      setCalFormNextDate(date.toISOString().split('T')[0]);
    }
  };

  const handleDelete = (e: React.MouseEvent, instrumentNo: string) => {
    e.stopPropagation();
    if (!canModify) return alert('權限不足');
    if (confirm('確定要將此儀器移至封存區(Archived)嗎？')) {
      const deletedAt = new Date().toISOString();
      const deletedBy = state.currentUser?.name || 'Unknown';

      setState(prev => ({
        ...prev,
        instruments: prev.instruments.map(i => i.instrumentNo === instrumentNo ? { ...i, status: InstrumentStatus.ARCHIVED, deletedAt, deletedBy } : i)
      }));
    }
  };

  const handleHardDelete = (e: React.MouseEvent, inst: Instrument) => {
    e.stopPropagation();
    if (!canModify) return alert('權限不足');

    // Prompt for Instrument ID confirmation
    const confirmId = prompt(`若要永久刪除，請輸入儀器編號 "${inst.instrumentNo}" 以確認：`);
    if (confirmId !== inst.instrumentNo) {
      if (confirmId !== null) alert('儀器編號輸入錯誤，取消刪除。');
      return;
    }

    setState(prev => ({
      ...prev,
      instruments: prev.instruments.filter(i => i.instrumentNo !== inst.instrumentNo),
      deletionLogs: [
        ...prev.deletionLogs || [],
        {
          id: `del-${Date.now()}`,
          instrumentNo: inst.instrumentNo,
          instrumentName: inst.instrumentName,
          deletedAt: new Date().toISOString(),
          deletedBy: state.currentUser?.name || 'Unknown',
          type: 'HARD_DELETE'
        }
      ]
    }));
    alert('儀器已永久刪除');
  };

  const handleRestore = (e: React.MouseEvent, instrumentNo: string) => {
    e.stopPropagation();
    if (!canModify) return alert('權限不足');
    if (confirm('確定要從封存區還原此儀器嗎？')) {
      setState(prev => ({
        ...prev,
        instruments: prev.instruments.map(i => i.instrumentNo === instrumentNo ? { ...i, status: InstrumentStatus.NORMAL, deletedAt: undefined, deletedBy: undefined } : i)
      }));
    }
  };

  const handleOpenEdit = (e: React.MouseEvent, inst: Instrument) => {
    e.stopPropagation();
    if (!canModify) return alert('權限不足');
    setEditingInstrument(inst);
    setActiveModalTab('basic');
    setIsFormOpen(true);
  };

  const handleSaveInstrumentBasic = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const instrumentNo = formData.get('instrumentNo') as string;

    const newInstrument: Instrument = {
      instrumentNo,
      instrumentName: formData.get('instrumentName') as string,
      brand: formData.get('brand') as string,
      model: formData.get('model') as string,
      factoryNo: formData.get('factoryNo') as string,
      purchaseDate: formData.get('purchaseDate') as string,
      purchaseAmount: parseInt(formData.get('purchaseAmount') as string || '0'),
      status: formData.get('status') as InstrumentStatus,
      calibrationCycle: parseInt(formData.get('calibrationCycle') as string || '12'),
      lastCalibrationDate: editingInstrument?.lastCalibrationDate || '',
      nextCalibrationDate: editingInstrument?.nextCalibrationDate || '',
      vendor: editingInstrument?.vendor || '',
      custodian: formData.get('custodian') as string,
      specification: formData.get('specification') as string,
      acceptanceCriteria: formData.get('acceptanceCriteria') as string,
      accessories: formData.get('accessories') as string,
      notes: formData.get('notes') as string,
      maintenanceLogs: editingInstrument ? editingInstrument.maintenanceLogs : [],
      calibrationLogs: editingInstrument ? editingInstrument.calibrationLogs : [],
      loanLogs: editingInstrument ? editingInstrument.loanLogs : []
    };

    setState(prev => {
      const exists = prev.instruments.find(i => i.instrumentNo === instrumentNo);
      if (editingInstrument || exists) {
        return {
          ...prev,
          instruments: prev.instruments.map(i => i.instrumentNo === (editingInstrument?.instrumentNo || instrumentNo) ? newInstrument : i)
        };
      } else {
        return {
          ...prev,
          instruments: [...prev.instruments, newInstrument]
        };
      }
    });

    if (!editingInstrument) {
      setIsFormOpen(false);
    } else {
      setEditingInstrument(newInstrument);
      alert('基本資料已儲存');
    }
  };

  const handleAddCalibrationLog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingInstrument) return;

    const formData = new FormData(e.currentTarget);
    const calDate = calFormDate;
    const nextDate = calFormNextDate;
    const vendor = formData.get('calVendor') as string;

    const newLog: CalibrationRecord = {
      id: `cal-${Date.now()}`,
      date: calDate,
      vendor: vendor,
      certificateNo: formData.get('calCert') as string,
      result: formData.get('calResult') as '合格' | '不合格',
      nextDate: nextDate
    };

    const updatedInstrument = {
      ...editingInstrument,
      lastCalibrationDate: calDate,
      nextCalibrationDate: nextDate,
      vendor: vendor,
      calibrationLogs: [newLog, ...editingInstrument.calibrationLogs]
    };

    setState(prev => ({
      ...prev,
      instruments: prev.instruments.map(i => i.instrumentNo === editingInstrument.instrumentNo ? updatedInstrument : i)
    }));

    setEditingInstrument(updatedInstrument);
    setCalFormDate('');
    setCalFormNextDate('');
    e.currentTarget.reset();
  };

  const handleAddMaintenanceLog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingInstrument) return;

    const formData = new FormData(e.currentTarget);
    const newLog: MaintenanceRecord = {
      id: `log-${Date.now()}`,
      date: formData.get('logDate') as string,
      description: formData.get('logDescription') as string,
      statusBefore: formData.get('logStatusBefore') as string,
      result: formData.get('logResult') as string,
      acceptedBy: formData.get('logAcceptedBy') as string,
      cost: parseInt(formData.get('logCost') as string || '0'),
      notes: formData.get('logNotes') as string
    };

    const updatedInstrument = {
      ...editingInstrument,
      maintenanceLogs: [newLog, ...editingInstrument.maintenanceLogs]
    };

    setState(prev => ({
      ...prev,
      instruments: prev.instruments.map(i => i.instrumentNo === editingInstrument.instrumentNo ? updatedInstrument : i)
    }));

    setEditingInstrument(updatedInstrument);
    e.currentTarget.reset();
  };

  const getStatusStyle = (status: InstrumentStatus) => {
    switch (status) {
      case InstrumentStatus.NORMAL: return 'bg-emerald-100 text-emerald-700';
      case InstrumentStatus.REPAIRING: return 'bg-blue-100 text-blue-700';
      case InstrumentStatus.CALIBRATING: return 'bg-purple-100 text-purple-700';
      case InstrumentStatus.LOANED: return 'bg-indigo-100 text-indigo-700 font-bold';
      case InstrumentStatus.SCRAPPED: return 'bg-slate-100 text-slate-700';
      case InstrumentStatus.PENDING_CALIBRATION: return 'bg-amber-100 text-amber-700 animate-pulse';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getLoanStatusDisplay = (inst: Instrument) => {
    if (inst.status !== InstrumentStatus.LOANED) return null;
    const activeLoan = inst.loanLogs?.find(l => l.status === '出借中');
    if (activeLoan && new Date() > new Date(activeLoan.expectedReturnDate)) {
      return { text: '出借逾期', style: 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' };
    }
    return { text: inst.status, style: getStatusStyle(inst.status) };
  };

  const handleLoanSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingInstrument) return;

    const formData = new FormData(e.currentTarget);
    const newRecord: any = {
      id: `loan-${Date.now()}`,
      instrumentNo: editingInstrument.instrumentNo,
      instrumentName: editingInstrument.instrumentName,
      customerName: formData.get('customerName') as string,
      borrower: formData.get('borrower') as string,
      employeeId: formData.get('employeeId') as string,
      loanType: formData.get('loanType') as '單位' | '個人',
      loanDate: formData.get('loanDate') as string,
      expectedReturnDate: formData.get('expectedReturnDate') as string,
      purpose: formData.get('purpose') as string,
      status: '出借中'
    };

    setState(prev => ({
      ...prev,
      loanRecords: [newRecord, ...prev.loanRecords],
      instruments: prev.instruments.map(i =>
        i.instrumentNo === editingInstrument.instrumentNo
          ? { ...i, status: InstrumentStatus.LOANED, loanLogs: [newRecord, ...(i.loanLogs || [])] }
          : i
      )
    }));

    setEditingInstrument(prev => prev ? { ...prev, status: InstrumentStatus.LOANED, loanLogs: [newRecord, ...(prev.loanLogs || [])] } : null);
    setIsLoanFormOpen(false);
    alert('出借登記成功');
  };

  const handleReturnConfirm = (recordId: string) => {
    if (!editingInstrument) return;
    if (!state.currentUser) {
      alert('錯誤：無法確認操作人員身分 (Current User Not Found)');
      return;
    }
    if (!confirm('確認進行歸還手續？')) return;

    const returnDate = new Date().toISOString().split('T')[0];
    const confirmedBy = state.currentUser.name;

    setState(prev => ({
      ...prev,
      loanRecords: prev.loanRecords.map(r =>
        r.id === recordId ? { ...r, status: '已歸還', actualReturnDate: returnDate, confirmedBy } : r
      ),
      instruments: prev.instruments.map(i =>
        i.instrumentNo === editingInstrument.instrumentNo
          ? {
            ...i,
            status: InstrumentStatus.NORMAL,
            loanLogs: i.loanLogs.map(l => l.id === recordId ? { ...l, status: '已歸還', actualReturnDate: returnDate, confirmedBy } : l)
          }
          : i
      )
    }));

    setEditingInstrument(prev => prev ? {
      ...prev,
      status: InstrumentStatus.NORMAL,
      loanLogs: prev.loanLogs.map(l => l.id === recordId ? { ...l, status: '已歸還', actualReturnDate: returnDate, confirmedBy } : l)
    } : null);
    alert('歸還手續已完成');
  };

  const handlePrintLoanSlip = (record: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>儀器出借單 - ${record.instrumentNo}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: "Microsoft JhengHei", sans-serif; color: #1e293b; line-height: 1.4; }
            .container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px; }
            .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            .header img { height: 50px; margin-bottom: 10px; }
            .company-name { font-size: 24px; font-bold; color: #6366f1; margin: 0; }
            .doc-title { font-size: 26px; font-weight: bold; margin-top: 5px; color: #1e293b; }
            .meta { text-align: right; color: #64748b; font-size: 12px; margin-top: 10px; }
            
            .section-title { font-size: 16px; font-weight: bold; border-left: 4px solid #6366f1; padding-left: 10px; margin-bottom: 15px; margin-top: 30px; background: #f8fafc; padding: 8px 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
            .value { font-size: 16px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; min-height: 24px; }
            
            .footer { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; }
            .sig-box { border-top: 1px solid #94a3b8; padding-top: 10px; margin-top: 40px; text-align: center; }
            .sig-title { font-weight: bold; font-size: 14px; margin-bottom: 40px; }
            
            @media print { 
              .no-print { display: none; } 
              body { -webkit-print-color-adjust: exact; }
              .container { border: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="position: fixed; top: 20px; right: 20px; background: white; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; z-index: 9999;">
            <button onclick="window.print()" style="background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">列印本頁 (Print)</button>
            <button onclick="window.close()" style="background: #f1f5f9; color: #475569; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-left: 10px;">關閉 (Close)</button>
          </div>

          <div class="container">
            <div class="header">
              <div class="company-name">祐大技術顧問股份有限公司</div>
              <div class="doc-title">儀器出借管理單</div>
              <div class="meta">單據編號: ${record.id} &nbsp;|&nbsp; 列印日期: ${new Date().toISOString().split('T')[0]}</div>
            </div>
            
            <div class="section-title">設備與借用資訊</div>
            <div class="grid">
              <div class="field">
                <div class="label">儀器名稱 (Instrument)</div>
                <div class="value">${record.instrumentName}</div>
              </div>
              <div class="field">
                <div class="label">儀器編號 (Instrument No)</div>
                <div class="value">${record.instrumentNo}</div>
              </div>
              <div class="field">
                <div class="label">出借類型 (Type)</div>
                <div class="value">${record.loanType}出借</div>
              </div>
              <div class="field">
                <div class="label">用途 (Purpose)</div>
                <div class="value">${record.purpose}</div>
              </div>
            </div>

            <div class="section-title">借用人/單位詳情</div>
            <div class="grid">
               <div class="field" style="grid-column: span 2;">
                <div class="label">客戶/單位名稱 (Customer/Dept)</div>
                <div class="value">${record.customerName}</div>
              </div>
              <div class="field">
                <div class="label">借用人姓名 (Borrower)</div>
                <div class="value">${record.borrower}</div>
              </div>
              <div class="field">
                <div class="label">公司經辦人 (Handler)</div>
                <div class="value">${record.employeeId}</div>
              </div>
            </div>

            <div class="section-title">日期與期限</div>
             <div class="grid">
              <div class="field">
                <div class="label">借出日期 (Loan Date)</div>
                <div class="value">${record.loanDate}</div>
              </div>
              <div class="field">
                <div class="label">預計歸還 (Expected Return)</div>
                <div class="value">${record.expectedReturnDate}</div>
              </div>
            </div>

            <div class="footer">
              <div class="sig-box">
                <div class="sig-title">借用人簽署 (Sign)</div>
              </div>
              <div class="sig-box">
                <div class="sig-title">經辦人覆核 (Check)</div>
              </div>
              <div class="sig-box">
                <div class="sig-title">單位主管核准 (Approve)</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight text-center lg:text-left">儀器設備管理模組</h2>
          <p className="text-slate-500 text-xs lg:text-sm italic text-center lg:text-left">管理實驗室設備之購入資訊、廠牌型號與校正履歷</p>
        </div>
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 lg:gap-3">
          <div className="bg-white p-1 rounded-lg border border-slate-200 flex shadow-sm w-full md:w-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <List size={16} /> <span className="sm:inline">列表清單</span>
            </button>
            <button
              onClick={() => setViewMode('plan')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'plan' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutGrid size={16} /> <span className="sm:inline">年度送校</span>
            </button>
          </div>
          {canModify && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => { setShowArchived(!showArchived); setViewMode('list'); }}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all font-medium border ${showArchived ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                <Archive size={18} />
                {showArchived ? '返回' : '封存'}
              </button>
              <button
                onClick={() => {
                  setEditingInstrument(null);
                  setActiveModalTab('basic');
                  setIsFormOpen(true);
                }}
                className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all font-medium shadow-lg shadow-indigo-100"
              >
                <Plus size={18} />
                新增儀器
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-3 lg:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 lg:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="搜尋名稱、編號..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm lg:text-base text-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
          <select
            className="px-3 md:px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs lg:text-sm font-medium text-slate-700 h-10"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">所有狀態</option>
            {Object.values(InstrumentStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="px-3 md:px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs lg:text-sm font-medium text-slate-700 h-10"
            value={loanTypeFilter}
            onChange={(e) => setLoanTypeFilter(e.target.value as any)}
          >
            <option value="all">所有出借</option>
            <option value="單位">單位出借</option>
            <option value="個人">個人出借</option>
          </select>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">儀器編號 / 名稱</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">廠牌 / 型號</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">週期(月)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">狀態</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{showArchived ? '封存日期' : '下次校正日'}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInstruments.map((inst) => {
                  const isExpired = checkIsExpired(inst.nextCalibrationDate);
                  return (
                    <tr
                      key={inst.instrumentNo}
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                      onClick={(e) => canModify ? handleOpenEdit(e, inst) : setSelectedInstrument(inst)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 border-b border-indigo-100 pb-1 mb-1">{inst.instrumentNo}</div>
                        <div className="text-xs text-slate-500 font-medium">{inst.instrumentName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 font-medium">{inst.brand}</div>
                        <div className="text-xs text-slate-400 italic">{inst.model}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-500 text-center">
                        {inst.calibrationCycle}
                      </td>
                      <td className="px-6 py-4">
                        {inst.status === InstrumentStatus.LOANED ? (
                          (() => {
                            const loanStatus = getLoanStatusDisplay(inst);
                            return (
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${loanStatus?.style}`}>
                                {loanStatus?.text}
                              </span>
                            );
                          })()
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusStyle(inst.status)}`}>
                            {inst.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {showArchived ? (
                          <div className="flex items-center gap-2 text-sm text-slate-500 font-mono">
                            <History size={14} />
                            {inst.deletedAt?.split('T')[0] || '-'}
                            <span className="text-[10px] bg-slate-100 px-1 rounded">{inst.deletedBy}</span>
                          </div>
                        ) : (
                          <div className={`flex items-center gap-2 text-sm font-bold ${isExpired ? 'text-red-600' : 'text-slate-600'}`}>
                            <Calendar size={14} className={isExpired ? 'text-red-600' : 'text-slate-400'} />
                            {inst.nextCalibrationDate || '尚未校正'}
                            {isExpired && <span className="text-[10px] bg-red-50 px-1.5 py-0.5 rounded border border-red-200 flex items-center gap-0.5 font-bold animate-pulse"><AlertCircle size={10} />過期</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedInstrument(inst)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                            title="詳情"
                          >
                            <Info size={16} />
                          </button>
                          {canModify && (
                            showArchived ? (
                              <>
                                <button
                                  onClick={(e) => handleRestore(e, inst.instrumentNo)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                                  title="還原"
                                >
                                  <RefreshCcw size={16} />
                                </button>
                                <button
                                  onClick={(e) => handleHardDelete(e, inst)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                  title="永久刪除"
                                >
                                  <Trash size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => handleOpenEdit(e, inst)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                                  title="編輯"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={(e) => handleDelete(e, inst.instrumentNo)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                  title="封存"
                                >
                                  <Archive size={16} />
                                </button>
                              </>
                            )
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
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 text-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold">年度送校與到期計畫</h3>
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 border border-slate-200">
                <button onClick={() => setPlanYear(p => p - 1)} className="p-1 hover:bg-white rounded transition-all text-slate-500"><ChevronLeft size={16} /></button>
                <span className="text-sm font-bold px-4">{planYear} 年度</span>
                <button onClick={() => setPlanYear(p => p + 1)} className="p-1 hover:bg-white rounded transition-all text-slate-500"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <div className="w-3 h-3 bg-indigo-500 rounded flex items-center justify-center"><Send size={8} className="text-white" /></div> 預計送校月
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <div className="w-3 h-3 bg-amber-500 rounded flex items-center justify-center"><Clock size={8} className="text-white" /></div> 預計到期月
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <div className="w-3 h-3 bg-red-600 rounded flex items-center justify-center animate-pulse"><AlertCircle size={8} className="text-white" /></div> 已過期
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-500 uppercase sticky left-0 z-10 w-[240px]">儀器名稱 / 編號</th>
                  {MONTHS.map(m => (
                    <th key={m} className="p-2 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-500 text-center">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInstruments.map(inst => {
                  const nextDateObj = inst.nextCalibrationDate ? new Date(inst.nextCalibrationDate) : null;
                  if (!nextDateObj) return null;

                  const expiryYear = nextDateObj.getFullYear();
                  const expiryMonth = (nextDateObj.getMonth() + 1).toString().padStart(2, '0');
                  const isExpired = checkIsExpired(inst.nextCalibrationDate);

                  // 計算送校月 (到期前一個月)
                  const sendDateObj = new Date(nextDateObj);
                  sendDateObj.setMonth(sendDateObj.getMonth() - 1);
                  const sendYear = sendDateObj.getFullYear();
                  const sendMonth = (sendDateObj.getMonth() + 1).toString().padStart(2, '0');

                  return (
                    <tr key={inst.instrumentNo} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2 border border-slate-200 sticky left-0 bg-white z-10">
                        <p className="text-xs font-bold text-slate-800 truncate">{inst.instrumentName}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{inst.instrumentNo}</p>
                      </td>
                      {MONTHS.map(m => {
                        const isSendMonth = sendYear === planYear && sendMonth === m;
                        const isExpiryMonth = expiryYear === planYear && expiryMonth === m;

                        return (
                          <td key={m} className="p-2 border border-slate-200 text-center relative h-[60px] hover:z-20 bg-white hover:shadow-md transition-all">
                            {isSendMonth && (
                              <div className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg shadow-sm group relative bg-indigo-500 text-white transition-transform hover:scale-110">
                                <Send size={16} />
                                <div className="absolute -top-1 -right-1 bg-white border border-indigo-200 rounded-full w-4 h-4 flex items-center justify-center">
                                  <span className="text-[8px] text-indigo-600 font-bold font-mono">P</span>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] hidden group-hover:block z-50">
                                  <div className="bg-slate-800 text-white text-xs rounded py-1 px-2 shadow-xl whitespace-nowrap">
                                    <div className="font-bold mb-0.5">預計送校</div>
                                    <div className="opacity-80 font-mono">{inst.nextCalibrationDate}</div>
                                  </div>
                                  {/* Triangle pointer */}
                                  <div className="w-2 h-2 bg-slate-800 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                                </div>
                              </div>
                            )}

                            {isExpiryMonth && (
                              <div className={`w-10 h-10 mx-auto flex items-center justify-center rounded-lg shadow-sm group relative transition-transform hover:scale-110 ${isExpired ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500 text-white'}`}>
                                <div className="text-center">
                                  <span className="text-[10px] font-bold block leading-none">{nextDateObj.getDate()}</span>
                                  <span className="text-[7px] block font-black uppercase mt-0.5 tracking-tighter">{isExpired ? '過期' : '到期'}</span>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] hidden group-hover:block z-50">
                                  <div className="bg-slate-900/95 text-white text-[9px] rounded py-1.5 px-3 whitespace-nowrap shadow-xl border border-slate-700">
                                    <p className="font-bold">有效期限日: {inst.nextCalibrationDate}</p>
                                    {isExpired ? (
                                      <p className="text-red-300 font-black flex items-center gap-1"><AlertCircle size={10} />狀態: 已過期</p>
                                    ) : (
                                      <p className="text-amber-300 font-bold flex items-center gap-1"><Clock size={10} />狀態: 預計本月失效</p>
                                    )}
                                  </div>
                                  {/* Triangle pointer */}
                                  <div className="w-2 h-2 bg-slate-900/95 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-3">
              <div className="p-1.5 bg-indigo-600 text-white rounded shadow-sm"><Send size={14} /></div>
              <div className="text-xs text-indigo-900 leading-relaxed">
                <p className="font-bold mb-1">預計送校計畫 (Preparation)</p>
                <p className="opacity-70">系統自動依據到期月份「提前一個月」標記。此為緩衝期，建議於此月份完成報價與排程。</p>
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
              <div className="p-1.5 bg-amber-500 text-white rounded shadow-sm"><Clock size={14} /></div>
              <div className="text-xs text-amber-900 leading-relaxed">
                <p className="font-bold mb-1">有效期限警示 (Deadlines)</p>
                <p className="opacity-70">標註當月儀器即將失效。若顯示為紅色，則代表當前日期已超過該有效日且尚未更新證書。</p>
              </div>
            </div>
          </div>
        </div>
      )
      }

      {/* Form Modal */}
      {
        isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full max-w-4xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full md:h-[85vh]">
              <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingInstrument ? `編輯儀器: ${editingInstrument.instrumentName}` : '新增儀器資產'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:bg-white rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Top Navigation Tabs */}
              <div className="flex border-b border-slate-100 bg-white px-6">
                <button
                  onClick={() => setActiveModalTab('basic')}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-bold transition-all border-b-2 ${activeModalTab === 'basic' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  <Info size={16} /> 基本資料 (Basic)
                </button>
                {editingInstrument && (
                  <>
                    <button
                      onClick={() => setActiveModalTab('calibration')}
                      className={`flex items-center gap-2 px-4 py-4 text-sm font-bold transition-all border-b-2 ${activeModalTab === 'calibration' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      <Award size={16} /> 校正履歷
                    </button>
                    <button
                      onClick={() => setActiveModalTab('maintenance')}
                      className={`flex items-center gap-2 px-4 py-4 text-sm font-bold transition-all border-b-2 ${activeModalTab === 'maintenance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      <Wrench size={16} /> 維修保養
                    </button>
                    <button
                      onClick={() => setActiveModalTab('loan')}
                      className={`flex items-center gap-2 px-4 py-4 text-sm font-bold transition-all border-b-2 ${activeModalTab === 'loan' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      <Send size={16} /> 儀器出借
                    </button>
                  </>
                )}
              </div>



              {activeModalTab === 'basic' && (
                <div className="px-3 md:px-6 py-4 border-b border-slate-100 bg-slate-50/50 text-slate-800 overflow-y-auto no-scrollbar flex-1">
                  <form id="form-basic" onSubmit={handleSaveInstrumentBasic}>
                    <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 md:gap-x-4 gap-y-3">

                        <div className="col-span-4 flex items-center gap-2 border-b border-slate-200 pb-1 mb-1">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">1</div>
                          <h4 className="font-bold text-slate-700 text-sm">基本識別資訊</h4>
                        </div>

                        <div className="col-span-2 md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">儀器名稱</label>
                          <input name="instrumentName" defaultValue={editingInstrument?.instrumentName} required className="w-full px-2 py-1.5 text-xs md:text-sm bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                        </div>
                        <div className="col-span-2 md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">儀器編號</label>
                          <input name="instrumentNo" defaultValue={editingInstrument?.instrumentNo} readOnly={!!editingInstrument} required className="w-full px-2 py-1.5 text-xs md:text-sm bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold" />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">廠牌</label>
                          <input name="brand" defaultValue={editingInstrument?.brand} required className="w-full px-2 py-1.5 text-xs md:text-sm bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="col-span-1 md:col-span-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">型號/機型</label>
                          <input name="model" defaultValue={editingInstrument?.model} required className="w-full px-2 py-1.5 text-xs md:text-sm bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="col-span-1 md:col-span-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">出廠號碼</label>
                          <input name="factoryNo" defaultValue={editingInstrument?.factoryNo} className="w-full px-2 py-1.5 text-xs md:text-sm bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        <div className="col-span-4 flex items-center gap-2 border-b border-slate-200 pb-1 mb-1 mt-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">2</div>
                          <h4 className="font-bold text-slate-700 text-sm">管理與維護資訊</h4>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">購入日期</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="purchaseDate"
                              ref={purchaseDateTextRef}
                              defaultValue={editingInstrument?.purchaseDate}
                              required
                              placeholder="yyyy/mm/dd"
                              className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500 font-mono pr-8"
                            />
                            <button
                              type="button"
                              onClick={() => purchaseDateRef.current?.showPicker()}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              <Calendar size={16} />
                            </button>
                            <input
                              type="date"
                              ref={purchaseDateRef}
                              className="absolute opacity-0 pointer-events-none w-0 h-0 bottom-0 left-0"
                              tabIndex={-1}
                              onChange={(e) => {
                                if (purchaseDateTextRef.current) {
                                  purchaseDateTextRef.current.value = e.target.value; // Sync to text input
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">購入金額</label>
                          <input type="number" name="purchaseAmount" defaultValue={editingInstrument?.purchaseAmount} required className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">校正週期(月)</label>
                          <input type="number" name="calibrationCycle" defaultValue={editingInstrument?.calibrationCycle || 12} required className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">保管人</label>
                          <select name="custodian" defaultValue={editingInstrument?.custodian} required className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500 font-bold">
                            <option value="">選擇保管人...</option>
                            {state.users.map(u => <option key={u.username} value={u.name}>{u.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">當前狀態</label>
                          <select name="status" defaultValue={editingInstrument?.status || InstrumentStatus.NORMAL} className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500 font-bold">
                            {Object.values(InstrumentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">規格描述</label>
                          <input name="specification" defaultValue={editingInstrument?.specification} className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">允收條件</label>
                          <input name="acceptanceCriteria" defaultValue={editingInstrument?.acceptanceCriteria} placeholder="例如：校正判定之允收標準" className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">儀器附件</label>
                          <input name="accessories" defaultValue={editingInstrument?.accessories} className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">備註</label>
                          <input name="notes" defaultValue={editingInstrument?.notes} className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {editingInstrument && (
                <>
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 text-slate-800 custom-scrollbar">
                    {activeModalTab === 'calibration' ? (
                      <div className="p-6 h-full flex flex-col relative">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                            <Plus size={16} /> 登錄新校正證書
                          </h4>
                          <button
                            onClick={() => setShowCalHistory(!showCalHistory)}
                            className="text-xs flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
                          >
                            <List size={14} /> {showCalHistory ? '返回登錄' : '查看歷史履歷'}
                          </button>
                        </div>

                        {!showCalHistory ? (
                          <div className="bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm p-8 flex-1">
                            <div className="mb-6 flex items-center justify-between">
                              <div className="text-emerald-800 font-bold text-lg">校正資訊輸入</div>
                              <span className="text-xs font-extrabold text-emerald-600 uppercase bg-white px-3 py-1.5 rounded-lg border border-emerald-100 tracking-tighter shadow-sm">自動計算有效日: 週期 {editingInstrument.calibrationCycle} 個月 - 1天</span>
                            </div>

                            <form id="form-calibration" onSubmit={handleAddCalibrationLog} className="w-full space-y-4">
                              <div className="grid grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-xs font-bold text-emerald-700 mb-1">校正報告日</label>
                                  <input type="date" value={calFormDate} onChange={handleCalDateChange} required className="w-full px-2 py-1 text-sm rounded border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-emerald-700 mb-1">有效截止日</label>
                                  <input type="date" value={calFormNextDate} readOnly className="w-full px-2 py-1 text-sm rounded border border-emerald-100 bg-white/60 text-indigo-700 font-bold outline-none font-mono shadow-sm" />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs font-bold text-emerald-700 mb-1">校正廠商</label>
                                  <input name="calVendor" placeholder="例如: TAF 認可實驗室" required className="w-full px-2 py-1 text-sm rounded border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-emerald-700 mb-1">證書編號</label>
                                  <input name="calCert" placeholder="CERT-XXXXX" required className="w-full px-2 py-1 text-sm rounded border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-sm" />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-emerald-700 mb-1">判定結果</label>
                                  <select name="calResult" className="w-full px-2 py-1 text-sm rounded border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold shadow-sm">
                                    <option value="合格">合格 (Pass)</option>
                                    <option value="不合格">不合格 (Fail)</option>
                                  </select>
                                </div>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white rounded-xl border border-slate-200 shadow-sm">
                            <table className="w-full text-left">
                              <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                                <tr>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">日期</th>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">廠商</th>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">證書編號</th>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">結果</th>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">有效至</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {editingInstrument.calibrationLogs.map(log => (
                                  <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-mono text-slate-700">{log.date}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-slate-700">{log.vendor}</td>
                                    <td className="px-4 py-3 text-sm font-mono text-slate-500">{log.certificateNo}</td>
                                    <td className="px-4 py-3">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${log.result === '合格' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{log.result}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono text-indigo-600 font-bold">{log.nextDate}</td>
                                  </tr>
                                ))}
                                {editingInstrument.calibrationLogs.length === 0 && (
                                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">尚無紀錄</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : activeModalTab === 'loan' ? (
                      <div className="p-6 h-full flex flex-col relative">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                            <Plus size={16} /> 建立新儀器出借單據
                          </h4>
                          <button
                            onClick={() => setShowCalHistory(!showCalHistory)}
                            className="text-xs flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
                          >
                            <List size={14} /> {showCalHistory ? '返回登錄' : '查看歷史履歷'}
                          </button>
                        </div>

                        {!showCalHistory ? (
                          <div className="bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm p-6 flex-1">
                            <div className="text-indigo-900 font-bold text-lg mb-4">出借資訊輸入</div>
                            <form id="form-loan" onSubmit={handleLoanSubmit} className="w-full">
                              <div className="grid grid-cols-12 gap-3 bg-white/60 p-3 rounded-xl border border-slate-200/60 items-end">
                                <div className="col-span-3">
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">類型</label>
                                  <select name="loanType" required className="w-full px-2 py-1 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500 font-bold bg-white text-xs">
                                    <option value="單位">單位</option>
                                    <option value="個人">個人</option>
                                  </select>
                                </div>
                                <div className="col-span-3">
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">客戶/單位</label>
                                  <input name="customerName" required className="w-full px-2 py-1 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" />
                                </div>
                                <div className="col-span-3">
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">借用人</label>
                                  <input name="borrower" required className="w-full px-2 py-1 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" />
                                </div>
                                <div className="col-span-3">
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">經辦人</label>
                                  <select name="employeeId" required className="w-full px-2 py-1 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500 font-bold bg-white text-xs">
                                    <option value="">選擇...</option>
                                    {state.users.map(u => <option key={u.username} value={u.name}>{u.name}</option>)}
                                  </select>
                                </div>
                                <div className="col-span-3">
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">借出日期</label>
                                  <input type="date" name="loanDate" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full px-2 py-1 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500 font-bold font-mono text-xs" />
                                </div>
                                <div className="col-span-3">
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">預計歸還</label>
                                  <input type="date" name="expectedReturnDate" required className="w-full px-2 py-1 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500 font-bold font-mono text-xs" />
                                </div>
                                <div className="col-span-6">
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">用途說明</label>
                                  <input name="purpose" required className="w-full px-2 py-1 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" />
                                </div>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white rounded-xl border border-slate-200 shadow-sm">
                            <table className="w-full text-left">
                              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">狀態</th>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">借用人/單位</th>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">用途</th>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">借出/歸還</th>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500 text-right">操作</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {editingInstrument.loanLogs?.map(log => (
                                  <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 align-top">
                                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${log.status === '出借中'
                                        ? (new Date() > new Date(log.expectedReturnDate) ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-indigo-600 text-white border-indigo-600')
                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                        {log.status === '出借中' && new Date() > new Date(log.expectedReturnDate) ? '已逾期' : log.status}
                                      </span>
                                      {log.status === '出借中' && new Date() > new Date(log.expectedReturnDate) && (
                                        <div className="mt-1 flex items-center gap-1 text-[9px] text-rose-600 font-bold animate-pulse">
                                          <AlertTriangle size={10} /> 預計: {log.expectedReturnDate}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                      <div className="text-sm font-bold text-slate-800">{log.borrower}</div>
                                      <div className="text-xs text-slate-500">{log.customerName}</div>
                                    </td>
                                    <td className="px-4 py-3 align-top text-xs text-slate-600 max-w-[120px] truncate" title={log.purpose}>
                                      {log.purpose}
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                      <div className="text-xs text-slate-500"><span className="font-mono">{log.loanDate}</span> (借)</div>
                                      <div className={`text-xs font-mono font-bold ${log.status === '出借中' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {log.status === '出借中' ? log.expectedReturnDate : log.actualReturnDate} (還)
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 align-top text-right space-y-1">
                                      <button
                                        onClick={() => handlePrintLoanSlip(log)}
                                        className="text-[10px] bg-white border border-indigo-200 text-indigo-600 font-bold px-2 py-1 rounded hover:bg-indigo-50 transition-all block w-full"
                                      >
                                        列印
                                      </button>
                                      {log.status === '出借中' && (
                                        <button
                                          onClick={() => handleReturnConfirm(log.id)}
                                          className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold px-2 py-1 rounded hover:bg-emerald-100 transition-all block w-full"
                                        >
                                          歸還
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                                {(!editingInstrument.loanLogs || editingInstrument.loanLogs.length === 0) && (
                                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">尚無任何出借紀錄</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : activeModalTab === 'maintenance' ? (
                      <div className="p-6 h-full flex flex-col relative">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                            <Plus size={16} /> 新增維修/保養記錄
                          </h4>
                          <button
                            onClick={() => setShowMaintHistory(!showMaintHistory)}
                            className="text-xs flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
                          >
                            <List size={14} /> {showMaintHistory ? '返回登錄' : '查看歷史履歷'}
                          </button>
                        </div>

                        {!showMaintHistory ? (
                          <div className="bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm p-6 flex-1">
                            <div className="text-indigo-900 font-bold text-lg mb-4">維修保養資料輸入</div>
                            <form id="form-maintenance" onSubmit={handleAddMaintenanceLog} className="w-full grid grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-indigo-900 mb-1">日期</label>
                                <input type="date" name="logDate" required className="w-full px-2 py-1 text-sm rounded border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-indigo-900 mb-1">費用</label>
                                <input type="number" name="logCost" placeholder="0" className="w-full px-2 py-1 text-sm rounded border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                              </div>
                              <div className="col-span-1">
                                <label className="block text-xs font-bold text-indigo-900 mb-1">驗收者</label>
                                <input name="logAcceptedBy" placeholder="驗收人員" required className="w-full px-2 py-1 text-sm rounded border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                              </div>
                              <div className="col-span-1">
                                <label className="block text-xs font-bold text-indigo-900 mb-1">結果/判定</label>
                                <input name="logResult" placeholder="例如: 已修復" required className="w-full px-2 py-1 text-sm rounded border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs font-bold text-indigo-900 mb-1">維修前狀況</label>
                                <input name="logStatusBefore" placeholder="修復前之異常描述" required className="w-full px-2 py-1 text-sm rounded border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs font-bold text-indigo-900 mb-1">維修保養內容</label>
                                <input name="logDescription" placeholder="請描述維修或保養項目..." required className="w-full px-2 py-1 text-sm rounded border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                              </div>
                              <div className="col-span-4">
                                <label className="block text-xs font-bold text-indigo-900 mb-1">備註</label>
                                <input name="logNotes" placeholder="其他說明" className="w-full px-2 py-1 text-sm rounded border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                              </div>
                            </form>
                          </div>
                        ) : (
                          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white rounded-xl border border-slate-200 shadow-sm">
                            <table className="w-full text-left">
                              <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                                <tr>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">日期</th>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">維修內容</th>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">維修前狀況</th>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">判定結果</th>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">驗收者</th>
                                  <th className="px-4 py-3 text-xs font-bold text-slate-500">費用</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {editingInstrument.maintenanceLogs.map(log => (
                                  <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-mono text-slate-700">{log.date}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-slate-700">{log.description}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{log.statusBefore}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-indigo-600">{log.result}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{log.acceptedBy}</td>
                                    <td className="px-4 py-3 text-sm font-mono text-slate-500">NT$ {log.cost.toLocaleString()}</td>
                                  </tr>
                                ))}
                                {editingInstrument.maintenanceLogs.length === 0 && (
                                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">尚無紀錄</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </>
              )}

              <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 items-center">
                {activeModalTab === 'basic' && (
                  <button form="form-basic" type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200">
                    <ShieldCheck size={16} /> 儲存設定
                  </button>
                )}
                {activeModalTab === 'calibration' && !showCalHistory && editingInstrument && (
                  <button form="form-calibration" type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-200">
                    <CheckCircle2 size={16} /> 登錄校正
                  </button>
                )}
                {activeModalTab === 'maintenance' && !showMaintHistory && editingInstrument && (
                  <button form="form-maintenance" type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200">
                    <Wrench size={16} /> 儲存紀錄
                  </button>
                )}
                {activeModalTab === 'loan' && !showCalHistory && editingInstrument && (
                  <button form="form-loan" type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200">
                    <Send size={16} /> 建立出借單
                  </button>
                )}
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">關閉</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default InstrumentModule;
