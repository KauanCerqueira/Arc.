using Microsoft.AspNetCore.Mvc;
using Arc.Api.Services;
using Arc.Api.Models;

namespace Arc.Api.Controllers
{
    [ApiController]
    [Route("api/public/[controller]")]
    public class MetricsController : ControllerBase
    {
        private readonly MetricsService _service;

        public MetricsController(MetricsService service)
        {
            _service = service;
        }

        [HttpGet]
        public ActionResult<MetricsResponse> GetMetrics()
        {
            var result = _service.GetMetrics();
            return Ok(result);
        }
    }
}