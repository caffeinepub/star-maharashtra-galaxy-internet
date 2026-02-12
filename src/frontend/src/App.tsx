import { useState } from 'react';
import { RegistrationFlow } from './features/registration/RegistrationFlow';
import { AdminPanel } from './features/admin/AdminPanel';

type View = 'registration' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<View>('registration');

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
