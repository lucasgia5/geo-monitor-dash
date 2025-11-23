import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  CheckCircle, 
  Calendar, 
  Building2, 
  Menu,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { projectService, Project } from "@/lib/api";

const CompletedProjectsSidebar = () => {
  const navigate = useNavigate();
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loadCompletedProjects = async () => {
    try {
      setIsLoading(true);
      const projects = await projectService.getCompletedProjects();
      setCompletedProjects(projects);
    } catch (error: any) {
      console.error('Erro ao carregar obras concluídas:', error);
      toast.error('Erro ao carregar obras concluídas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCompletedProjects();
    }
  }, [isOpen]);

  const handleProjectClick = (projectId: string) => {
    // Não navegar para projetos concluídos, apenas mostrar informações
    toast.info('Este projeto está concluído. Visualize os detalhes no histórico de relatórios.');
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Obras Concluídas
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Obras Concluídas
          </SheetTitle>
          <SheetDescription>
            Lista de todas as obras que foram finalizadas com sucesso
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : completedProjects.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-3">
                {completedProjects.map((project) => (
                  <Card 
                    key={project.id} 
                    className="cursor-pointer hover:shadow-md transition-all border-green-200 bg-green-50/50"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-sm font-medium text-gray-900">
                              {project.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="secondary" 
                                className="text-xs bg-green-100 text-green-800 border-green-200"
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                Status: Concluído
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Criado em: {new Date(project.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{project.analyses_count || 0} análises realizadas</span>
                        </div>
                        {project.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Barra de Progresso 100% */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progresso</span>
                          <span className="font-medium text-green-600">100%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma obra concluída</h3>
              <p className="text-muted-foreground text-sm">
                Quando você finalizar obras, elas aparecerão aqui
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CompletedProjectsSidebar;