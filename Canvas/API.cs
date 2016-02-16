using Canvas.Helpers;
using log4net;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Html;
using Umbraco.Web;
using Umbraco.Web.Models;

namespace Canvas
{
    public static class API
    {
        private static readonly ILog Log =
                LogManager.GetLogger(
                    MethodBase.GetCurrentMethod().DeclaringType
                );

        public static HtmlString Init()
        {
            string results = string.Empty;

            var isAuthenticated = Authorize.isAuthenticated();

            if (isAuthenticated && !HttpContext.Current.Request.Path.Contains(".aspx"))
            {

                string css = "<link href=\"/app_plugins/canvas/css/styles.min.css\" type=\"text/css\" rel=\"stylesheet\">";
                string codemirrorCss = "<link href=\"/Umbraco/lib/codemirror/lib/codemirror.css\" type=\"text/css\" rel=\"stylesheet\">";
                string pageId = "<input type=\"hidden\" name=\"canvas-pageId\" value=\"" + UmbracoContext.Current.PageId.ToString() + "\" />";
                string builder = "<script src=\"/app_plugins/canvas/js/libs/builder.js\"></script>";

                results = "<div class='canvas-settings'>" + css + codemirrorCss + pageId + builder + "</div>";

            }
            else if (isAuthenticated) {
                string css = "<link href=\"/app_plugins/canvas/css/styles.min.css\" type=\"text/css\" rel=\"stylesheet\">";

                results = "<div class='canvas-settings'>" + css + "</div>";
            }

            return new HtmlString(results);

        }

        public static IHtmlString Render(string alias, HtmlHelper<RenderModel> helper)
        {

            try
            {

                var view = ViewHelper.Get(alias, Authorize.isAuthenticated());

                CultureInfo culture = CultureInfo.CreateSpecificCulture(UmbracoContext.Current.PublishedContentRequest.Culture.Name);

                Thread.CurrentThread.CurrentCulture = culture;
                Thread.CurrentThread.CurrentUICulture = culture;

                if (view != null)
                {

                    var model = helper.Partial(view.viewName, view);

                    return new HtmlString(model.ToString());

                }
                else
                {

                    return new HtmlString("");

                }

            }
            catch (Exception ex)
            {

                Log.Error("Canvas Error on Render in API.", ex);
                return new HtmlString("");

            }

        }
    }
}
