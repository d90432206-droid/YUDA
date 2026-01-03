
import { InstrumentStatus, Instrument, Material, Vendor, User } from './types';

export const TRAINING_REQUIREMENTS = {
  EXTERNAL: 12,
  INTERNAL: 36,
};

export const INITIAL_USERS: User[] = [
  {
    username: 'admin', name: '系統管理員', password: '1111',
    qualifications: ['管理代表', 'ISO 17025 內部稽核員'],
    trainingLogs: [
      { id: 't-1', type: '外訓', courseName: 'ISO 17025 管理要求', provider: 'TAF', hours: 14, date: '2023-05-10', expiryDate: '2026-05-10', retrainingDate: '2026-02-10' },
      { id: 't-2', type: '內訓', courseName: '品質手冊宣導', provider: '實驗室', hours: 40, date: '2024-01-05', expiryDate: '2025-01-05', retrainingDate: '2024-12-05' }
    ]
  },
  {
    username: 'inst_mgr', name: '王儀管', password: '1111',
    qualifications: ['儀器管理員', '技術主管'],
    trainingLogs: [
      { id: 't-3', type: '外訓', courseName: '量測不確定度評估', provider: 'ITRI', hours: 12, date: '2023-08-15', expiryDate: '2025-08-15', retrainingDate: '2025-05-15' },
      { id: 't-4', type: '內訓', courseName: '儀器校正程序', provider: '技術部', hours: 20, date: '2024-02-10', expiryDate: '2025-02-10', retrainingDate: '2024-12-10' }
    ] // 內訓時數不足 (20 < 36)
  },
  {
    username: 'samp_mgr', name: '李樣本', password: '1111',
    qualifications: ['樣本管理員'],
    trainingLogs: [
      { id: 't-5', type: '外訓', courseName: '危險化學品管理', provider: '工安協會', hours: 6, date: '2023-01-10', expiryDate: '2024-01-10', retrainingDate: '2023-12-10' }
    ] // 資格過期 + 外訓時數不足
  },
  { username: 'tech_01', name: '陳技術', password: '1111', qualifications: ['技術員'], trainingLogs: [] },
  {
    username: 'tech_02', name: '林分析', password: '1111',
    qualifications: ['技術員', '報告簽署人'],
    trainingLogs: [
      { id: 't-6', type: '內訓', courseName: 'SOP 操作演練', provider: '內部', hours: 38, date: '2024-03-01', expiryDate: '2025-03-01', retrainingDate: '2025-02-01' },
      { id: 't-7', type: '外訓', courseName: '化學分析技術', provider: 'SGS', hours: 12, date: '2023-11-20', expiryDate: '2025-11-20', retrainingDate: '2025-09-20' }
    ] // 完全合規
  },
  { username: 'tech_03', name: '張品質', password: '1111', qualifications: ['品質主管'], trainingLogs: [] },
  { username: 'tech_04', name: '吳查核', password: '1111', qualifications: ['內部稽核員'], trainingLogs: [] },
  { username: 'tech_05', name: '趙實驗', password: '1111', qualifications: ['技術員'], trainingLogs: [] },
  { username: 'tech_06', name: '孫方法', password: '1111', qualifications: ['報告簽署人'], trainingLogs: [] },
  { username: 'tech_07', name: '錢標準', password: '1111', qualifications: ['技術員'], trainingLogs: [] }
];

export const INITIAL_VENDORS: Vendor[] = [
  { id: 'v1', name: '精密儀器校驗有限公司', contact: '02-23456789' },
  { id: 'v2', name: '優質計量實驗室', contact: '03-98765432' },
  { id: 'v3', name: '標準物資供應中心', contact: '04-55667788' }
];

const createInstrument = (no: string, name: string, brand: string, next: string, status: InstrumentStatus = InstrumentStatus.NORMAL): Instrument => ({
  instrumentNo: no, instrumentName: name, brand, model: 'M-' + no.split('-')[1],
  purchaseDate: '2023-01-01', purchaseAmount: 500000, status,
  calibrationCycle: 12, lastCalibrationDate: '2023-01-01', nextCalibrationDate: next,
  vendor: '精密儀器校驗有限公司', custodian: '王儀管', maintenanceLogs: [], calibrationLogs: [], loanLogs: []
});

