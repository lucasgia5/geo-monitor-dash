import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus, History, ArrowLeft, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const Project = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, isLoading } = useAuth();

  // Componente já está protegido pelo ProtectedRoute

  const handleNewAnalysis = () => {
    navigate("/analysis");
  };

  const handleViewReports = () => {
    navigate(`/project/${id}/reports`);
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center shadow-card">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Projeto {id}</h1>
                <p className="text-xs text-muted-foreground">Sistema de Monitoramento - Metro SP</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Monitoramento da Obra</h2>
          <p className="text-muted-foreground">
            Gerencie os templates 3D, imagens e relatórios do projeto
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* New Analysis Card */}
          <Card className="hover:shadow-elevated transition-all group cursor-pointer" onClick={handleNewAnalysis}>
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                Nova Análise de Progresso
              </CardTitle>
              <CardDescription>
                Faça upload das imagens da obra para análise automática de progresso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Iniciar Análise
              </Button>
            </CardContent>
          </Card>

          {/* View Reports Card */}
          <Card className="hover:shadow-elevated transition-all group cursor-pointer" onClick={handleViewReports}>
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-success/10 group-hover:bg-success/20 flex items-center justify-center mb-3 transition-colors">
                <FileText className="w-7 h-7 text-success" />
              </div>
              <CardTitle className="group-hover:text-success transition-colors">
                Histórico de Relatórios
              </CardTitle>
              <CardDescription>
                Visualize todos os relatórios de progresso gerados para este projeto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <History className="mr-2 h-4 w-4" />
                Ver Histórico
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-12">
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle>Como funciona o monitoramento?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <p>
                  <strong className="text-foreground">Imagem Modelo:</strong> Faça upload de uma imagem da obra finalizada como referência
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <p>
                  <strong className="text-foreground">Imagens Atuais:</strong> Adicione fotos do estado atual da obra para comparação
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-success-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <p>
                  <strong className="text-foreground">Análise Inteligente:</strong> IA compara as imagens e gera relatório automático de progresso
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Project;
