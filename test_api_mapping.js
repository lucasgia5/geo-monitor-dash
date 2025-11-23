// Script para testar o mapeamento da API
const testBackendResponse = {
  "analysis": {
    "analysis_type": "general_analysis",
    "content": {
      "issues_identified": [
        "Necessidade de reforço nas fundações em determinadas áreas",
        "Atraso na entrega de materiais para as instalações elétricas"
      ],
      "next_steps": [
        "Iniciar a construção das plataformas e dos acessos às estações"
      ],
      "observations": [
        "Fundações profundas estão sendo realizadas para garantir a estabilidade das estruturas"
      ],
      "progress_percentage": 55,
      "recommendations": [
        "Realizar testes de carga nas fundações antes da construção das estruturas"
      ]
    },
    "created_at": "Tue, 14 Oct 2025 19:43:57 GMT",
    "id": "68eea7fdb4768484d4289c37",
    "project_id": "68ee650d76f676eecad5f949",
  },
  "success": true
};

// Simular o mapeamento que fazemos no analyzeProject
function mapAnalysisResponse(response) {
  const analysis = response.analysis;
  
  return {
    ...analysis,
    id: analysis.id || analysis._id,
    project_id: analysis.project_id,
    created_at: analysis.created_at,
    progress_percentage: analysis.content?.progress_percentage || 0, // Campo raiz para o componente
    analysis: {
      progress_percentage: analysis.content?.progress_percentage || 0,
      observations: analysis.content?.observations || [],
      recommendations: analysis.content?.recommendations || [],
      issues_identified: analysis.content?.issues_identified || [],
      next_steps: analysis.content?.next_steps || [],
    },
    current_images_paths: [],
    pdf_path: analysis.pdf_generated ? `/analyses/${analysis.id}/download-pdf` : undefined,
    pdf_available: analysis.pdf_generated === true,
  };
}

// Testar o mapeamento
const mappedAnalysis = mapAnalysisResponse(testBackendResponse);

console.log('TESTE DO MAPEAMENTO:');
console.log('Backend progress_percentage:', testBackendResponse.analysis.content.progress_percentage);
console.log('Frontend progress_percentage (raiz):', mappedAnalysis.progress_percentage);
console.log('Frontend analysis.progress_percentage:', mappedAnalysis.analysis.progress_percentage);
console.log('Componente deveria exibir:', mappedAnalysis.progress_percentage + '%');