using Canvas.Models;
using log4net;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Core.Services;
using Umbraco.Web;

namespace Canvas.Helpers
{
    public static class Repository
    {
        private static IContentService cs = ApplicationContext.Current.Services.ContentService;

        private static readonly ILog Log =
                LogManager.GetLogger(
                    MethodBase.GetCurrentMethod().DeclaringType
                );
        public static CanvasModel GetObjectById(int pageId)
        {
            try
            {
                var node = cs.GetById(pageId);

                string json = node.GetValue<string>("canvas");

                var model = new CanvasModel();

                if (!string.IsNullOrEmpty(json))
                {
                    model = JsonConvert.DeserializeObject<CanvasModel>(json);
                }

                return model;
            }
            catch (Exception ex)
            {
                Log.Error("Canvas error on GetObjectById in Repository.", ex);
                return null;
            }

        }

        public static CanvasModel GetObjectByPage(IContent node)
        {
            try
            {
                string json = node.GetValue<string>("canvas");

                var model = new CanvasModel();

                if (!string.IsNullOrEmpty(json))
                {
                    model = JsonConvert.DeserializeObject<CanvasModel>(json);
                }

                return model;
            }
            catch (Exception ex)
            {
                Log.Error("Canvas error on GetObjectByPage in Repository.", ex);
                return null;
            }

        }

        public static CanvasModel GetObjectByNode(IPublishedContent node)
        {
            try
            {
                var model = new CanvasModel();

                if (node.HasProperty("canvas") && node.HasValue("canvas"))
                {

                    string json = node.GetPropertyValue<string>("canvas");

                    model = JsonConvert.DeserializeObject<CanvasModel>(json);

                }

                return model;
            }
            catch (Exception ex)
            {
                Log.Error("Canvas error on GetObjectByNode in Repository.", ex);
                return null;
            }

        }

        public static string GetJson(int pageId)
        {
            try
            {
                var node = cs.GetById(pageId);

                return node.GetValue<string>("canvas");
            }
            catch (Exception ex)
            {

                Log.Error("Canvas error on GetJson in Repository.", ex);
                return "";
            }

        }

        public static bool SaveJson(CanvasModel model, int pageId)
        {

            try
            {
                var node = cs.GetById(pageId);

                var newJson = JsonConvert.SerializeObject(model, Formatting.None);

                node.SetValue("canvas", newJson.ToString());

                var currentUser = Authorize.GetCurrentUser();

                cs.Save(node, currentUser.Id);

                return true;
            }
            catch (Exception ex)
            {

                Log.Error("Canvas error on SaveJson in Repository.", ex);

                return false;
            }

            

        }
    }
}
