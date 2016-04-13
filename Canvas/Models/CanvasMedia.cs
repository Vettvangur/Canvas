using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Canvas.Models
{
    public class CanvasMedia
    {
        public int id { get; set; }
        public int parentID { get; set; }
        public int sortOrder { get; set; }
        public string text { get; set; }
        public int contentType { get; set; }
        //public string src { get; set; }

        public string src1 { get; set; }
        public string src2 { get; set; }

        //private string _src;
        public string src
        {
            get
            {
                return string.IsNullOrEmpty(src1) ? src2 : src1;
            }

        }
    }
}
