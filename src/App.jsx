import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import ScanPage from './pages/ScanPage';
import ComplaintsPage from './pages/ComplaintsPage';

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <div className="min-h-screen bg-cream">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
          </Routes>
          <footer className="text-center py-8 text-xs text-slate-400 border-t border-saffron-100 mt-12">
            SahAI · Built for Bharat · AI output may be imperfect — always verify important documents with an official.
          </footer>
        </div>
      </LangProvider>
    </BrowserRouter>
  );
}
