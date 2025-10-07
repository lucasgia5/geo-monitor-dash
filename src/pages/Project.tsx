import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Upload, Camera, History, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Project = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [projectName, setProjectName] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Carregar dados do projeto
    setProjectName(`Projeto ${id}`);
    setCreatedAt(new Date().toLocaleDateString("pt-BR"));
  }, [navigate, id]);

  const handleUpload3D = () => {
    toast.info("Funcionalidade de upload de modelo 3D em desenvolvimento");
  };

  const handleUploadImage = () => {
    toast.info("Funcionalidade de upload de imagem em desenvolvimento");
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
                <h1 className="text-xl font-bold">{projectName}</h1>
                <p className="text-xs text-muted-foreground">Criado em {createdAt}</p>
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Upload 3D Template Card */}
          <Card className="hover:shadow-elevated transition-all group cursor-pointer" onClick={handleUpload3D}>
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                Template 3D da Obra
              </CardTitle>
              <CardDescription>
                Faça upload do modelo 3D completo da construção finalizada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Upload className="mr-2" />
                Fazer Upload
              </Button>
            </CardContent>
          </Card>

          {/* Upload Image Card */}
          <Card className="hover:shadow-elevated transition-all group cursor-pointer" onClick={handleUploadImage}>
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center mb-3 transition-colors">
                <Camera className="w-7 h-7 text-accent" />
              </div>
              <CardTitle className="group-hover:text-accent transition-colors">
                Imagem da Câmera
              </CardTitle>
              <CardDescription>
                Adicione fotos atuais da obra para análise de progresso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="accent" className="w-full">
                <Camera className="mr-2" />
                Adicionar Imagem
              </Button>
            </CardContent>
          </Card>

          {/* View Reports Card */}
          <Card className="hover:shadow-elevated transition-all group cursor-pointer" onClick={handleViewReports}>
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-success/10 group-hover:bg-success/20 flex items-center justify-center mb-3 transition-colors">
                <History className="w-7 h-7 text-success" />
              </div>
              <CardTitle className="group-hover:text-success transition-colors">
                Histórico de Relatórios
              </CardTitle>
              <CardDescription>
                Visualize todos os relatórios de progresso gerados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="success" className="w-full">
                <History className="mr-2" />
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
                  <strong className="text-foreground">Upload do Template 3D:</strong> Carregue o modelo 3D da obra finalizada para servir como referência
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <p>
                  <strong className="text-foreground">Captura de Imagens:</strong> Adicione fotos atuais da construção para análise automática
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-success-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <p>
                  <strong className="text-foreground">Relatórios Automáticos:</strong> O sistema gera relatórios de progresso comparando as imagens com o modelo 3D
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
