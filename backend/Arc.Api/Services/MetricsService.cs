using Arc.Api.Models;

namespace Arc.Api.Services
{
    public class MetricsService
    {
        public MetricsResponse GetMetrics()
        {
            return new MetricsResponse
            {
                ActiveUsers = 127,
                PaidUsers = 6,
                AwsCost = 8.34,
                VercelCost = 0.00,
                Revenue = 48.00
            };
        }
    }
}