using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core.Models;

namespace Canvas.Models
{
    public class CanvasView
    {
        public string alias { get; set; }
        public string viewName { get; set; }
        public IContent page { get; set; }
        public IPublishedContent node { get; set; }
    }
}
