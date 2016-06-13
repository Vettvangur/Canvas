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

            if (isAuthenticated) {

                var node = UmbracoContext.Current.PublishedContentRequest.PublishedContent;

                bool hasCanvas = node.HasProperty("canvas");

                string editInCanvas = "<span>Canvas not found on page.</span>";

                if (hasCanvas) {
                    editInCanvas = "<a href='/umbraco/canvas/?pageId=" + UmbracoContext.Current.PageId + "' class='canvas-edit-page' title='Edit this page in Canvas (" + UmbracoContext.Current.PageId + ")'>Edit Page</a>";
                }

                string css = "<link href=\"/umbraco/canvas/css/styles.min.css\" type=\"text/css\" rel=\"stylesheet\">";
                results = css + "<div class='canvas-footer'><div class='canvas-left'>" +
                    "<a href='/umbraco/canvas/api/logoutofumbraco?url=" + node.Url + "' class='canvas-logout'>Logout</a>" +
                    "<a href='/umbraco#/content/content/edit/" + UmbracoContext.Current.PageId + "' target='_blank'>Open in Umbraco</a>" +
                    "</div>" +
                    "<div class='canvas-right'>" +
                        "<span class='canvas-node-updated'>Page last updated " + node.UpdateDate.ToString("d. MMM yyyy HH:mm") + " by " + node.WriterName + "</span>" +
                        editInCanvas  +
                    "</div></div>";
            }


            return new HtmlString(results);

        }

        public static IHtmlString Render(string alias, HtmlHelper<RenderModel> helper)
        {

            try
            {
                var isAuthenticated = Authorize.isAuthenticated();

                if (!HttpContext.Current.Request.Path.Contains(".aspx")) {
                    isAuthenticated = false;
                }

                var view = ViewHelper.Get(alias, isAuthenticated);

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
