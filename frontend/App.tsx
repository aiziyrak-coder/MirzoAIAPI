
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DocumentGenerator } from './components/DocumentGenerator';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';
import { UserProfile } from './components/UserProfile';
import { Subscription } from './components/Subscription';
import { PendingSubscription } from './components/PendingSubscription';
import { AdminDashboard } from './components/AdminDashboard';
import { LandingPage } from './components/LandingPage'; 
import { AppView, User } from './types';
import { authService } from './services/authService';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // Check if user has pending subscription on mount
  useEffect(() => {
    const checkPending = async () => {
      const user = await authService.getCurrentUser();
      if (user && user.subscriptionStatus === 'PENDING') {
        setCurrentView(AppView.PENDING_SUBSCRIPTION);
      }
    };
    checkPending();
  }, []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLanding, setShowLanding] = useState(true); 

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
          setCurrentUser(user);
          setShowLanding(false); // If user is logged in, skip landing
          if (user.isAdmin) {
              setCurrentView(AppView.ADMIN_DASHBOARD);
          }
      }
    };
    loadUser();
  }, []);

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      setShowLanding(false);
      if (user.isAdmin) {
          setCurrentView(AppView.ADMIN_DASHBOARD);
      } else {
          setCurrentView(AppView.DASHBOARD);
      }
  };

  const handleLogout = () => {
      authService.logout();
      setCurrentUser(null);
      setShowLanding(true); // Return to landing on logout
  };

  const handleViewChange = (view: AppView) => {
      // Logic to block views if subscription is not active
      if (currentUser?.subscriptionStatus !== 'ACTIVE' && !currentUser?.isAdmin) {
          const lockedViews = [AppView.DASHBOARD, AppView.DOC_GENERATOR];
          if (lockedViews.includes(view)) {
             return; 
          }
      }
      setCurrentView(view);
  };

  const LockedScreen = () => (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in-up">
          <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center mb-6 relative">
              <span className="text-6xl grayscale opacity-50">🔒</span>
              <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center border-4 border-white">
                 <span className="text-white text-xs font-bold">!</span>
              </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Obuna Faollashtirilmagan</h2>
          <p className="text-slate-500 max-w-md mb-8">
              Ushbu sahifadan foydalanish uchun Premium obunani faollashtirishingiz kerak.
          </p>
          <button 
             onClick={() => setCurrentView(AppView.SUBSCRIPTION)}
             className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/30 hover:scale-105 transition-transform"
          >
              Obunani Faollashtirish
          </button>
      </div>
  );

  const renderContent = () => {
    // If Admin View
    if (currentView === AppView.ADMIN_DASHBOARD && currentUser?.isAdmin) {
        return <AdminDashboard onLogout={handleLogout} />;
    }

    const isLocked = currentUser?.subscriptionStatus !== 'ACTIVE' && !currentUser?.isAdmin;

    // Route logic
    switch (currentView) {
      case AppView.DOC_GENERATOR:
        return isLocked ? <LockedScreen /> : <DocumentGenerator />;
      case AppView.PROFILE:
        return <UserProfile user={currentUser!} onLogout={handleLogout} />;
      case AppView.SUBSCRIPTION:
        return <Subscription user={currentUser!} onUpdateUser={setCurrentUser} onViewChange={handleViewChange} />;
      case AppView.PENDING_SUBSCRIPTION:
        return <PendingSubscription user={currentUser!} onUpdateUser={setCurrentUser} onBack={() => handleViewChange(AppView.SUBSCRIPTION)} />;
      case AppView.DASHBOARD:
      default:
        return isLocked ? <LockedScreen /> : <Dashboard onChangeView={handleViewChange} />;
    }
  };

  // 1. Landing Page State
  if (!currentUser && showLanding) {
      return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  // 2. Auth State (Login/Register)
  if (!currentUser && !showLanding) {
      return <Auth onLogin={handleLogin} onBack={() => setShowLanding(true)} />;
  }

  // 3. Admin Full Screen View
  if (currentUser?.isAdmin) {
      return (
         <div className="min-h-screen text-slate-800 bg-[#f0f4f8]">
            {renderContent()}
         </div>
      );
  }

  // 4. Main App View (Logged in User)
  return (
    <div className="min-h-screen flex text-slate-800 bg-[#f0f4f8]">
      <div className="hidden lg:block w-72">
          <Sidebar 
            currentView={currentView} 
            onChangeView={handleViewChange} 
            subscriptionStatus={currentUser!.subscriptionStatus}
            onLogout={handleLogout}
          />
      </div>
      
      {/* Mobile Sidebar Overlay or Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 p-4">
          <div className="glass-panel rounded-2xl p-2 flex justify-around overflow-x-auto">
             <button onClick={() => handleViewChange(AppView.DASHBOARD)} className={`p-3 rounded-xl ${currentView === AppView.DASHBOARD ? 'bg-blue-500 text-white' : 'text-slate-500'}`}>📊</button>
             <button onClick={() => handleViewChange(AppView.DOC_GENERATOR)} className={`p-3 rounded-xl ${currentView === AppView.DOC_GENERATOR ? 'bg-blue-500 text-white' : 'text-slate-500'}`}>📝</button>
             <button onClick={() => handleViewChange(AppView.PROFILE)} className={`p-3 rounded-xl ${currentView === AppView.PROFILE ? 'bg-blue-500 text-white' : 'text-slate-500'}`}>👤</button>
          </div>
      </div>

      <main className="flex-1 transition-all duration-300 relative pb-20 lg:pb-0">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
