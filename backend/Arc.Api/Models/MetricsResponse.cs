namespace Arc.Api.Models
{
    public class MetricsResponse
    {
        public int ActiveUsers { get; set; }
        public int PaidUsers { get; set; }
        public double AwsCost { get; set; }
        public double VercelCost { get; set; }
        public double TotalCost => AwsCost + VercelCost;
        public double Revenue { get; set; }
        public double Balance => Revenue - TotalCost;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}