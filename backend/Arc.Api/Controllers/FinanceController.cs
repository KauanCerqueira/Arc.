using Microsoft.AspNetCore.Mvc;
using Arc.Api.Services;
using Arc.Api.Models;

namespace Arc.Api.Controllers
{
    [ApiController]
    [Route("api/public/[controller]")]
    public class FinanceController : ControllerBase
    {
        private readonly FinanceService _service;

        public FinanceController(FinanceService service)
        {
            _service = service;
        }

        [HttpGet]
        public ActionResult<FinanceSummary> GetFinance()
        {
            var result = _service.GetFinanceSummary();
            return Ok(result);
        }
    }
}