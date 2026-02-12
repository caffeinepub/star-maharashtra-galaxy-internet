import { useState, useEffect } from 'react';
import { RegistrationFlow } from './features/registration/RegistrationFlow';
import { AdminPanel } from './features/admin/AdminPanel';
import { SplashScreen } from './components/SplashScreen';

type View = 'registration' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<View>('registration');
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'registration' ? (
        <RegistrationFlow onNavigateToAdmin={() => setCurrentView('admin')} />
      ) : (
        <AdminPanel onNavigateToRegistration={() => setCurrentView('registration')} />
      )}
    </div>
  );
}

export default App;
