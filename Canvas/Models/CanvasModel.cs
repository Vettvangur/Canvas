using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Canvas.Models
{
    public class CanvasModel
    {
        public List<CanvasArea> Areas = new List<CanvasArea>();
    }

    public class CanvasArea
    {
        public string Alias { get; set; }
        public List<CanvasControl> Controls = new List<CanvasControl>();
    }

    public class CanvasControl
    {
        public string Type { get; set; }
        public string Template { get; set; }
        public string Item { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Macro { get; set; }
        public Guid ControlID { get; set; }
        public string Content { get; set; }
        public string Columns { get; set; }
        public string Class { get; set; }
        public List<CanvasArea> Areas = new List<CanvasArea>();
    }
}
