import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, authService, utils } from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = utils.getToken();
      console.log('Verificando token:', token ? 'Token existe' : 'Token não encontrado');
      
      if (!token) {
        console.log('Sem token - usuário não autenticado');
        setIsLoading(false);
        return;
      }

      console.log('Verificando validade do token...');
      const isValid = await authService.verifyToken();
      console.log('Resultado da verificação:', isValid);
      
      if (isValid.valid) {
        const userData = utils.getUserData();
        console.log('Dados do usuário:', userData);
        if (userData) {
          setUser(userData);
          console.log('Usuário definido a partir dos dados salvos');
        } else {
          // Se não tem dados do usuário salvos, busca do servidor
          console.log('Buscando perfil do servidor...');
          const profile = await authService.getProfile();
          setUser(profile);
          utils.saveUserData(profile);
          console.log('Perfil carregado do servidor');
        }
      } else {
        // Token inválido
        console.log('Token inválido - removendo dados');
        utils.removeToken();
        utils.removeUserData();
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      console.log('Removendo dados por causa do erro');
      utils.removeToken();
      utils.removeUserData();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Tentando fazer login com:', { username });
      
      const response = await authService.login({ username, password });
      console.log('Resposta do backend:', response);
      
      if (response.success) {
        utils.saveToken(response.token);
        utils.saveUserData(response.user);
        setUser(response.user);
        toast.success('Login realizado com sucesso!');
        return true;
      } else {
        console.error('Login falhou:', response);
        toast.error(response.message || 'Erro ao fazer login');
        return false;
      }
    } catch (error: any) {
      console.error('Erro completo no login:', error);
      console.error('Resposta do erro:', error.response?.data);
      const message = error.response?.data?.message || error.response?.data?.error || 'Erro ao conectar com o servidor';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.register({ username, email, password });
      
      if (response.success) {
        utils.saveToken(response.token);
        utils.saveUserData(response.user);
        setUser(response.user);
        toast.success('Cadastro realizado com sucesso!');
        return true;
      } else {
        toast.error(response.message || 'Erro ao fazer cadastro');
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer cadastro';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    utils.removeToken();
    utils.removeUserData();
    setUser(null);
    toast.success('Logout realizado com sucesso!');
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};