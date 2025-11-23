import axios from 'axios';

// Configuração do cliente axios
const API_BASE_URL = "https://metro-backend-2zdt.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor para lidar com erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    
    return Promise.reject(error);
  }
);

// Tipos de dados
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

// Nova estrutura baseada em Projetos
export interface Project {
  id: string;
  name: string;
  description?: string;
  template_image_path: string;
  created_at: string;
  updated_at: string;
  analyses_count: number;
  latest_progress?: number;
  status?: string; // 'active', 'completed', 'finished', etc.
}

export interface Analysis {
  id: string;
  project_id: string;
  created_at: string;
  progress_percentage: number;
  analysis: {
    progress_percentage: number;
    observations: string[];
    recommendations: string[];
    issues_identified: string[];
    next_steps: string[];
  };
  current_images_paths: string[];
  pdf_path?: string;
  pdf_available?: boolean;
}

// ProjectDetails removido - agora usamos Project + busca separada de análises

export interface CreateProjectRequest {
  name: string;
  description?: string;
  template_image: File;
}

export interface NewAnalysisRequest {
  current_images: File[];
}

// Interfaces antigas mantidas para compatibilidade (serão removidas gradualmente)
export interface Report {
  id: string;
  project_name: string;
  created_at: string;
  progress_percentage: number;
  analysis: {
    progress_percentage: number;
    observations: string[];
    recommendations: string[];
    issues_identified: string[];
    next_steps: string[];
  };
  pdf_path?: string;
}

export interface AnalysisRequest {
  model_image: File;
  current_images: File[];
  project_name: string;
}

export interface AnalysisResponse {
  success: boolean;
  message: string;
  report_id: string;
  progress_percentage: number;
  analysis: {
    progress_percentage: number;
    observations: string[];
    recommendations: string[];
    issues_identified: string[];
    next_steps: string[];
  };
  pdf_path: string;
}

