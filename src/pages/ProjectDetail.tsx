import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CompletedProjectsSidebar from "@/components/CompletedProjectsSidebar";
import { 
  Building2, 
  ArrowLeft, 
  Plus, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Upload,
  Loader2,
  CheckCircle,
  ImageIcon,
  Download,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { projectService, Project, Analysis, NewAnalysisRequest } from "@/lib/api";

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFinalizingProject, setIsFinalizingProject] = useState(false);
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);
  const [currentImages, setCurrentImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) {
      console.error('projectId não fornecido');
      navigate("/");
      return;
    }
    
    try {
      console.log('Carregando projeto:', projectId);
      setIsLoading(true);
      
      // Como não temos GET /projects/{id}, vamos buscar da lista de projetos
      try {
        const projectsData = await projectService.getProjects();
        const foundProject = projectsData.find((p: Project) => p.id === projectId);
        
        if (!foundProject) {
          throw new Error('Projeto não encontrado na lista');
        }
        
        console.log('Dados do projeto encontrado:', foundProject);
        console.log('Status do projeto:', foundProject.status);
        console.log('latest_progress específico:', foundProject.latest_progress, typeof foundProject.latest_progress);
        
        // Se o projeto está concluído, redirecionar para o dashboard
        if (foundProject.status === 'completed' || foundProject.status === 'finished') {
          console.log('Projeto concluído detectado, redirecionando para dashboard...');
          toast.info('Este projeto já foi concluído. Você pode visualizá-lo nas obras concluídas.');
          navigate("/");
          return;
        }
        
        setProject(foundProject);
        
      } catch (projectError) {
        console.log('Erro ao buscar projeto, criando dados básicos...');
        // Se falhar, criar dados básicos do projeto
        const basicProject: Project = {
          id: projectId,
          name: 'Projeto',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          template_image_path: '',
          analyses_count: 0,
          latest_progress: 0,
        };
        setProject(basicProject);
      }
      
      // Carregar análises do projeto
      await loadAnalyses();
      
    } catch (error: any) {
      console.error('Erro ao carregar projeto:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao carregar projeto';
      toast.error(message);
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalyses = async () => {
    if (!projectId) return;
    
    try {
      setIsLoadingAnalyses(true);
      const analysesData = await projectService.getProjectAnalyses(projectId);
      console.log('Análises carregadas:', analysesData);
      setAnalyses(analysesData);
      
      // Atualizar apenas a contagem de análises (latest_progress já vem correto do backend)
      if (project) {
        setProject(prevProject => ({
          ...prevProject!,
          analyses_count: analysesData.length
        }));
      }
    } catch (error: any) {
      console.error('Erro ao carregar análises:', error);
      // Não mostrar toast para erro de análises, pode não ter nenhuma ainda
      setAnalyses([]);
    } finally {
      setIsLoadingAnalyses(false);
    }
  };

  const handleCurrentImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    // Validar arquivos
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }
    
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Cada imagem deve ter no máximo 10MB');
      return;
    }

    // Verificar se não excede o limite de 10 imagens
    const totalImages = currentImages.length + files.length;
    if (totalImages > 10) {
      toast.error(`Máximo 10 imagens por análise. Você já tem ${currentImages.length} imagem(ns) e está tentando adicionar ${files.length}.`);
      return;
    }

    setCurrentImages(prev => [...prev, ...files]);
    
    // Criar previews para as novas imagens
    const newPreviews: string[] = [];
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews[index] = e.target?.result as string;
        if (newPreviews.filter(p => p).length === files.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeCurrentImage = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartAnalysis = async () => {
    if (currentImages.length === 0) {
      toast.error('Selecione pelo menos uma imagem atual');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const analysisData: NewAnalysisRequest = {
        current_images: currentImages,
      };

      console.log('Iniciando nova análise para projeto:', projectId);
      const analysis = await projectService.analyzeProject(projectId!, analysisData);
      
      toast.success('Análise criada com sucesso!');
      
      // Aguardar um pouco para o backend processar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recarregar análises para mostrar nova análise
      await loadAnalyses();
      
      // Recarregar dados do projeto para atualizar contadores
      await loadProject();
      
      // Fechar modal e limpar campos apenas após recarregar dados
      setShowNewAnalysis(false);
      setCurrentImages([]);
      setImagePreviews([]);
      
      // Navegar para a análise criada
      navigate(`/project/${projectId}/analysis/${analysis.id}`);
    } catch (error: any) {
      console.error('Erro ao iniciar análise:', error);
      const message = error.response?.data?.message || 'Erro ao iniciar análise';
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFinishProject = async () => {
    if (!project) return;
    
    // Confirmar com o usuário
    if (!confirm(`Tem certeza que deseja finalizar o projeto "${project.name}"?\n\nEsta ação irá marcar a obra como concluída e não poderá ser desfeita.`)) {
      return;
    }

    setIsFinalizingProject(true);
    
    try {
      console.log('ANTES DE FINALIZAR - Status do projeto:', project.status);
      
      // Rota que você vai implementar no backend
      const result = await projectService.finishProject(projectId!);
      
      console.log('RESULTADO DA FINALIZAÇÃO:', result);
      
      toast.success('Obra finalizada com sucesso!');
      
      // Recarregar dados do projeto para refletir o novo status
      await loadProject();
      
      console.log('APÓS RECARREGAR - Status do projeto:', project.status);
      
    } catch (error: any) {
      console.error('Erro ao finalizar projeto:', error);
      console.error('Resposta do servidor:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      
      const message = error.response?.data?.message || error.response?.data?.error || 'Erro ao finalizar obra';
      toast.error(message);
    } finally {
      setIsFinalizingProject(false);
    }
  };

  const handleOpenAnalysis = (analysisId: string) => {
    navigate(`/project/${projectId}/analysis/${analysisId}`);
  };

  const handleBack = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Projeto não encontrado</h3>
          <Button onClick={handleBack}>Voltar ao Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modal de Análise */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">🤖 Nossa IA está cuidando de tudo para você!</h3>
              <p className="text-muted-foreground mb-4">
                Analisando as novas imagens e calculando o progresso da obra. Aguarde um momento.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span>Processando imagens...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                  <span>Analisando mudanças...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
                  <span>Gerando resultados...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <h1 className="text-xl font-bold">{project.name}</h1>
                  <p className="text-xs text-muted-foreground">
                    Projeto de Monitoramento
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CompletedProjectsSidebar />
              <Button
                onClick={() => setShowNewAnalysis(!showNewAnalysis)}
                disabled={isAnalyzing}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Análise
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Project Info */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Criado em</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {new Date(project.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <CardTitle className="text-lg">Análises</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success mb-2">
                  {project.analyses_count}
                </div>
                <p className="text-sm text-muted-foreground">
                  Total realizadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  <CardTitle className="text-lg">Último Progresso</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent mb-2">
                  {project.latest_progress ?? 0}%
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-success to-accent h-2 rounded-full"
                    style={{ width: `${project.latest_progress ?? 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {project.status === 'completed' || project.status === 'finished' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-orange-600" />
                  )}
                  <CardTitle className="text-lg">Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {project.status === 'completed' || project.status === 'finished' ? (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Concluída
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                      <Clock className="w-3 h-3 mr-1" />
                      Em Andamento
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* New Analysis Form */}
          {showNewAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Nova Análise de Progresso</CardTitle>
                <CardDescription>
                  Faça upload das imagens atuais da obra para comparar com o template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Imagens Atuais */}
                <div className="space-y-4">
                  <Label>Imagens Atuais da Obra *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {imagePreviews.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg shadow-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeCurrentImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remover imagem"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setCurrentImages([]);
                              setImagePreviews([]);
                            }}
                          >
                            Remover Todas
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('current-input')?.click()}
                          >
                            Trocar Imagens
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Faça upload das imagens atuais</p>
                          <p className="text-xs text-muted-foreground">
                            Estas imagens serão comparadas com o template do projeto
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('current-input')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Selecionar Imagens
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <input
                    id="current-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCurrentImagesChange}
                    className="hidden"
                  />
                  
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: JPG, PNG, GIF. Máximo 10 imagens, 10MB cada
                  </p>
                </div>

                {/* Botões */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewAnalysis(false)}
                    disabled={isAnalyzing}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing || currentImages.length === 0}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Iniciar Análise
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analyses History */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Histórico de Análises</h3>
                <p className="text-muted-foreground">
                  Todas as análises realizadas neste projeto
                </p>
              </div>
            </div>

            {analyses.length > 0 ? (
              <div className="grid gap-4">
                {analyses
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((analysis) => (
                    <Card
                      key={analysis.id}
                      className="hover:shadow-elevated transition-all cursor-pointer group"
                      onClick={() => handleOpenAnalysis(analysis.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <Badge variant="secondary">
                                {analysis.progress_percentage}% de progresso
                              </Badge>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {new Date(analysis.created_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{analysis.analysis?.observations?.length || 0} observações</span>
                              <span>{analysis.analysis?.recommendations?.length || 0} recomendações</span>
                              <span>{analysis.analysis?.issues_identified?.length || 0} problemas</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20">
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-success to-accent h-2 rounded-full"
                                  style={{ width: `${analysis.progress_percentage}%` }}
                                />
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhuma análise ainda</h3>
                <p className="text-muted-foreground mb-6">
                  Faça a primeira análise para começar o monitoramento deste projeto
                </p>
                <Button onClick={() => setShowNewAnalysis(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Primeira Análise
                </Button>
              </div>
            )}
          </div>

          {/* Finalizar Obra */}
          {project && (
            <div className="mt-8 pt-8 border-t">
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-orange-900">Finalizar Obra</h3>
                        <p className="text-sm text-orange-700">
                          Marque esta obra como concluída. Esta ação não poderá ser desfeita.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleFinishProject}
                      disabled={isFinalizingProject}
                      variant="default"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {isFinalizingProject ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Finalizando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Finalizar Obra
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;