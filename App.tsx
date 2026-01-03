
import React, { useState, useEffect } from 'react';
import {
  User,
  InstrumentStatus,
  AppState
} from './types';
import {
  INITIAL_INSTRUMENTS,
  INITIAL_MATERIALS,
  INITIAL_VENDORS,
  INITIAL_USERS,
  INITIAL_MATERIAL_NAMES
} from './constants';
import Dashboard from './components/Dashboard';
import InstrumentModule from './components/InstrumentModule';
import MaterialModule from './components/MaterialModule';
import PersonnelModule from './components/PersonnelModule';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginOverlay from './components/LoginOverlay';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    instruments: INITIAL_INSTRUMENTS,
    materials: INITIAL_MATERIALS,
    materialNames: INITIAL_MATERIAL_NAMES,
    vendors: INITIAL_VENDORS,
    users: INITIAL_USERS,
    currentUser: null,
    loanRecords: []
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'instruments' | 'materials' | 'personnel'>('dashboard');

  useEffect(() => {
    const today = new Date();
    const updatedInstruments = state.instruments.map(inst => {
      const nextCal = new Date(inst.nextCalibrationDate);
      const diffTime = nextCal.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (inst.status === InstrumentStatus.NORMAL && diffDays <= 30 && diffDays > 0) {
        return { ...inst, status: InstrumentStatus.PENDING_CALIBRATION };
      }
      return inst;
    });

    const updatedMaterials = state.materials.map(mat => {
      const expiry = new Date(mat.expiryDate);
      if (expiry < today) {
        return { ...mat, status: '已過期' as const };
      }
      return mat;
    });

    if (JSON.stringify(updatedInstruments) !== JSON.stringify(state.instruments) ||
      JSON.stringify(updatedMaterials) !== JSON.stringify(state.materials)) {
      setState(prev => ({ ...prev, instruments: updatedInstruments, materials: updatedMaterials }));
    }
  }, [state.instruments, state.materials]);

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, currentUser: user }));
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  if (!state.currentUser) {
    return <LoginOverlay onLogin={handleLogin} users={state.users} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={state.currentUser}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <Header
          user={state.currentUser}
          onLogout={handleLogout}
        />

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && <Dashboard state={state} />}
          {activeTab === 'instruments' && <InstrumentModule state={state} setState={setState} />}
          {activeTab === 'materials' && <MaterialModule state={state} setState={setState} />}
          {activeTab === 'personnel' && <PersonnelModule state={state} setState={setState} />}
        </div>
      </main>
    </div>
  );
};

export default App;
