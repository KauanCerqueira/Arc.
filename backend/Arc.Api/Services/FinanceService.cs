using Arc.Api.Models;

namespace Arc.Api.Services
{
    public class FinanceService
    {
        public FinanceSummary GetFinanceSummary()
        {
            return new FinanceSummary
            {
                AwsCost = 45.20,
                VercelCost = 0.00,
                DomainCost = 12.00,
                Revenue = 68.00
            };
        }
    }
}