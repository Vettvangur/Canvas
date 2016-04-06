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

        private string _src;
        public string src
        {
            set
            {
                var json = JObject.Parse(value);

                _src = (string)json["src"];
            }
            get
            {
                return _src;
            }
        }
    }
}