// Serviços de autenticação
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('Enviando credenciais:', credentials);
    try {
      // Troque '/auth/login' por '/api/auth/login'
      const response = await api.post('/api/auth/login', credentials);
      console.log('Resposta do login:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro no login:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  verifyToken: async (): Promise<{ valid: boolean }> => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

// Serviços de relatórios
// Novos serviços baseados em Projetos
export const projectService = {
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    console.log('Criando projeto:', data.name);
    
    try {
      // Converter imagem template para base64
      const templateImageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const base64String = reader.result as string;
            if (!base64String || !base64String.includes(',')) {
              throw new Error('Formato de imagem inválido');
            }
            // Remove o prefixo "data:image/...;base64," para enviar apenas o base64
            const base64Data = base64String.split(',')[1];
            if (!base64Data) {
              throw new Error('Erro ao processar imagem');
            }
            resolve(base64Data);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Erro ao ler arquivo de imagem'));
        reader.readAsDataURL(data.template_image);
      });

      const requestData = {
        name: data.name,
        description: data.description || '',
        template_image: templateImageBase64,
      };

      console.log('Enviando dados do projeto:', {
        name: requestData.name,
        description: requestData.description,
        template_image_size: templateImageBase64.length
      });

      const response = await api.post('/api/projects', requestData);
      
      console.log('Resposta do backend:', response.data);
      
      const project = response.data.project || response.data;
      return {
        id: project._id || project.id,
        name: project.name,
        description: project.description || '',
        template_image_path: project.template_image_path || '',
        created_at: project.created_at || new Date().toISOString(),
        updated_at: project.updated_at || new Date().toISOString(),
        analyses_count: project.analyses_count || 0,
        latest_progress: project.latest_progress || 0,
      };
    } catch (error: any) {
      console.error('Erro na criação do projeto:', error);
      throw error;
    }
  },

  getProjects: async (): Promise<Project[]> => {
    const timestamp = Date.now();
    const response = await api.get(`/api/projects?t=${timestamp}`); // Quebrar cache
    const projects = response.data.projects || response.data || [];
    
    console.log('BACKEND PROJECTS RAW:', projects);
    
    const mappedProjects = projects.map((project: any) => {
      const mapped = {
        ...project,
        id: project._id || project.id,
        latest_progress: project.latest_progress ?? 0,
        analyses_count: project.analyses_count || 0,
        status: project.status || 'active', // Garantir que status tenha um valor padrão
      };
      
      console.log(`API MAPPING - ${project.name}: status=${project.status} progress=${project.latest_progress}`);
      
      // Log especial para Obra escada
      if (project.name === 'Obra escada') {
        console.log('🔍 OBRA ESCADA DETECTADA:');
        console.log('- Raw project data:', project);
        console.log('- Mapped project:', mapped);
        console.log('- Status original:', project.status);
        console.log('- Status mapeado:', mapped.status);
      }
      
      return mapped;
    });
    
    console.log('ALL MAPPED PROJECTS:', mappedProjects);
    
    // Verificar projetos concluídos localmente
    const completedProjects = JSON.parse(localStorage.getItem('completedProjects') || '[]');
    
    // Filtrar projetos concluídos - apenas projetos ativos aparecem no dashboard principal
    const activeProjects = mappedProjects.filter((project: any) => {
      const isCompletedByStatus = project.status === 'completed' || project.status === 'finished';
      const isCompletedLocally = completedProjects.includes(project.id);
      
      // Se foi marcado como concluído localmente, atualizar o status
      if (isCompletedLocally && !isCompletedByStatus) {
        project.status = 'completed';
      }
      
      return !isCompletedByStatus && !isCompletedLocally;
    });
    
    console.log(`FILTERING: ${mappedProjects.length} total -> ${activeProjects.length} active projects`);
    console.log('COMPLETED PROJECTS FILTERED OUT:', mappedProjects.filter(p => p.status === 'completed' || p.status === 'finished'));
    console.log('ACTIVE PROJECTS (excludes completed):', activeProjects);
    return activeProjects;
  },

  getAllProjects: async (): Promise<Project[]> => {
    const response = await api.get('/api/projects');
    const projects = response.data.projects || response.data || [];
    
    // Verificar projetos concluídos localmente
    const completedProjects = JSON.parse(localStorage.getItem('completedProjects') || '[]');
    
    const mappedProjects = projects.map((project: any) => {
      const mapped = {
        ...project,
        id: project._id || project.id,
        latest_progress: project.latest_progress ?? 0,
        analyses_count: project.analyses_count || 0,
        status: project.status || 'active',
      };
      
      // Se foi marcado como concluído localmente, atualizar o status
      if (completedProjects.includes(mapped.id) && mapped.status !== 'completed') {
        mapped.status = 'completed';
      }
      
      return mapped;
    });
    
    console.log('ALL PROJECTS (includes completed):', mappedProjects);
    return mappedProjects;
  },



  getProjectAnalyses: async (projectId: string): Promise<Analysis[]> => {
    console.log(`Buscando análises do projeto: ${projectId}`);
    try {
      const response = await api.get(`/api/projects/${projectId}/analyses`);
      console.log('Resposta análises:', response.status, response.data);
      const analyses = response.data.analyses || response.data || [];
      
      // Mapear estrutura resumida do backend para frontend
      return analyses.map((rawAnalysis: any) => ({
        id: rawAnalysis.id || rawAnalysis._id,
        project_id: rawAnalysis.project_id,
        created_at: rawAnalysis.created_at,
        progress_percentage: rawAnalysis.content?.progress_percentage || 0,
        analysis: {
          progress_percentage: rawAnalysis.content?.progress_percentage || 0,
          observations: rawAnalysis.content?.observations || [rawAnalysis.title || 'Análise realizada'],
          recommendations: rawAnalysis.content?.recommendations || ['Verificar detalhes completos'],
          issues_identified: rawAnalysis.content?.issues_identified || [],
          next_steps: rawAnalysis.content?.next_steps || ['Analisar resultados'],
        },
        current_images_paths: [],
        pdf_path: rawAnalysis.pdf_generated ? `/analyses/${rawAnalysis.id}/download-pdf` : undefined,
        pdf_available: rawAnalysis.pdf_generated === true,
      }));
    } catch (error: any) {
      console.error('Erro ao buscar análises:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  analyzeProject: async (projectId: string, data: NewAnalysisRequest): Promise<Analysis> => {
    // Converter imagens para base64
    const imagePromises = data.current_images.map(async (image) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          // Remove o prefixo "data:image/...;base64," para enviar apenas o base64
          const base64Data = base64String.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });
    });

    const base64Images = await Promise.all(imagePromises);

    const requestData = {
      current_images: base64Images,
    };

    console.log('Enviando análise com imagens base64:', {
      projectId,
      imageCount: base64Images.length
    });

    const response = await api.post(`/api/projects/${projectId}/analyze`, requestData);

    console.log('Resposta da análise:', response.data);

    // Se recebemos apenas analysis_id, precisamos buscar os dados completos
    if (response.data.analysis_id && !response.data.analysis) {
      const analysisResponse = await api.get(`/api/analyses/${response.data.analysis_id}`);
      const analysis = analysisResponse.data.analysis || analysisResponse.data;
      return {
        ...analysis,
        id: analysis.id || analysis._id,
        // Mapear campos do backend para frontend se necessário
        project_id: analysis.project_id,
        created_at: analysis.created_at,
        progress_percentage: analysis.content?.progress_percentage || 0, // Campo raiz para o componente
        analysis: {
          progress_percentage: analysis.content?.progress_percentage || 0,
          observations: analysis.content?.observations || [analysis.content?.summary || ''],
          recommendations: analysis.content?.recommendations || [],
          issues_identified: analysis.content?.issues_identified || [],
          next_steps: analysis.content?.next_steps || [],
        },
        current_images_paths: [],
        pdf_path: analysis.pdf_generated ? `/analyses/${analysis.id}/download-pdf` : undefined,
        pdf_available: analysis.pdf_generated === true,
      };
    }

    const analysis = response.data.analysis || response.data;
    return {
      ...analysis,
      id: analysis._id || analysis.id || response.data.analysis_id,
    };
  },

  getAnalysis: async (analysisId: string): Promise<Analysis> => {
    console.log(`Buscando análise: ${analysisId}`);
    try {
      const response = await api.get(`/api/analyses/${analysisId}`);
      console.log('Resposta análise:', response.status, response.data);
      const rawAnalysis = response.data.analysis || response.data;
      
      // Mapear estrutura do backend para frontend
      const analysis: Analysis = {
        id: rawAnalysis.id || rawAnalysis._id,
        project_id: rawAnalysis.project_id,
        created_at: rawAnalysis.created_at,
        progress_percentage: rawAnalysis.content?.progress_percentage || 0,
        analysis: {
          progress_percentage: rawAnalysis.content?.progress_percentage || 0,
          observations: rawAnalysis.content?.observations || [rawAnalysis.content?.summary || ''],
          recommendations: rawAnalysis.content?.recommendations || [],
          issues_identified: rawAnalysis.content?.issues_identified || (rawAnalysis.content?.risk_assessment ? [rawAnalysis.content.risk_assessment] : []),
          next_steps: rawAnalysis.content?.next_steps || [],
        },
        current_images_paths: [],
        pdf_path: rawAnalysis.pdf_generated ? `/analyses/${rawAnalysis.id}/download-pdf` : undefined,
        pdf_available: rawAnalysis.pdf_generated === true,
      };
      
      return analysis;
    } catch (error: any) {
      console.error('Erro ao buscar análise:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  // Verificar status do PDF
  checkPdfStatus: async (analysisId: string): Promise<{ exists: boolean; ready: boolean }> => {
    console.log(`Verificando status do PDF: ${analysisId}`);
    try {
      const response = await api.get(`/api/analyses/${analysisId}/pdf-status`);
      console.log('Status do PDF:', response.data);
      const pdfStatus = response.data.pdf_status;
      return {
        exists: pdfStatus.pdf_generated === true,
        ready: pdfStatus.download_available === true,
      };
    } catch (error: any) {
      console.error('Erro ao verificar status do PDF:', error);
      return { exists: false, ready: false };
    }
  },

  // Gerar PDF da análise (na verdade, baixa o PDF diretamente)
  generatePdf: async (analysisId: string): Promise<{ success: boolean; message?: string }> => {
    console.log(`Baixando PDF da análise: ${analysisId}`);
    try {
      // Usar o endpoint de download que sabemos que funciona
      const response = await api.post(`/api/analyses/${analysisId}/download`, {}, {
        responseType: 'blob'
      });
      
      // Criar um link temporário para download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analise_${analysisId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('PDF baixado com sucesso');
      return { success: true, message: 'PDF baixado com sucesso!' };
    } catch (error: any) {
      console.error('Erro ao baixar PDF:', error);
      return { success: false, message: 'Erro ao baixar o PDF. Tente novamente.' };
    }
  },

  // Baixar PDF da análise
  downloadAnalysis: async (analysisId: string): Promise<Blob> => {
    console.log(`Baixando PDF da análise: ${analysisId}`);
    try {
      const response = await api.get(`/api/analyses/${analysisId}/download-pdf`, { responseType: 'blob' });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao baixar PDF:', error);
      throw error;
    }
  },

  // Finalizar projeto/obra
  finishProject: async (projectId: string): Promise<{ success: boolean; message: string }> => {
    console.log(`Finalizando projeto: ${projectId}`);
    try {
      const response = await api.post(`/api/projects/${projectId}/finish`, { status: 'completed' }, { headers: { 'Content-Type': 'application/json' } });
      console.log('Projeto finalizado - Resposta completa:', response.data);
      console.log('Status da resposta:', response.status);
      
      // Marcar localmente como concluído (fallback se backend não implementou)
      const completedProjects = JSON.parse(localStorage.getItem('completedProjects') || '[]');
      if (!completedProjects.includes(projectId)) {
        completedProjects.push(projectId);
        localStorage.setItem('completedProjects', JSON.stringify(completedProjects));
        console.log('Projeto marcado como concluído localmente:', projectId);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao finalizar projeto:', error);
      console.error('Status do erro:', error.response?.status);
      console.error('Dados do erro:', error.response?.data);
      
      // Se o backend não implementou o endpoint, marcar localmente
      if (error.response?.status === 404 || error.response?.status === 405) {
        console.log('Backend não implementou /finish, marcando localmente...');
        const completedProjects = JSON.parse(localStorage.getItem('completedProjects') || '[]');
        if (!completedProjects.includes(projectId)) {
          completedProjects.push(projectId);
          localStorage.setItem('completedProjects', JSON.stringify(completedProjects));
          console.log('Projeto marcado como concluído localmente (fallback):', projectId);
        }
        return { success: true, message: 'Projeto finalizado com sucesso!' };
      }
      
      throw error;
    }
  },

  // Função de debug para verificar todos os projetos
  debugAllProjects: async (): Promise<void> => {
    try {
      const response = await api.get('/api/projects');
      const projects = response.data.projects || response.data || [];
      
      console.log('=== DEBUG: TODOS OS PROJETOS ===');
      projects.forEach((project: any, index: number) => {
        console.log(`${index + 1}. ${project.name}:`);
        console.log(`   - ID: ${project.id || project._id}`);
        console.log(`   - Status: ${project.status}`);
        console.log(`   - Progress: ${project.latest_progress}`);
        console.log(`   - Raw data:`, project);
        console.log('---');
      });
      console.log('=== FIM DEBUG ===');
    } catch (error) {
      console.error('Erro no debug:', error);
    }
  },

  // Buscar projetos concluídos
  getCompletedProjects: async (): Promise<Project[]> => {
    console.log('Buscando projetos concluídos');
    try {
      // Primeiro tenta o endpoint específico do backend
      try {
        const response = await api.get('/api/projects/completed');
        console.log('Projetos concluídos (endpoint específico):', response.data);
        const projects = response.data.projects || response.data || [];
        
        return projects.map((project: any) => ({
          ...project,
          id: project._id || project.id,
          latest_progress: project.latest_progress ?? 100, // Projetos concluídos têm 100%
          analyses_count: project.analyses_count || 0,
        }));
      } catch (endpointError) {
        console.log('Endpoint /projects/completed não disponível, filtrando localmente');
        
        // Fallback: buscar todos os projetos e filtrar localmente
        const allProjects = await projectService.getAllProjects();
        console.log('SIDEBAR - Todos os projetos:', allProjects.map(p => ({ name: p.name, status: p.status })));
        
        const completedProjects = allProjects.filter((project: any) => 
          project.status === 'completed' || project.status === 'finished'
        );
        
        console.log('SIDEBAR - Projetos concluídos encontrados:', completedProjects.length);
        console.log('SIDEBAR - Projetos concluídos (filtrados localmente):', completedProjects.map(p => ({ name: p.name, status: p.status })));
        return completedProjects;
      }
    } catch (error: any) {
      console.error('Erro ao buscar projetos concluídos:', error);
      throw error;
    }
  },

  // Buscar cotação entre moedas
  getExchangeRate: async (from: string, to: string): Promise<{ rate: number, updated_at?: string }> => {
    // Exemplo de endpoint: /exchange-rate?from=BRL&to=EUR
    const response = await api.get(`/api/exchange-rate?from=${from}&to=${to}`);
    return response.data;
  },
};

// Serviços antigos mantidos para compatibilidade (serão removidos gradualmente)
export const reportService = {
  analyzeProgress: async (data: AnalysisRequest): Promise<AnalysisResponse> => {
    const formData = new FormData();
    formData.append('model_image', data.model_image);
    
    data.current_images.forEach((image) => {
      formData.append('current_images', image);
    });
    
    formData.append('project_name', data.project_name);

    const response = await api.post('/api/reports/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getReports: async (limit = 10, skip = 0): Promise<Report[]> => {
    console.log(`Buscando relatórios: limit=${limit}, skip=${skip}`);
    try {
      const response = await api.get(`/api/reports/reports?limit=${limit}&skip=${skip}`);
      console.log('Resposta getReports:', response.status, response.data);
      // Backend retorna { reports: [...] }
      const reports = response.data.reports || [];
      // Mapeia _id para id
      return reports.map((report: any) => ({
        ...report,
        id: report._id,
      }));
    } catch (error: any) {
      console.error('Erro em getReports:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  getReport: async (reportId: string): Promise<Report> => {
    const response = await api.get(`/api/reports/reports/${reportId}`);
    // Backend retorna { report: {...} }
    const report = response.data.report;
    // Mapeia _id para id
    return {
      ...report,
      id: report._id,
    };
  },

  downloadReport: async (reportId: string): Promise<Blob> => {
    const response = await api.get(`/api/reports/file/${reportId}`, { responseType: 'blob' });
    return response.data;
  },
};

// Utilitários
export const utils = {
  saveToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  removeToken: () => {
    localStorage.removeItem('auth_token');
  },

  saveUserData: (user: User) => {
    localStorage.setItem('user_data', JSON.stringify(user));
  },

  getUserData: (): User | null => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  removeUserData: () => {
    localStorage.removeItem('user_data');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
};

export default api;