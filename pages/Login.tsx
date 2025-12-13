
import React, { useState } from 'react';
import { useData } from '../services/DataManager';
import { Beer, Lock, User, Eye, EyeOff, Loader2, Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { INITIAL_USERS } from '../constants';

const Login: React.FC = () => {
  const { login, isLoading: isDataLoading, connectionError, users, addUser } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    
    try {
        const success = await login(username, password);
        if (!success) {
          setError('Usuário ou senha inválidos');
        }
    } catch (e) {
        setError('Erro ao processar login');
    } finally {
        setIsLoggingIn(false);
    }
  };

  const handleAutoSeed = async () => {
    setIsSeeding(true);
    try {
        // Attempt to re-inject the admin user
        await addUser(INITIAL_USERS[0]);
        window.location.reload(); // Refresh to fetch new data
    } catch (e) {
        alert("Erro ao tentar criar usuário. Verifique as permissões SQL (RLS).");
    } finally {
        setIsSeeding(false);
    }
  };

  if (isDataLoading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
             <div className="text-white flex flex-col items-center">
                 <Loader2 className="animate-spin mb-4" size={40} />
                 <p>Carregando sistema...</p>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-8 animate-fade-in-down z-10">
        <div className="text-center">
          <div className="bg-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform -rotate-6">
            <Beer size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Gestão de Bar</h2>
          <p className="text-slate-500 mt-2">Sistema de Gestão de Eventos</p>
        </div>

        {/* WARNING: NO USERS FOUND */}
        {!connectionError && users.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex flex-col items-center text-center">
                <AlertTriangle size={24} className="mb-2 text-amber-600"/>
                <p className="font-bold mb-1">Nenhum usuário encontrado!</p>
                <p className="mb-3 opacity-90">O banco de dados está conectado mas vazio. As políticas de segurança podem ter bloqueado a criação automática.</p>
                <button 
                    onClick={handleAutoSeed}
                    disabled={isSeeding}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center"
                >
                    {isSeeding ? <Loader2 className="animate-spin mr-2" size={12}/> : <RefreshCw className="mr-2" size={12} />}
                    Tentar Criar Admin Agora
                </button>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-10 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn || !!connectionError}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
                <>
                    <Loader2 className="animate-spin mr-2" size={20}/>
                    Verificando...
                </>
            ) : "Entrar no Sistema"}
          </button>
        </form>
        
        <div className="border-t border-slate-100 pt-4 flex justify-center">
            {connectionError ? (
                <div className="flex items-center text-red-500 text-xs font-medium">
                    <WifiOff size={14} className="mr-1.5" />
                    <span>Desconectado: {connectionError}</span>
                </div>
            ) : (
                <div className="flex items-center text-emerald-600 text-xs font-medium">
                    <Wifi size={14} className="mr-1.5" />
                    <span>Conectado (Usuários: {users.length})</span>
                </div>
            )}
        </div>
      </div>
      
      <p className="absolute bottom-4 text-center text-xs text-slate-500 opacity-50">
        &copy; 2025 Gestão de Bar.
      </p>
    </div>
  );
};

export default Login;
