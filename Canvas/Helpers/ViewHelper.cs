using Canvas.Models;
using log4net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core;
using Umbraco.Web;

namespace Canvas.Helpers
{
    public static class ViewHelper
    {

        private static readonly ILog Log =
                LogManager.GetLogger(
                    MethodBase.GetCurrentMethod().DeclaringType
                );

        public static CanvasView Get(string alias, bool isAuthenticated)
        {

            try
            {
                var View = new CanvasView();

                int pageId = UmbracoContext.Current.PageId.Value;

                if (isAuthenticated)
                {

                    var cs = ApplicationContext.Current.Services.ContentService;

                    var page = cs.GetById(pageId);

                    var model = Repository.GetObjectById(pageId);

                    // Finna Area hvort sem það sé inn í Grid/section eða rótar svæði

                    if (!model.Areas.Where(x => x.Alias == alias).Any())
                    {
                        // Fann ekki area og bý það því til

                        // Athuga hvort það séu til einhver rótar svæði nú þegar, ef svo er þá bæta þeim við en annars búa til alveg nýtt

                        Log.Info("Canvas - Did not find area, try to create it: " + alias);

                        var area = new CanvasArea();

                        area.Alias = alias;

                        if (model.Areas.Any())
                        {
                            // Bæta við 

                            model.Areas.Add(area);

                            Repository.SaveJson(model, pageId);

                            page = cs.GetById(pageId);
                        }
                        else
                        {
                            // Búa til ný

                            var areaModel = new CanvasModel();

                            areaModel.Areas.Add(area);

                            Repository.SaveJson(areaModel, pageId);

                            page = cs.GetById(pageId);
                        }

                    }

                    View.page = page;
                    View.viewName = "/App_Plugins/Canvas/Views/Backend.cshtml";

                }
                else
                {

                    View.node = UmbracoContext.Current.ContentCache.GetById(pageId);
                    View.viewName = "/App_Plugins/Canvas/Views/FrontEnd.cshtml";

                }

                View.alias = alias;
                return View;
            }
            catch (Exception ex)
            {

                Log.Error("Canvas error on Get in ViewHelper.", ex);
                return null;
            }

        }
 
    }
}
