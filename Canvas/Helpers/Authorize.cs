using log4net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core.Models.Membership;
using Umbraco.Core.Security;
using Umbraco.Web;
using Umbraco.Core;
using System.Web;

namespace Canvas.Helpers
{
    public static class Authorize
    {

        private static readonly ILog Log =
                LogManager.GetLogger(
                    MethodBase.GetCurrentMethod().DeclaringType
                );

        public static bool isAuthenticated()
        {
            try
            {

                var validate = false;

                var cu = GetCurrentUser();

                if (cu != null)
                {
                    if (cu.UserType.Alias.ToLower() == "admin" || cu.UserType.Alias.ToLower() == "canvas")
                    {
                        validate = true;
                    }
                }

                return validate;

            }
            catch (Exception ex)
            {

                Log.Error("Canvas error on isAuthenticated in Authorize.", ex);
                return false;
            }


        }

        public static IUser GetCurrentUser()
        {
            var ticket = new HttpContextWrapper(HttpContext.Current).GetUmbracoAuthTicket();

            if (ticket != null)
            {

                var username = ticket.Name;

                if (!string.IsNullOrEmpty(username))
                {

                    IUser u = ApplicationContext.Current.Services.UserService.GetByUsername(username);

                    if (u != null)
                    {
                        return u;
                    }

                }

            }

            return null;
        }
    }
}
