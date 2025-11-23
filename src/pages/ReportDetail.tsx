import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  ArrowLeft, 
  Download, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { reportService, Report } from "@/lib/api";

const ReportDetail = () => {
  const navigate = useNavigate();
  const { id: reportId } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (reportId) {
      loadReport();
    }
  }, [reportId]);

  const loadReport = async () => {
    if (!reportId) {
      console.error('reportId não fornecido');
      navigate("/");
      return;
    }
    
    try {
      console.log('Carregando relatório:', reportId);
      setIsLoading(true);
      const data = await reportService.getReport(reportId);
      console.log('Dados do relatório carregados:', data);
      
      if (!data) {
        throw new Error('Dados do relatório não encontrados');
      }
      
      setReport(data);
    } catch (error: any) {
      console.error('Erro ao carregar relatório:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao carregar relatório';
      toast.error(message);
      
      // Aguarda um pouco antes de redirecionar para o usuário ver o erro
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportId) return;
    
    try {
      setIsDownloading(true);
      const pdfBlob = await reportService.downloadReport(reportId);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_${report?.project_name || 'obra'}_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      toast.error('Erro ao baixar relatório');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Relatório não encontrado</h3>
          <Button onClick={handleBack}>Voltar ao Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center shadow-card">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{report.project_name}</h1>
                  <p className="text-xs text-muted-foreground">
                    Relatório de Análise de Progresso
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              variant="outline"
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isDownloading ? "Baixando..." : "Baixar PDF"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Summary */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <CardTitle className="text-lg">Progresso</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success mb-2">
                  {report.progress_percentage}%
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-success to-accent h-2 rounded-full"
                    style={{ width: `${report.progress_percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Data da Análise</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {new Date(report.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(report.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <CardTitle className="text-lg">Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-sm">
                  Análise Concluída
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  ID: {report.id}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Details */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Observations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  Observações
                </CardTitle>
                <CardDescription>
                  Principais aspectos identificados na análise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.analysis.observations.map((observation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-success/5 rounded-lg border border-success/20">
                      <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-success-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm">{observation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-primary" />
                  Recomendações
                </CardTitle>
                <CardDescription>
                  Sugestões para otimizar o progresso da obra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Issues */}
            {report.analysis.issues_identified.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    Problemas Identificados
                  </CardTitle>
                  <CardDescription>
                    Questões que requerem atenção imediata
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.analysis.issues_identified.map((issue, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{issue}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-accent" />
                  Próximos Passos
                </CardTitle>
                <CardDescription>
                  Ações sugeridas para dar continuidade à obra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.analysis.next_steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ações Disponíveis</h3>
                  <p className="text-muted-foreground text-sm">
                    Você pode baixar o relatório em PDF ou fazer uma nova análise
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <Button variant="outline" onClick={() => navigate("/analysis")}>
                    Nova Análise
                  </Button>
                  <Button onClick={handleDownloadPDF} disabled={isDownloading}>
                    {isDownloading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Baixar PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ReportDetail;