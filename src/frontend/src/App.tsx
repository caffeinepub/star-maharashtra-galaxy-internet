import { useState, useEffect } from 'react';
import { RegistrationFlow } from './features/registration/RegistrationFlow';
import AdminPanel from './features/admin/AdminPanel';
import { SplashScreen } from './components/SplashScreen';

type View = 'registration' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<View>('registration');
  const [showSplash, setShowSplash] = useState(true);
  const [registrationKey, setRegistrationKey] = useState(0);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleNavigateToAdmin = () => {
    setCurrentView('admin');
  };

  const handleNavigateToRegistration = () => {
    // Reset registration flow when returning from admin panel
    setRegistrationKey((prev) => prev + 1);
    setCurrentView('registration');
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'registration' ? (
        <RegistrationFlow 
          key={registrationKey}
          onNavigateToAdmin={handleNavigateToAdmin} 
        />
      ) : (
        <AdminPanel onBackToRegistration={handleNavigateToRegistration} />
      )}
    </div>
  );
}

export default App;
