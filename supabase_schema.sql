-- ISO 17025 System Schema

-- 1. Users table
CREATE TABLE IF NOT EXISTS public.users (
    username TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    qualifications TEXT[] DEFAULT '{}',
    training_logs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Instruments table
CREATE TABLE IF NOT EXISTS public.instruments (
    instrument_no TEXT PRIMARY KEY,
    instrument_name TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    purchase_date DATE,
    purchase_amount NUMERIC(12, 2),
    status TEXT NOT NULL, -- Enum values: 廠內, 維修, 送校, 報廢, 待送校, 出借, 封存
    calibration_cycle INTEGER,
    last_calibration_date DATE,
    next_calibration_date DATE,
    vendor TEXT,
    custodian TEXT,
    maintenance_logs JSONB DEFAULT '[]'::jsonb,
    calibration_logs JSONB DEFAULT '[]'::jsonb,
    loan_logs JSONB DEFAULT '[]'::jsonb,
    specification TEXT,
    deleted_at TIMESTAMPTZ,
    deleted_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Materials table
CREATE TABLE IF NOT EXISTS public.materials (
    lot TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    purchase_date DATE,
    expiry_date DATE,
    stock INTEGER DEFAULT 0,
    status TEXT NOT NULL, -- 正常, 已過期
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Material Names (Lookup table)
CREATE TABLE IF NOT EXISTS public.material_names (
    name TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Loan Records table
CREATE TABLE IF NOT EXISTS public.loan_records (
    id TEXT PRIMARY KEY,
    instrument_no TEXT REFERENCES public.instruments(instrument_no),
    instrument_name TEXT,
    customer_name TEXT,
    borrower TEXT,
    employee_id TEXT,
    loan_type TEXT, -- 單位, 個人
    loan_date DATE,
    expected_return_date DATE,
    actual_return_date DATE,
    confirmed_by TEXT,
    purpose TEXT,
    status TEXT, -- 已歸還, 出借中
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Deletion Logs table
CREATE TABLE IF NOT EXISTS public.deletion_logs (
    id TEXT PRIMARY KEY,
    instrument_no TEXT,
    instrument_name TEXT,
    deleted_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_by TEXT,
    type TEXT -- SOFT_DELETE, HARD_DELETE
);

-- Enable RLS for security (Optional but recommended)
-- For now, let's keep it simple as requested.
