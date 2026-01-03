
import { InstrumentStatus, Instrument, Material, Vendor, User } from './types';

export const TRAINING_REQUIREMENTS = {
  EXTERNAL: 12,
  INTERNAL: 36,
};

export const TRAINING_COURSES = {
  ENVIRONMENT_MONITOR: {
    label: '作業環境監測人員/助理職前(在職)訓練',
    courses: [
      { name: '採樣品管管理', hours: 10 },
      { name: '監測計畫書撰寫', hours: 5 },
      { name: '作業環境監測執行分析、樣品之包裝等', hours: 6 },
      { name: '監測報告核對', hours: 6 },
      { name: '儀器/設備之操作、校正、保養、維修之作業', hours: 6 },
      { name: '執行監測測試或安全預估', hours: 6 },
      { name: '預測數據處理', hours: 5 },
      { name: '監測程序', hours: 5 },
      { name: '監測績效', hours: 5 },
    ]
  },
  ADMINISTRATIVE: {
    label: '行政人員職前(在職)訓練',
    courses: [
      { name: '採樣品管管理', hours: 10 },
      { name: '一般行政作業', hours: 5 },
      { name: '測定行政維護及安排', hours: 5 },
      { name: '監測報告核對', hours: 5 },
    ]
  }
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
    ]
  },
  { username: 'tech_01', name: '陳技術', password: '1111', qualifications: ['技術員'], trainingLogs: [] },
  { username: 'tech_02', name: '王大同', password: '1111', qualifications: ['技術員'], trainingLogs: [] },
];

export const INITIAL_VENDORS: Vendor[] = [
  { id: 'v1', name: '精密儀器校驗有限公司', contact: '02-23456789' },
  { id: 'v2', name: '優質計量實驗室', contact: '03-98765432' },
  { id: 'v3', name: '標準物資供應中心', contact: '04-55667788' }
];

export const INITIAL_INSTRUMENTS: Instrument[] = [
  {
    instrumentNo: 'H0001 (L0029)',
    instrumentName: 'SKC 泵',
    brand: 'AC-52',
    model: '224-52',
    factoryNo: '876898',
    purchaseDate: '2023-01-01',
    purchaseAmount: 0,
    status: InstrumentStatus.NORMAL,
    calibrationCycle: 12,
    lastCalibrationDate: '2023-01-01',
    nextCalibrationDate: '2024-01-01',
    vendor: '精密儀器校驗有限公司',
    custodian: '環境監測部',
    maintenanceLogs: [],
    calibrationLogs: [],
    loanLogs: [],
    acceptanceCriteria: '依儀器與設備管理辦法 4.5.4 校正判定之允收標準辦理。'
  },
  {
    instrumentNo: 'H0006 (L0048)',
    instrumentName: 'SKC 泵',
    brand: 'AC-52',
    model: '224-52',
    factoryNo: '067738',
    purchaseDate: '2011-11-16',
    purchaseAmount: 0,
    status: InstrumentStatus.NORMAL,
    calibrationCycle: 12,
    lastCalibrationDate: '2023-11-16',
    nextCalibrationDate: '2024-11-16',
    vendor: '精密儀器校驗有限公司',
    custodian: '環境監測部',
    maintenanceLogs: [],
    calibrationLogs: [],
    loanLogs: []
  },
  {
    instrumentNo: 'H0007 (L0034)',
    instrumentName: 'SKC 泵',
    brand: 'AC-52',
    model: '224-52',
    factoryNo: '575694',
    purchaseDate: '2023-01-01',
    purchaseAmount: 0,
    status: InstrumentStatus.NORMAL,
    calibrationCycle: 12,
    lastCalibrationDate: '2023-01-01',
    nextCalibrationDate: '2024-01-01',
    vendor: '精密儀器校驗有限公司',
    custodian: '環境監測部',
    maintenanceLogs: [],
    calibrationLogs: [],
    loanLogs: []
  },
  {
    instrumentNo: 'H0009 (L0047)',
    instrumentName: 'SKC 泵',
    brand: 'AC-52',
    model: '224-52',
    factoryNo: '067728',
    purchaseDate: '2011-11-16',
    purchaseAmount: 0,
    status: InstrumentStatus.NORMAL,
    calibrationCycle: 12,
    lastCalibrationDate: '2023-11-16',
    nextCalibrationDate: '2024-11-16',
    vendor: '精密儀器校驗有限公司',
    custodian: '環境監測部',
    maintenanceLogs: [],
    calibrationLogs: [],
    loanLogs: []
  },
  {
    instrumentNo: 'B0001',
    instrumentName: 'SKC 泵',
    brand: 'AC-Connect',
    model: '220-4000',
    factoryNo: '235500',
    purchaseDate: '2023-08-18',
    purchaseAmount: 0,
    status: InstrumentStatus.NORMAL,
    calibrationCycle: 12,
    lastCalibrationDate: '2023-08-18',
    nextCalibrationDate: '2024-08-18',
    vendor: '精密儀器校驗有限公司',
    custodian: '環境監測部',
    maintenanceLogs: [],
    calibrationLogs: [],
    loanLogs: []
  },
  {
    instrumentNo: 'B0002',
    instrumentName: 'SKC 泵',
    brand: 'AC-Connect',
    model: '220-4000',
    factoryNo: '235512',
    purchaseDate: '2023-08-18',
    purchaseAmount: 0,
    status: InstrumentStatus.NORMAL,
    calibrationCycle: 12,
    lastCalibrationDate: '2023-08-18',
    nextCalibrationDate: '2024-08-18',
    vendor: '精密儀器校驗有限公司',
    custodian: '環境監測部',
    maintenanceLogs: [],
    calibrationLogs: [],
    loanLogs: []
  }
];

export const INITIAL_MATERIALS: Material[] = [
  { lot: 'LOT-P4', name: 'pH 4.00 標準液', purchaseDate: '2024-01-01', expiryDate: '2025-01-01', stock: 10, status: '正常' },
  { lot: 'LOT-P7', name: 'pH 7.00 標準液', purchaseDate: '2024-01-01', expiryDate: '2025-01-01', stock: 12, status: '正常' },
  { lot: 'LOT-P10', name: 'pH 10.01 標準液', purchaseDate: '2024-01-01', expiryDate: '2025-01-01', stock: 8, status: '正常' },
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