// 20 件儀器：2件過期, 3件接近, 15件正常
export const INITIAL_INSTRUMENTS: Instrument[] = [
  createInstrument('INST-001', '高效能液相層析儀', 'Agilent', '2023-10-01'), // 過期 1
  createInstrument('INST-002', '電子分析天平', 'Mettler', '2024-01-15'), // 過期 2
  createInstrument('INST-003', '氣相層析儀', 'Shimadzu', '2024-05-25'), // 接近 1 (假設今日為 5月)
  createInstrument('INST-004', '紫外可見光光譜儀', 'Thermo', '2024-06-02'), // 接近 2
  createInstrument('INST-005', '離心機', 'Beckman', '2024-06-10'), // 接近 3
  createInstrument('INST-006', '酸鹼度計', 'WTW', '2025-01-01'),
  createInstrument('INST-007', '超純水系統', 'Millipore', '2025-02-15'),
  createInstrument('INST-008', '真空乾燥箱', 'Memmert', '2025-03-20'),
  createInstrument('INST-009', '精密烘箱', 'Binder', '2025-04-10'),
  createInstrument('INST-010', '震盪培養箱', 'New Brunswick', '2025-05-01'),
  createInstrument('INST-011', '自動滴定儀', 'Metrohm', '2025-06-12'),
  createInstrument('INST-012', '原子吸收光譜儀', 'PerkinElmer', '2025-07-05'),
  createInstrument('INST-013', '螢光光譜儀', 'Horiba', '2025-08-18'),
  createInstrument('INST-014', '微波消化爐', 'Anton Paar', '2025-09-22'),
  createInstrument('INST-015', '低溫冰箱', 'Panasonic', '2025-10-30'),
  createInstrument('INST-016', '高壓滅菌釜', 'Hirayama', '2025-11-14'),
  createInstrument('INST-017', '數位黏度計', 'Brookfield', '2025-12-01'),
  createInstrument('INST-018', '電導度計', 'Horiba', '2024-12-25'),
  createInstrument('INST-019', '折射儀', 'Atago', '2024-11-10'),
  createInstrument('INST-020', '密度計', 'Anton Paar', '2024-10-05'),
];

// 20 件標準物資
export const INITIAL_MATERIALS: Material[] = [
  { lot: 'LOT-P4', name: 'pH 4.00 標準液', purchaseDate: '2024-01-01', expiryDate: '2025-01-01', stock: 10, status: '正常' },
  { lot: 'LOT-P7', name: 'pH 7.00 標準液', purchaseDate: '2024-01-01', expiryDate: '2025-01-01', stock: 12, status: '正常' },
  { lot: 'LOT-P10', name: 'pH 10.01 標準液', purchaseDate: '2024-01-01', expiryDate: '2025-01-01', stock: 8, status: '正常' },
  { lot: 'LOT-CD', name: '電導度 1413 uS/cm 標準液', purchaseDate: '2023-05-01', expiryDate: '2024-05-01', stock: 5, status: '已過期' },
  { lot: 'LOT-ACN', name: '乙腈 HPLC Grade', purchaseDate: '2024-02-01', expiryDate: '2026-02-01', stock: 24, status: '正常' },
  { lot: 'LOT-MEOH', name: '甲醇 HPLC Grade', purchaseDate: '2024-02-01', expiryDate: '2026-02-01', stock: 18, status: '正常' },
  { lot: 'LOT-H2O', name: '去離子水', purchaseDate: '2024-04-01', expiryDate: '2024-10-01', stock: 100, status: '正常' },
  { lot: 'LOT-CU', name: '銅單元素標準液 1000ppm', purchaseDate: '2023-01-01', expiryDate: '2024-01-01', stock: 2, status: '已過期' },
  { lot: 'LOT-FE', name: '鐵單元素標準液 1000ppm', purchaseDate: '2024-03-01', expiryDate: '2025-03-01', stock: 4, status: '正常' },
  { lot: 'LOT-PB', name: '鉛單元素標準液 1000ppm', purchaseDate: '2024-03-01', expiryDate: '2025-03-01', stock: 3, status: '正常' },
  { lot: 'LOT-IPA', name: '異丙醇 AR Grade', purchaseDate: '2024-01-10', expiryDate: '2026-01-10', stock: 6, status: '正常' },
  { lot: 'LOT-HEX', name: '正己烷 AR Grade', purchaseDate: '2024-01-10', expiryDate: '2026-01-10', stock: 8, status: '正常' },
  { lot: 'LOT-HCL', name: '鹽酸 37% CP Grade', purchaseDate: '2024-02-15', expiryDate: '2026-02-15', stock: 12, status: '正常' },
  { lot: 'LOT-HNO3', name: '硝酸 65% GR Grade', purchaseDate: '2024-02-15', expiryDate: '2026-02-15', stock: 10, status: '正常' },
  { lot: 'LOT-H2SO4', name: '硫酸 98% AR Grade', purchaseDate: '2024-02-15', expiryDate: '2026-02-15', stock: 15, status: '正常' },
  { lot: 'LOT-NAOH', name: '氫氧化鈉 粒狀', purchaseDate: '2024-03-20', expiryDate: '2027-03-20', stock: 50, status: '正常' },
  { lot: 'LOT-KCL', name: '氯化鉀 晶體', purchaseDate: '2024-03-20', expiryDate: '2027-03-20', stock: 20, status: '正常' },
  { lot: 'LOT-OX', name: '草酸 標準物質', purchaseDate: '2022-01-01', expiryDate: '2023-01-01', stock: 1, status: '已過期' },
  { lot: 'LOT-SI', name: '矽膠乾燥劑 藍色', purchaseDate: '2024-01-01', expiryDate: '2025-01-01', stock: 100, status: '正常' },
  { lot: 'LOT-GLU', name: '葡萄糖 標準品', purchaseDate: '2024-01-01', expiryDate: '2026-01-01', stock: 5, status: '正常' },
];

export const INITIAL_MATERIAL_NAMES = [
  'pH 4.00 標準緩衝溶液',
  'pH 7.00 標準緩衝溶液',
  '乙腈 (HPLC Grade)',
  '去離子水',
  '甲醇 (HPLC Grade)',
  '硝酸 (GR Grade)',
  '鹽酸 (CP Grade)',
  '電導度標準液'
];
