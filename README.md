Canvas - Umbraco editor
=========

## Installation

### Package install ###
Download newest release from https://github.com/vettvangur/Canvas/releases.
Install through Umbraco CMS. Read more here : https://our.umbraco.org/wiki/how-tos/packages-and-projects/how-to-install-a-package

### Manual install ###
1. Move Canvas.dll to bin folder.
2. Create folder inside /Umbraco with the name "Canvas". Move Index.html file, Css folder and Content folder inside it.
3. Create folder inside Canvas with the name "js".  Move app.min.js, builder.js and sortable.js inside it.
4. Create folder inside /App_Plugins with the name "Canvas". Move Views folder inside it. Update web.config file with "/Views/Web.config" file.

### Usage ###

1. Insert @Canvas.API.Init() before </body> tag in Masterpage or inside any view.
2. Insert @Canvas.API.Render("alias", this.Html) anywhere inside a template to make that area editable for Canvas. "Alias" can be anything you want.
3. Log in as Adminstrator or a user in a group named "Canvas". If you look at the page now you should see the Canvas Edit Bar at the bottom of the page.


