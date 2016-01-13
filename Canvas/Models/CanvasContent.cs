using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Canvas.Models
{
    public class CanvasContent
    {
        public string name { get; set; }
        public int id { get; set; }
        public string contentType { get; set; }
        public string url { get; set; }
        public bool hasChildren { get; set; }
    }
}
