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
import { projectService, Analysis } from "@/lib/api";

const AnalysisDetail = () => {
  const navigate = useNavigate();
  const { projectId, analysisId } = useParams<{ projectId: string; analysisId: string }>();
  const { isAuthenticated } = useAuth();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (projectId && analysisId) {
      loadAnalysis();
    }
  }, [projectId, analysisId]);

  const loadAnalysis = async () => {
    if (!analysisId) {
      console.error('analysisId não fornecido');
      navigate("/");
      return;
    }
    
    try {
      console.log('Carregando análise:', analysisId);
      setIsLoading(true);
      
      // Carregar dados da análise
      const data = await projectService.getAnalysis(analysisId);
      console.log('Dados da análise carregados:', data);
      
      if (!data) {
        throw new Error('Dados da análise não encontrados');
      }
      
      // Verificar status do PDF
      const pdfStatus = await projectService.checkPdfStatus(analysisId);
      console.log('Status do PDF:', pdfStatus);
      
      // Atualizar dados da análise com status do PDF
      const analysisWithPdfStatus = {
        ...data,
        pdf_available: pdfStatus.exists && pdfStatus.ready,
      };
      
      setAnalysis(analysisWithPdfStatus);
    } catch (error: any) {
      console.error('Erro ao carregar análise:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao carregar análise';
      toast.error(message);
      
      setTimeout(() => {
        navigate(`/project/${projectId}`);
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysisId) {
      toast.error('Análise não encontrada');
      return;
    }
    
    try {
      setIsDownloading(true);
      
      // Se o PDF não está disponível, tentar gerar primeiro
      if (!analysis?.pdf_available) {
        setIsGeneratingPdf(true);
        toast.info('Gerando PDF da análise...');
        
        try {
          await projectService.generatePdf(analysisId);
          
          // Aguardar um pouco e verificar status novamente
          await new Promise(resolve => setTimeout(resolve, 2000));
          const pdfStatus = await projectService.checkPdfStatus(analysisId);
          
          if (!pdfStatus.exists || !pdfStatus.ready) {
            throw new Error('PDF não foi gerado corretamente');
          }
          
          // Atualizar estado da análise
          if (analysis) {
            setAnalysis({
              ...analysis,
              pdf_available: true,
            });
          }
          
        } catch (generateError) {
          console.error('Erro ao gerar PDF:', generateError);
          toast.error('Erro ao gerar PDF da análise');
          return;
        } finally {
          setIsGeneratingPdf(false);
        }
      }
      
      // Baixar o PDF
      const pdfBlob = await projectService.downloadAnalysis(analysisId);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analise_${analysisId}.pdf`;
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
      setIsGeneratingPdf(false);
    }
  };

  const handleBack = () => {
    navigate(`/project/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando análise...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Análise não encontrada</h3>
          <Button onClick={handleBack}>Voltar ao Projeto</Button>
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
                  <h1 className="text-xl font-bold">Análise de Progresso</h1>
                  <p className="text-xs text-muted-foreground">
                    Relatório detalhado da análise
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleDownloadPDF}
              disabled={isDownloading || isGeneratingPdf}
              variant="outline"
            >
              {(isDownloading || isGeneratingPdf) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isGeneratingPdf ? "Gerando PDF..." : 
               isDownloading ? "Baixando..." : 
               analysis.pdf_available ? "Baixar PDF" : "Gerar e Baixar PDF"}
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
                  {analysis.progress_percentage}%
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-success to-accent h-2 rounded-full"
                    style={{ width: `${analysis.progress_percentage}%` }}
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
                  {new Date(analysis.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(analysis.created_at).toLocaleTimeString('pt-BR', {
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
                  ID: {analysis.id}
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
                  {(analysis.analysis?.observations || []).map((observation, index) => (
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
                  {(analysis.analysis?.recommendations || []).map((recommendation, index) => (
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
            {(analysis.analysis?.issues_identified?.length || 0) > 0 && (
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
                    {(analysis.analysis?.issues_identified || []).map((issue, index) => (
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
                  {(analysis.analysis?.next_steps || []).map((step, index) => (
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
                  <Button variant="outline" onClick={handleBack}>
                    Voltar ao Projeto
                  </Button>
                  <Button onClick={handleDownloadPDF} disabled={isDownloading || isGeneratingPdf}>
                    {(isDownloading || isGeneratingPdf) ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {isGeneratingPdf ? "Gerando PDF..." : 
                     isDownloading ? "Baixando..." : 
                     analysis.pdf_available ? "Baixar PDF" : "Gerar e Baixar PDF"}
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

export default AnalysisDetail;