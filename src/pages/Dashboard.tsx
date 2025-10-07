import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus, Calendar, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  createdAt: string;
  progress: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Carregar projetos mockados
    const mockProjects: Project[] = [];
    setProjects(mockProjects);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    toast.success("Logout realizado com sucesso");
    navigate("/login");
  };

  const handleCreateProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `Projeto ${projects.length + 1}`,
      createdAt: new Date().toLocaleDateString("pt-BR"),
      progress: 0,
    };
    setProjects([...projects, newProject]);
    toast.success("Projeto criado com sucesso!");
    navigate(`/project/${newProject.id}`);
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
              <h1 className="text-xl font-bold">BuildMonitor</h1>
              <p className="text-xs text-muted-foreground">Monitoramento de Obras</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Meus Projetos</h2>
          <p className="text-muted-foreground">
            Gerencie e monitore todas as suas obras em um só lugar
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Create New Project Card */}
          <Card
            className="border-dashed border-2 hover:border-primary hover:shadow-card transition-all cursor-pointer group"
            onClick={handleCreateProject}
          >
            <CardContent className="flex flex-col items-center justify-center h-48 p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Criar Novo Projeto</h3>
              <p className="text-sm text-muted-foreground text-center">
                Inicie o monitoramento de uma nova obra
              </p>
            </CardContent>
          </Card>

          {/* Project Cards */}
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
                  Criado em {project.createdAt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-gradient-hero h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum projeto ainda</h3>
            <p className="text-muted-foreground mb-6">
              Crie seu primeiro projeto para começar o monitoramento
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
