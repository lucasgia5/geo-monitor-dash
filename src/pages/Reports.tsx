import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowLeft, FileText, Calendar, Loader2, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { reportService, Report } from "@/lib/api";
import { toast } from "sonner";
import CompletedProjectsSidebar from "@/components/CompletedProjectsSidebar";

const Reports = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      // Filtrar relatórios pelo projeto específico se necessário
      const data = await reportService.getReports(50, 0);
      
      // Se temos um ID de projeto, filtrar apenas relatórios deste projeto
      if (id) {
        const filteredReports = data.filter(report => 
          report.project_name.toLowerCase().includes(id.toLowerCase()) ||
          report.id === id
        );
        setReports(filteredReports);
      } else {
        setReports(data);
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (id) {
      navigate(`/project/${id}`);
    } else {
      navigate("/");
    }
  };

  const handleOpenReport = (reportId: string) => {
    navigate(`/report/${reportId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
            <CompletedProjectsSidebar />
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

        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        ) : reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-card transition-all cursor-pointer" onClick={() => handleOpenReport(report.id)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="hover:text-primary transition-colors">
                      {report.project_name}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(report.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <CardDescription>
                    Análise de progresso com {report.analysis.observations.length} observações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-sm text-muted-foreground">Progresso detectado</span>
                      </div>
                      <p className="text-2xl font-bold text-success">{report.progress_percentage}%</p>
                      <div className="w-32 bg-secondary rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-success to-accent h-2 rounded-full transition-all"
                          style={{ width: `${report.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                    <Button variant="outline">Ver Detalhes</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum relatório ainda</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Os relatórios serão gerados automaticamente após você fazer análises de progresso
            </p>
            <Button onClick={() => navigate("/analysis")}>
              Fazer Primeira Análise
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
