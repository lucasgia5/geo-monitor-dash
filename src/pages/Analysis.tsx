import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Upload, ArrowLeft, X, FileImage, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { reportService } from "@/lib/api";
import CompletedProjectsSidebar from "@/components/CompletedProjectsSidebar";

const Analysis = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [projectName, setProjectName] = useState("");
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [currentImages, setCurrentImages] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleBack = () => {
    navigate("/");
  };

  const handleModelImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 16 * 1024 * 1024) { // 16MB limit
        toast.error("Imagem muito grande. Máximo 16MB.");
        return;
      }
      setModelImage(file);
    }
  };

  const handleCurrentImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > 16 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Algumas imagens são muito grandes. Máximo 16MB por imagem.");
      return;
    }

    // Limit to 10 images
    if (files.length > 10) {
      toast.error("Máximo 10 imagens por vez.");
      return;
    }

    setCurrentImages(prev => [...prev, ...files].slice(0, 10));
  };

  const removeCurrentImage = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeModelImage = () => {
    setModelImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      toast.error("Por favor, insira o nome do projeto");
      return;
    }

    if (!modelImage) {
      toast.error("Por favor, selecione a imagem modelo da obra finalizada");
      return;
    }

    if (currentImages.length === 0) {
      toast.error("Por favor, selecione pelo menos uma imagem atual");
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const result = await reportService.analyzeProgress({
        model_image: modelImage,
        current_images: currentImages,
        project_name: projectName.trim()
      });

      if (result.success) {
        console.log('Análise bem-sucedida, resultado:', result);
        toast.success("Análise concluída com sucesso!");
        console.log('Navegando para:', `/report/${result.report_id}`);
        navigate(`/report/${result.report_id}`);
      } else {
        console.error('Análise falhou:', result);
        toast.error(result.message || "Erro na análise");
      }
    } catch (error: any) {
      console.error('Erro na análise:', error);
      const message = error.response?.data?.message || "Erro ao processar análise";
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Componente já está protegido pelo ProtectedRoute

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
                  <h1 className="text-xl font-bold">Nova Análise</h1>
                  <p className="text-xs text-muted-foreground">Análise de Progresso de Obra</p>
                </div>
              </div>
            </div>
            <CompletedProjectsSidebar />
          </div>
        </div>
      </header>

      {/* Overlay de análise */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">🤖 Nossa IA está cuidando de tudo para você!</h3>
              <p className="text-muted-foreground mb-4">
                Processando as imagens e analisando o progresso da obra. Relaxe, isso será feito em alguns minutos.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span>Comparando imagens...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                  <span>Calculando progresso...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
                  <span>Gerando relatório...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Análise de Progresso</h2>
            <p className="text-muted-foreground">
              Faça upload das imagens para análise automática do progresso da obra
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Name */}
            <Card>
              <CardHeader>
                <CardTitle>Nome do Projeto</CardTitle>
                <CardDescription>
                  Identifique o projeto ou obra para organização dos relatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="projectName">Nome do Projeto</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ex: Estação Vila Madalena - Linha 2 Verde"
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* Model Image */}
            <Card>
              <CardHeader>
                <CardTitle>Imagem da Obra Finalizada (Modelo)</CardTitle>
                <CardDescription>
                  Selecione uma imagem de referência mostrando como a obra deve ficar quando concluída
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!modelImage ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <Label htmlFor="modelImage" className="cursor-pointer">
                      <span className="text-lg font-semibold">Clique para selecionar a imagem modelo</span>
                      <p className="text-sm text-muted-foreground mt-2">
                        PNG, JPG ou JPEG. Máximo 16MB.
                      </p>
                    </Label>
                    <Input
                      id="modelImage"
                      type="file"
                      accept="image/*"
                      onChange={handleModelImageChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <FileImage className="w-8 h-8 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{modelImage.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(modelImage.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeModelImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Images */}
            <Card>
              <CardHeader>
                <CardTitle>Imagens Atuais da Obra</CardTitle>
                <CardDescription>
                  Selecione as imagens mostrando o estado atual da obra (máximo 10 imagens)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <Label htmlFor="currentImages" className="cursor-pointer">
                    <span className="font-semibold">Adicionar imagens atuais</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      PNG, JPG ou JPEG. Máximo 10 imagens, 16MB cada.
                    </p>
                  </Label>
                  <Input
                    id="currentImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCurrentImagesChange}
                    className="hidden"
                  />
                </div>

                {currentImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {currentImages.length} imagem(ns) selecionada(s):
                    </p>
                    <div className="space-y-2">
                      {currentImages.map((file, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                          <FileImage className="w-6 h-6 text-accent" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCurrentImage(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isAnalyzing || !projectName.trim() || !modelImage || currentImages.length === 0}
                className="min-w-32"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Building2 className="mr-2 h-4 w-4" />
                    Iniciar Análise
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Analysis;