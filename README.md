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

### Set up ###

1. Create property named "Canvas" with the alias "canvas" as a textarea to store the canvas json data.
2. Insert @Canvas.API.Init() in Masterpage or inside any view. Preferably right before /body tag.
3. Insert @Canvas.API.Render("alias", this.Html) anywhere inside a template to make that area editable for Canvas. "Alias" can be anything you want.
4. Log in as Adminstrator or a user in a group named "Canvas". If you look at the page now you should see the Canvas Edit Bar at the bottom of the page.

### What does it do ###

1. Gives you the power to drag/drop controls like Grid,Section,Media,Macro,Richtext and more on the frontend page.
2. You can make templates around any control for more control.
3. Grid inside Grid inside Grid, no problem!
4. Work on everypage as you like with out the changes being live, all work is saved and can can be rolled back.
5. Easy customization to use any framework like Bootstrap or Foundation. It used Foundation by default.
6. Can use multiple content picker, single content picker, media picker and more on macros.

### Roadmap ###

1. Copy,Cut Controls.
2. Save all content on page as template that you can paste into a new page for quicker content management.
3. Edit canvas content in the backend, Custom datatype.
4. Documentation
5. Refactoring code
