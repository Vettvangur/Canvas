Canvas - Live Content editor for Umbraco
=========

**1st Place in the package competition at Codegarden 16.**

### Package install ###
Download newest release from https://github.com/vettvangur/Canvas/releases.
Install through Umbraco CMS. Read more here : https://our.umbraco.org/wiki/how-tos/packages-and-projects/how-to-install-a-package

### Set up ###

1. Create property named "Canvas" with the alias "canvas" as a Canvas editor datatype to store the canvas json data.
2. Insert **@Canvas.API.Init()** in Masterpage or inside any view. Preferably right before /body tag.
3. Insert **@Canvas.API.Render("alias", this.Html)** anywhere inside a template to make that area editable for Canvas. "Alias" can be anything you want.
4. Log in as Adminstrator or a user in a group named "Canvas". If you look at the page now you should see the Canvas Edit Bar at the bottom of the page.

### What does it do ###

1. Gives you the power to drag/drop controls like Grid,Section,Media,Macro,Richtext and more on the frontend page.
2. You can make templates around any control for more control.
3. Grid inside Grid inside Grid, no problem!
4. Work on a page as you like without the changes being live, all work is saved and can be rolled back.
5. Easy customization to use any framework like Bootstrap or Foundation. Uses Foundation by default.
6. Can use multiple content picker, single content picker, media picker and more on macros.

### Coming soon ###

1. Copy,Cut Controls.
2. Save all content on page as template that you can paste into a new page for quicker content management.
3. Edit canvas content in the backend, Custom datatype.
4. Documentation
5. Code refactoring
6. Only allow edit if user has access to page
7. UI update
