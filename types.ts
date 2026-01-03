
export enum InstrumentStatus {
  NORMAL = '廠內',
  REPAIRING = '維修',
  CALIBRATING = '送校',
  SCRAPPED = '報廢',
  PENDING_CALIBRATION = '待送校',
  LOANED = '出借',
  ARCHIVED = '封存'
}

export interface DeletionLog {
  id: string;
  instrumentNo: string;
  instrumentName: string;
  deletedAt: string;
  deletedBy: string;
  type: 'SOFT_DELETE' | 'HARD_DELETE';
}

export interface LoanRecord {
  id: string;
  instrumentNo: string;
  instrumentName: string;
  customerName: string;   // 出借客戶公司名稱
  borrower: string;       // 借用人
  employeeId: string;     // 祐大員工 (ID or Name)
  loanType: '單位' | '個人'; // 出借類型
  loanDate: string;       // 出借日期
  expectedReturnDate: string; // 預計歸還日期
  actualReturnDate?: string;  // 實際歸還日期
  confirmedBy?: string;   // 歸還確認者 (登入者姓名)
  purpose: string;        // 用途
  status: '已歸還' | '出借中';
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  description: string;
  result: string;
  cost: number;
}

export interface CalibrationRecord {
  id: string;
  date: string;
  vendor: string;
  certificateNo: string;
  result: '合格' | '不合格';
  nextDate: string;
}

export interface Instrument {
  instrumentNo: string;    // 儀器編號
  instrumentName: string;  // 儀器名稱
  brand: string;           // 廠牌
  model: string;           // 型號
  purchaseDate: string;    // 購入日期
  purchaseAmount: number;  // 購入金額
  status: InstrumentStatus;
  calibrationCycle: number; // 校正週期 (月)
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  vendor: string;
  custodian: string;
  maintenanceLogs: MaintenanceRecord[];
  calibrationLogs: CalibrationRecord[];
  loanLogs: LoanRecord[];
  specification?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface TrainingRecord {
  id: string;
  type: '內訓' | '外訓';
  courseName: string;
  provider: string;       // 受訓單位
  hours: number;          // 時數
  date: string;           // 上課日期
  expiryDate: string;     // 資格期限
  retrainingDate: string; // 回訓日期
}

export interface User {
  username: string;
  name: string;
  password?: string;
  qualifications: string[]; // 認可資料/多重資格
  trainingLogs: TrainingRecord[]; // 教育訓練紀錄
}

export interface Material {
  lot: string;
  name: string;
  purchaseDate: string;
  expiryDate: string;
  stock: number;
  status: '正常' | '已過期';
}

export interface Vendor {
  id: string;
  name: string;
  contact: string;
}

export interface AppState {
  instruments: Instrument[];
  materials: Material[];
  materialNames: string[];
  vendors: Vendor[];
  users: User[];
  currentUser: User | null;
  loanRecords: LoanRecord[];
  deletionLogs: DeletionLog[];
}
