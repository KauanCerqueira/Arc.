using Microsoft.AspNetCore.Mvc;
using Arc.Api.Services;
using Arc.Api.Models;

namespace Arc.Api.Controllers
{
    [ApiController]
    [Route("api/public/[controller]")]
    public class RoadmapController : ControllerBase
    {
        private readonly RoadmapService _service;

        public RoadmapController(RoadmapService service)
        {
            _service = service;
        }

        [HttpGet]
        public ActionResult<IEnumerable<RoadmapItem>> GetRoadmap()
        {
            var result = _service.GetRoadmap();
            return Ok(result);
        }
    }
}