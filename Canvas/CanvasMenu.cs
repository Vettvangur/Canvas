using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core;
using Umbraco.Web.Models.Trees;
using Umbraco.Web.Trees;

namespace Canvas
{

    public class CanvasMenu : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            //Listen for the ApplicationInit event which then allows us to bind to the
            //HttpApplication events.
            TreeControllerBase.MenuRendering += TreeControllerBase_MenuRendering;
        }


        public void TreeControllerBase_MenuRendering(TreeControllerBase sender, MenuRenderingEventArgs e)
        {
            if (sender.TreeAlias == "content")
            {
                var i = new MenuItem("editCanvas", "Edit in Canvas");
                i.Icon = "edit";
                i.LaunchDialogUrl("/umbraco/canvas?pageId=" + e.NodeId,"Edit in Canvas");

                e.Menu.Items.Insert(3,i);
            }
        }
        
    }


}
