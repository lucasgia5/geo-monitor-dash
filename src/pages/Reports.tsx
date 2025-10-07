import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowLeft, FileText, Calendar } from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const handleBack = () => {
    navigate(`/project/${id}`);
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
                <h1 className="text-xl font-bold">Histórico de Relatórios</h1>
                <p className="text-xs text-muted-foreground">Projeto {id}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Relatórios de Progresso</h2>
          <p className="text-muted-foreground">
            Visualize o histórico completo de análises e progresso da obra
          </p>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum relatório ainda</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Os relatórios serão gerados automaticamente após você adicionar imagens da câmera para análise
          </p>
          <Button onClick={handleBack}>
            Voltar ao Projeto
          </Button>
        </div>

        {/* Future Reports List (commented for now) */}
        {/* 
        <div className="space-y-4">
          <Card className="hover:shadow-card transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Relatório #1</CardTitle>
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  15/01/2025
                </span>
              </div>
              <CardDescription>
                Análise de progresso baseada em 5 imagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Progresso detectado</p>
                  <p className="text-2xl font-bold text-success">35%</p>
                </div>
                <Button variant="outline">Ver Detalhes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        */}
      </main>
    </div>
  );
};

export default Reports;
