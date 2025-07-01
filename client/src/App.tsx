import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Route, Switch } from "wouter";
import ChatPanel from "./components/ChatPanel";
import EditorFileExplorer from "./components/EditorFileExplorer";
import LivePreview from "./components/LivePreview";
import Navbar from "./components/Navbar";
import DatabaseConfig from "./components/DatabaseConfig";
import DeploymentModal from "./components/DeploymentModal";
import AuthModal from "./components/AuthModal";
import Checkout from "./pages/checkout";
import DeploymentSuccess from "./pages/deployment-success";
import NotFound from "./pages/not-found";
import { useWeblisite, WeblisiteProvider } from "./context/WeblisiteContext";
import { AuthProvider } from "./context/AuthContext";

function IdeLayout() {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isDbModalOpen, isDeployModalOpen } = useWeblisite();
  
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col relative overflow-hidden">
      {/* Advanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-900/20 to-slate-900"></div>
      
      {/* Floating orbs for ambiance */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden relative z-10 flex-col lg:flex-row">
        {/* AI Chat Panel - Mobile: Full width on separate screen, Desktop: Left 1/3 */}
        <div className="w-full lg:w-1/3 flex flex-col relative order-2 lg:order-1">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800/60 via-slate-800/40 to-slate-900/60 backdrop-blur-xl border-r border-white/10 lg:border-r border-t lg:border-t-0 border-white/10"></div>
          <div className="relative z-10 flex flex-col h-full">
            <ChatPanel />
          </div>
        </div>
        
        {/* Main Workspace - Mobile: Full width, Desktop: Right 2/3 */}
        <div className="w-full lg:w-2/3 flex flex-col relative order-1 lg:order-2">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80 backdrop-blur-sm"></div>
          
          {/* Premium Tab Navigation - Mobile Optimized */}
          <div className="relative z-10 px-3 sm:px-6 pt-2 sm:pt-4">
            <div className="flex space-x-1 bg-slate-800/50 backdrop-blur-md rounded-xl sm:rounded-2xl p-1 sm:p-1.5 border border-white/10 shadow-2xl">
              <button 
                className={`relative flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeTab === 'editor' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-105' 
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:shadow-lg hover:shadow-blue-500/25'
                }`}
                onClick={() => setActiveTab('editor')}
              >
                {activeTab === 'editor' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl blur-md opacity-60"></div>
                )}
                <span className="relative flex items-center justify-center">
                  <i className="ri-code-s-line sm:mr-2"></i>
                  <span className="hidden sm:inline">Code Editor</span>
                  <span className="sm:hidden ml-1">Code</span>
                </span>
              </button>
              <button 
                className={`relative flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeTab === 'preview' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-105' 
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:shadow-lg hover:shadow-blue-500/25'
                }`}
                onClick={() => setActiveTab('preview')}
              >
                {activeTab === 'preview' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl blur-md opacity-60"></div>
                )}
                <span className="relative flex items-center justify-center">
                  <i className="ri-play-circle-line sm:mr-2"></i>
                  <span className="hidden sm:inline">Live Preview</span>
                  <span className="sm:hidden ml-1">Preview</span>
                </span>
              </button>
            </div>
          </div>
          
          {/* Content Area with Advanced Styling - Mobile Optimized */}
          <div className="flex-1 overflow-hidden relative z-10 p-2 sm:p-6 pt-2 sm:pt-4">
            <div className="h-full bg-slate-900/50 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              {activeTab === 'editor' ? <EditorFileExplorer /> : <LivePreview />}
            </div>
          </div>
        </div>
      </div>
      
      {/* Premium Modals with Backdrop */}
      {(isDbModalOpen || isDeployModalOpen) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50"></div>
      )}
      {isDbModalOpen && <DatabaseConfig />}
      {isDeployModalOpen && <DeploymentModal />}
      
      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WeblisiteProvider>
          <Switch>
            <Route path="/" component={IdeLayout} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/deployment-success" component={DeploymentSuccess} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </WeblisiteProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
