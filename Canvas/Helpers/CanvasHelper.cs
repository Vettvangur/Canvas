using Canvas.Models;
using log4net;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Configuration;

namespace Canvas.Helpers
{
    public static class CanvasHelper
    {
        private static readonly ILog Log =
                LogManager.GetLogger(
                    MethodBase.GetCurrentMethod().DeclaringType
                );


        public static List<CanvasTemplate> GetTemplates(string type)
        {
            List<CanvasTemplate> templates = new List<CanvasTemplate>();

            if (!Directory.Exists(HttpContext.Current.Server.MapPath("/Views/Canvas/Templates")))
            {
                Directory.CreateDirectory(HttpContext.Current.Server.MapPath("/Views/Canvas/Templates"));
            }

            if (!Directory.Exists(HttpContext.Current.Server.MapPath("/Views/Canvas/Templates/" + type)))
            {
                Directory.CreateDirectory(HttpContext.Current.Server.MapPath("/Views/Canvas/Templates/" + type));
            }

            DirectoryInfo templateFolder = new DirectoryInfo(HttpContext.Current.Server.MapPath("/Views/Canvas/Templates/" + type));

            FileInfo[] templateViews = templateFolder.GetFiles();

            foreach (FileInfo template in templateViews)
            {

                var index = template.FullName.LastIndexOf("\\Views");

                var m = new CanvasTemplate();

                m.name = template.Name.Replace(".cshtml", "");
                m.path = template.FullName.Substring(index, template.FullName.Length - index);

                templates.Add(m);
            }

            return templates;
        }

        private static Canvas.Models.CanvasArea AreaResult = null;

        public static CanvasArea GetAreaByAlias(List<CanvasArea> areas, string alias)
        {

            AreaResult = null;

            foreach (var area in areas)
            {
                FindArea(area, alias);
            }

            return AreaResult;

        }

        private static void FindArea(Canvas.Models.CanvasArea area, string alias)
        {

            if (area.Alias == alias)
            {
                AreaResult = area;
            }

            if (AreaResult == null)
            {

                foreach (var c in area.Controls.Where(x => x.Type == "Grid" || x.Type == "Section"))
                {

                    foreach (var a in c.Areas)
                    {
                        FindArea(a, alias);
                    }

                }

            }

        }

        internal static int GetUmbracoVersion()
        {
            int version = 7;

            try
            {

                var v = ConfigurationManager.AppSettings["umbracoConfigurationStatus"];

                if (!string.IsNullOrEmpty(v))
                {
                    if (v.Substring(0, 1) == "6")
                    {
                        version = 6;
                    }
                }

            }
            catch (Exception ex)
            {
                Log.Error("Canvas error on GetUmbracoVersion", ex);
            }

            return version;
        }
    }
}
