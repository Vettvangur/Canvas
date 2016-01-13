using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Canvas.Models
{
    public class CanvasMacroProperty
    {
        public int id { get; set; }
        public string editorAlias { get; set; }
        public int macro { get; set; }
        public int macroPropertySortOrder { get; set; }
        public string macroPropertyAlias { get; set; }
        public string macroPropertyName { get; set; }
        public int macroPropertyType { get; set; }
    }
}
