import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Calendar, LogOut, FileText, User, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { projectService, reportService, Project, Report } from "@/lib/api";
import CompletedProjectsSidebar from "@/components/CompletedProjectsSidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      console.log('Carregando projetos...');
      
      // Debug: verificar todos os projetos no backend
      await projectService.debugAllProjects();
      
      // Temporariamente usar as rotas antigas até o backend implementar as novas
      try {
        const data = await projectService.getProjects();
        console.log('Dashboard - Dados dos projetos (novo):', data);
        console.log('Dashboard - Primeiro projeto:', data[0]);
        
        // Filtrar projetos concluídos no frontend como segurança adicional
        const activeProjects = Array.isArray(data) ? data.filter(project => {
          const isCompleted = project.status === 'completed' || 
                            project.status === 'finished' || 
                            project.name === 'Obra escada'; // Forçar filtro temporário
          
          if (isCompleted) {
            console.log(`🚫 FILTRADO: ${project.name} (status: ${project.status})`);
          }
          
          return !isCompleted;
        }) : [];
        
        console.log('Dashboard - Projetos ativos (após filtro):', activeProjects);
        console.log('Dashboard - Total projetos:', data.length, 'Ativos:', activeProjects.length);
        
        setProjects(activeProjects);
      } catch (newApiError) {
        console.log('Nova API não disponível, usando compatibilidade com reports...');
        // Fallback para as rotas antigas - converter reports em projetos
        const reports = await reportService.getReports();
        
        // Converter reports em projetos simulados
        const mockProjects: Project[] = reports.map(report => ({
          id: report.id,
          name: report.project_name,
          created_at: report.created_at,
          updated_at: report.created_at,
          template_image_path: '',
          analyses_count: 1,
          latest_progress: report.progress_percentage,
        }));
        
        setProjects(mockProjects);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateProject = () => {
    navigate("/create-project");
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center shadow-card">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Metro Monitor</h1>
              <p className="text-xs text-muted-foreground">Monitoramento de Obras - Metro SP</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CompletedProjectsSidebar />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              {user?.email}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Bem-vindo, {user?.username}!
          </h2>
          <p className="text-muted-foreground">
            Sistema de Monitoramento de Obras - Metro SP
          </p>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Novo Projeto</h3>
                  <p className="text-muted-foreground text-sm">
                    Crie um novo projeto de monitoramento de obra
                  </p>
                </div>
                <Button onClick={handleCreateProject} size="lg" className="shrink-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Projeto
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Seus Projetos</h3>
          <p className="text-muted-foreground">
            Gerenciar projetos de monitoramento de obras
          </p>
        </div>

        {isLoadingProjects ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando projetos...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-elevated transition-all cursor-pointer group"
                onClick={() => handleOpenProject(project.id)}
              >
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.created_at).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex justify-between text-sm w-full">
                        <span className="text-muted-foreground">Último Progresso</span>
                        <span className="font-semibold text-success">
                          {project.latest_progress ?? 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-success to-accent h-2 rounded-full transition-all"
                        style={{ width: `${project.latest_progress ?? 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        {project.analyses_count ?? 0} análises
                      </div>
                      {project.status === 'completed' || project.status === 'finished' ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Concluída
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Em Andamento
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum projeto ainda</h3>
            <p className="text-muted-foreground mb-6">
              Crie seu primeiro projeto para começar o monitoramento de obras
            </p>
            <Button onClick={handleCreateProject}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Projeto
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
