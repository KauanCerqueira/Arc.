using Arc.Api.Models;

namespace Arc.Api.Services
{
    public class RoadmapService
    {
        public List<RoadmapItem> GetRoadmap()
        {
            return new List<RoadmapItem>
            {
                new RoadmapItem { Phase = "Base do projeto", Status = "Concluído", Description = "Setup inicial com Next.js, .NET e PostgreSQL" },
                new RoadmapItem { Phase = "Painel Build in Public", Status = "Em andamento", Description = "API de métricas e interface pública" },
                new RoadmapItem { Phase = "Sistema de planos de apoio", Status = "Planejado", Description = "Versão gratuita e plano simbólico de apoio" },
                new RoadmapItem { Phase = "AI Insights", Status = "Planejado", Description = "Relatórios automáticos de produtividade" }
            };
        }
    }
}