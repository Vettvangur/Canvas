using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace Canvas.Helpers
{
    public class AuthorizeUserAttribute : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            if (Authorize.isAuthenticated())
            {

                return true;

            }
            else {
                return false;
            }
        }

    }
}
