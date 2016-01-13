using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Canvas.Models
{
    public class CanvasMacro
    {
        public int id { get; set; }
        public bool macroUseInEditor { get; set; }
        public int macroRefreshRate { get; set; }
        public string macroAlias { get; set; }
        public string macroName { get; set; }
        public string macroScriptType { get; set; }
        public string macroScriptAssembly { get; set; }
        public string macroXSLT { get; set; }
        public bool macroCacheByPage { get; set; }
        public bool macroCachePersonalized { get; set; }
        public bool macroDontRender { get; set; }
        public string macroPython { get; set; }
    }
}
