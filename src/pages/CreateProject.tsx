import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowLeft, Upload, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { projectService, CreateProjectRequest } from "@/lib/api";
import CompletedProjectsSidebar from "@/components/CompletedProjectsSidebar";

const CreateProject = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [templateImages, setTemplateImages] = useState<File[]>([]);
  const [templatePreviews, setTemplatePreviews] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const totalImages = templateImages.length + files.length;
    if (totalImages > 10) {
      toast.error(`Máximo 10 imagens por projeto. Você já tem ${templateImages.length} imagem(ns) e está tentando adicionar ${files.length}.`);
      return;
    }

    setTemplateImages(prev => [...prev, ...files]);
    
    // Criar previews para as novas imagens
    const newPreviews: string[] = [];
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews[index] = e.target?.result as string;
        if (newPreviews.filter(p => p).length === files.length) {
          setTemplatePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeTemplateImage = (index: number) => {
    setTemplateImages(prev => prev.filter((_, i) => i !== index));
    setTemplatePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }
    
    if (templateImages.length === 0) {
      toast.error('Pelo menos uma imagem template é obrigatória');
      return;
    }

    setIsLoading(true);
    
    try {
      const projectData: CreateProjectRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        template_image: templateImages[0], // Por enquanto, usar apenas a primeira imagem
      };

      console.log('Criando projeto:', projectData.name);
      const newProject = await projectService.createProject(projectData);
      
      toast.success('Projeto criado com sucesso!');
      navigate(`/project/${newProject.id}`);
    } catch (error: any) {
      console.error('Erro ao criar projeto:', error);
      const message = error.response?.data?.message || 'Erro ao criar projeto';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
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
                  <h1 className="text-xl font-bold">Novo Projeto</h1>
                  <p className="text-xs text-muted-foreground">
                    Criar projeto de monitoramento
                  </p>
                </div>
              </div>
            </div>
            <CompletedProjectsSidebar />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Projeto</CardTitle>
              <CardDescription>
                Crie um novo projeto de monitoramento de obras. O template será usado como referência para todas as análises futuras.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome do Projeto */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Projeto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Estação Vila Madalena"
                    maxLength={100}
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descreva os detalhes do projeto..."
                    maxLength={500}
                    rows={3}
                  />
                </div>

                {/* Template da Construção Final */}
                <div className="space-y-4">
                  <Label>Imagens Template da Construção Final * (até 10 imagens)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {templatePreviews.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {templatePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Template ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg shadow-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeTemplateImage(index)}
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
                              setTemplateImages([]);
                              setTemplatePreviews([]);
                            }}
                          >
                            Remover Todas
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('template-input')?.click()}
                          >
                            Adicionar Mais
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Faça upload do template final</p>
                          <p className="text-xs text-muted-foreground">
                            Esta imagem será usada como referência para comparar o progresso da obra
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('template-input')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Selecionar Template
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <input
                    id="template-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleTemplateImageChange}
                    className="hidden"
                  />
                  
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: JPG, PNG, GIF. Máximo 10 imagens, 10MB cada.
                  </p>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.name.trim() || templateImages.length === 0}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Criar Projeto'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;