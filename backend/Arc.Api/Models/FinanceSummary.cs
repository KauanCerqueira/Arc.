namespace Arc.Api.Models
{
    public class FinanceSummary
    {
        public double AwsCost { get; set; }
        public double VercelCost { get; set; }
        public double DomainCost { get; set; }
        public double TotalCost => AwsCost + VercelCost + DomainCost;
        public double Revenue { get; set; }
        public double Balance => Revenue - TotalCost;
    }
}