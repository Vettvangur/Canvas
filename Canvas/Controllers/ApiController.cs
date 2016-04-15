using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Web.Mvc;
using Umbraco.Web;
using Canvas.Helpers;
using log4net;
using System.Reflection;
using System.Web.Mvc;
using Canvas.Models;
using Umbraco.Core.Models;
using Newtonsoft.Json;
using System.Web;
using Archetype.Models;
using System.Web.Script.Serialization;

namespace Canvas.Controllers
{
    [PluginController("Canvas")]
    [AuthorizeUser]
    public class ApiController : SurfaceController
    {

        private static readonly ILog Log =
                LogManager.GetLogger(
                    MethodBase.GetCurrentMethod().DeclaringType
                );

        [HttpPost]
        public JsonResult AddControl(string areaAlias, string controlType, int pageId)
        {

            var controlId = Guid.NewGuid();

            string columns = "6:medium:;6:medium:";

            var model = Repository.GetObjectById(pageId);

            if (model != null && !string.IsNullOrEmpty(controlType) && !string.IsNullOrEmpty(areaAlias))
            {

                // Finna Area hvort sem það sé inn í Grid/section eða rótar svæði

                foreach (var area in model.Areas)
                {
                    FindArea(area, areaAlias);
                }

                if (AreaResult != null)
                {

                    var control = new CanvasControl();
                    control.ControlID = controlId;
                    control.Type = controlType;

                    // Ef control er grid þá búa til area undir því controli

                    if (controlType == "Grid")
                    {
                        control.Columns = columns;

                        int p = 0;
                        foreach (var column in columns.Split(';').Where(x => !string.IsNullOrEmpty(x)))
                        {

                            string col = column.Split(':')[0];

                            var area = new CanvasArea();

                            area.Alias = "grid-" + col + "-" + controlId.ToString() + "-" + p;

                            control.Areas.Add(area);

                            p++;

                        }

                    }

                    // Ef control er section þá búa til area undir því controli

                    if (controlType == "Section")
                    {
                        var area = new CanvasArea();
                        area.Alias = "section-" + controlId.ToString();

                        control.Areas.Add(area);
                    }

                    AreaResult.Controls.Add(control);

                }

                // Færa model aftur í json string til vistunar

                Repository.SaveJson(model, pageId);

            }
            else
            {

                // Ef ekkert Area er nú þegar skráð þá búa til

                var m = new CanvasModel();

                var area = new CanvasArea();

                area.Alias = areaAlias;

                var control = new CanvasControl();
                control.ControlID = controlId;
                control.Type = controlType;

                area.Controls.Add(control);

                m.Areas.Add(area);

                Repository.SaveJson(m, pageId);

            }

            return Json(new { success = true, controlType = controlType, controlId = controlId.ToString(), pageId = pageId });

        }

        [HttpPost]
        public JsonResult SortControl(string areaFromAlias, string areaToAlias, int pageId, Guid controlId, int position)
        {

            var model = Repository.GetObjectById(pageId);
            CanvasControl control = null;
            CanvasArea areaDraggedFrom = null;
            CanvasArea areaDroppedTo = null;

            foreach (var area in model.Areas)
            {
                FindArea(area, areaFromAlias);
            }

            if (AreaResult != null)
            {
                areaDraggedFrom = AreaResult;
            }

            // if Sort
            if (areaFromAlias == areaToAlias)
            {
                // If sort

                if (areaDraggedFrom != null)
                {

                    control = areaDraggedFrom.Controls.Where(x => x.ControlID == controlId).FirstOrDefault();

                    areaDraggedFrom.Controls.Remove(control);

                    areaDraggedFrom.Controls.Insert(position, control);

                }

            }
            else
            {
                // If Move
                AreaResult = null;

                foreach (var area in model.Areas)
                {
                    FindArea(area, areaToAlias);
                }

                if (AreaResult != null)
                {
                    areaDroppedTo = AreaResult;
                }

                if (areaDraggedFrom != null)
                {

                    control = areaDraggedFrom.Controls.Where(x => x.ControlID == controlId).FirstOrDefault();

                    areaDraggedFrom.Controls.Remove(control);

                }

                if (areaDroppedTo != null)
                {

                    areaDroppedTo.Controls.Insert(position, control);

                }

            }


            Repository.SaveJson(model, pageId);

            return Json(new { success = true });

        }

        [HttpGet]
        [ActionName("EditControl")]
        public JsonResult GetEditControl(Guid controlId, int pageId)
        {

            var model = Repository.GetObjectById(pageId);

            if (model != null)
            {

                // Finna Area hvort sem það sé inn í Grid/section eða rótar svæði sem á undir sér Control

                foreach (var area in model.Areas)
                {
                    FindAreaWithControl(area, controlId);
                }

                if (AreaControlResult != null)
                {
                    var control = AreaControlResult.Controls.Where(x => x.ControlID == controlId).FirstOrDefault();

                    if (control != null)
                    {

                        var templates = CanvasHelper.GetTemplates(control.Type);

                        var macros = new List<CanvasMacro>();

                        if (control.Type == "Macro")
                        {
                            using (var db = DatabaseContext.Database)
                            {
                                macros = db.Fetch<CanvasMacro>("SELECT * FROM cmsMacro where macroUseInEditor = @0 ORDER BY macroName", true);
                            }
                        }

                        var controlProperties = control.GetType().GetProperties().ToDictionary(x => x.Name, x => x.GetValue(control, null) == null ? "" : x.GetValue(control, null)).ToList();

                        return Json(new { success = true, controlId = controlId, properties = controlProperties, templates = templates, type = control.Type, macros = macros }, JsonRequestBehavior.AllowGet);

                    }
                }

            }

            return Json(new { success = false }, JsonRequestBehavior.AllowGet);


        }

        [HttpPost]
        [ValidateInput(false)]
        [ActionName("EditControl")]
        public JsonResult PostEditControl(FormCollection form)
        {

            var controlId = new Guid(form["controlId"]);
            var areaAlias = form["area"];
            var pageId = form["pageId"];
            var controlType = form["controlType"];

            var model = Repository.GetObjectById(Convert.ToInt32(pageId));

            if (model != null)
            {

                // Finna Area hvort sem það sé inn í Grid/section eða rótar svæði sem á undir sér Control

                foreach (var area in model.Areas)
                {
                    FindAreaWithControl(area, controlId);
                }

                if (AreaControlResult != null)
                {

                    var control = AreaControlResult.Controls.Where(x => x.ControlID == controlId).FirstOrDefault();

                    if (control != null)
                    {

                        var controlProperties = control.GetType().GetProperties().ToDictionary(x => x.Name, x => x.GetValue(control, null) == null ? "" : x.GetValue(control, null)).ToList();

                        foreach (var property in controlProperties)
                        {

                            if (property.Key != "Type" && property.Key != "ControlID")
                            {

                                var value = form[property.Key];

                                // If Macro control
                                // Replace single quote with double quote
                                if (controlType == "Macro" && property.Key == "Macro")
                                {
                                    value = value.Replace("'", "\"");
                                }

                                PropertyInfo prop = control.GetType().GetProperty(property.Key, BindingFlags.Public | BindingFlags.Instance);
                                if (null != prop && prop.CanWrite)
                                {
                                    prop.SetValue(control, HttpUtility.UrlDecode(value), null);
                                }

                            }


                        }

                        // Ef Control er grid þá þarf að eyða út gömlum svæðum og búa til ný
                        if (controlType == "Grid")
                        {

                            var columns = form["columns"].Split(';');

                            var ListOfAreasThatHaveNotChanges = new List<CanvasArea>();

                            // Finna öll svæði sem eru undir Controli
                            var AreasInsideGrid = control.Areas;

                            bool update = true;

                            // Athuga hvort það eigi að uppfæra grid eða búa til nýtt area undir þessu controli. t.d. col-4-12345 í stað col-6-12345

                            var p = 0;
                            foreach (var col in columns)
                            {

                                string[] colValue = col.Split(':');

                                var colAreaAlis = "grid-" + colValue[0] + "-" + controlId.ToString() + "-" + p;

                                p++;

                                var AreaInsideGrid = AreasInsideGrid.Where(x => x.Alias == colAreaAlis).FirstOrDefault();

                                if (AreaInsideGrid == null)
                                {
                                    update = false;
                                }
                                else
                                {
                                    ListOfAreasThatHaveNotChanges.Add(AreaInsideGrid);
                                }

                            }

                            if (!update)
                            {

                                // Eyða út öllum svæðum sem hafa breyst

                                var AreasToRemove = AreasInsideGrid.Intersect(ListOfAreasThatHaveNotChanges).ToList();

                                foreach (var a in AreasToRemove.ToList())
                                {
                                    AreasInsideGrid.Remove(a);
                                }

                                p = 0;
                                foreach (var column in columns)
                                {

                                    string col = column.Split(':')[0];

                                    var area = new CanvasArea();

                                    area.Alias = "grid-" + col + "-" + controlId.ToString() + "-" + p;

                                    control.Areas.Insert(p, area);

                                    p++;

                                }
                            }

                        }

                    }
                }
            }

            Repository.SaveJson(model, Convert.ToInt32(pageId));

            return Json(new { success = true, html = "" });
        }

        [HttpPost]
        public JsonResult DeleteControl(string areaAlias, Guid controlId, int pageId)
        {

            var model = Repository.GetObjectById(pageId);

            if (model != null)
            {

                // Finna Area hvort sem það sé inn í Grid/section eða rótar svæði sem á undir sér Control

                foreach (var area in model.Areas)
                {
                    FindAreaWithControl(area, controlId);
                }

                if (AreaControlResult != null)
                {

                    var control = AreaControlResult.Controls.Where(x => x.ControlID == controlId).FirstOrDefault();

                    AreaControlResult.Controls.Remove(control);

                    // Færa model aftur í json string til vistunar

                    Repository.SaveJson(model, pageId);

                    return Json(new { success = true });

                }

            }

            return Json(new { success = false }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult IsPagePublished(int pageId)
        {

            try
            {

                var cs = Services.ContentService;

                var page = cs.GetById(pageId);

                return Json(new { success = true, isPublished = page.Published });

            }
            catch (Exception ex)
            {

                return Json(new { success = false, error = ex.Message });

            }

        }

        [HttpPost]
        public JsonResult PublishPage(int pageId)
        {
            try
            {
                var cs = Services.ContentService;

                var page = cs.GetById(pageId);

                cs.SaveAndPublishWithStatus(page);

                return Json(new { success = true });

            }
            catch (Exception ex)
            {

                return Json(new { success = false, error = ex.Message });

            }

        }

        [HttpPost]
        public JsonResult Cancel(int pageId)
        {

            var cs = Services.ContentService;

            var page = cs.GetById(pageId);

            var versions = cs.GetVersions(page.Id);

            cs.Rollback(page.Id, versions.Where(x => x.Published).FirstOrDefault().Version);

            var pageAfterRollback = cs.GetById(pageId);

            cs.SaveAndPublishWithStatus(pageAfterRollback);

            return Json(new { success = true });
        }

        [HttpPost]
        public JsonResult GetMacroProperty(int id)
        {

            using (var db = DatabaseContext.Database)
            {
                var properties = db.Fetch<CanvasMacroProperty>("SELECT * FROM cmsMacroProperty where macro = @0 ORDER BY macroPropertySortOrder", id);

                if (CanvasHelper.GetUmbracoVersion() == 6)
                {

                    var macroPropertyTypes = db.Fetch<dynamic>("SELECT * FROM cmsMacroPropertyType");

                    foreach (var p in properties)
                    {

                        var type = macroPropertyTypes.Where(x => x.id == p.macroPropertyType).FirstOrDefault();

                        if (type != null)
                        {
                            p.editorAlias = type.macroPropertyTypeRenderType;
                        }

                    }

                }

                return Json(new { success = true, properties = properties });
            }
        }

        [HttpPost]
        public JsonResult GetContentItem(int id)
        {
            var item = Umbraco.TypedContent(id);

            return Json(new { name = item.Name, id = id });
        }

        [HttpPost]
        public JsonResult GetContent(int pageId)
        {

            IEnumerable<IPublishedContent> pages = null;

            if (pageId == 0)
            {
                pages = Umbraco.TypedContentAtRoot();
            }
            else
            {
                pages = Umbraco.TypedContent(pageId).Children;
            }

            var list = new List<CanvasContent>();

            foreach (var p in pages)
            {

                var e = new CanvasContent();

                e.contentType = p.ContentType.Alias;
                e.id = p.Id;
                e.name = p.Name;
                e.url = p.Url;
                e.hasChildren = false;

                if (p.Children().Any())
                {
                    e.hasChildren = true;
                }

                list.Add(e);
            }


            var jsonResult = Json(list, JsonRequestBehavior.AllowGet);
            jsonResult.MaxJsonLength = int.MaxValue;

            return jsonResult;

        }

        [HttpPost]
        public JsonResult GetMedia(int id)
        {
            var folder = Umbraco.TypedMedia(id);

            if (folder != null)
            {
                if (folder.ContentType.Alias != "Folder")
                {
                    if (folder.Parent != null)
                    {
                        id = folder.Parent.Id;
                        folder = Umbraco.TypedMedia(folder.Parent.Id);
                    }
                    else
                    {
                        id = -1;
                    }

                }

                if (id != -1)
                {
                    PopulateParents(folder);
                }
            }

            using (var db = DatabaseContext.Database)
            {

                string sql = "SELECT MIN(n.id) as id ,MIN(n.parentID) as parentId ,MIN(n.sortOrder) as sortOrder,MIN(n.text) as text,MIN(cmsContent.contentType) as contentType,MIN(cast(cmsPropertyData.dataNtext as varchar(max))) as src1, MIN(cast(cmsPropertyData.dataNvarchar as varchar(max))) as src2 FROM umbracoNode as n " +
                "INNER JOIN cmsContent ON n.id=cmsContent.nodeId  " +
                "RIGHT JOIN cmsPropertyData ON n.id=cmsPropertyData.contentNodeId " +
                "WHERE nodeObjectType = 'B796F64C-1F99-4FFB-B886-4BF4BC011A9C' AND  " +
                "trashed = 0 AND " +
                "(cmsPropertyData.propertytypeid = 6 OR cmsPropertyData.propertytypeid = 27 OR cmsPropertyData.propertytypeid = 24)  AND " +
                "(cmsContent.contentType = 1031 OR cmsContent.contentType = 1032 OR cmsContent.contentType = 1033) AND " +
                "parentId = " + id + " GROUP BY n.id";
                
                //string sql = "SELECT MIN(n.id) as id ,MIN(n.parentID) as parentId ,MIN(n.sortOrder) as sortOrder,MIN(n.text) as text,MIN(cmsContent.contentType) as contentType,MIN(cast(cmsPropertyData.dataNvarchar as varchar(max))) as src FROM umbracoNode as n " +
                //"INNER JOIN cmsContent ON n.id=cmsContent.nodeId  " +
                //"RIGHT JOIN cmsPropertyData ON n.id=cmsPropertyData.contentNodeId " +
                //"WHERE nodeObjectType = 'B796F64C-1F99-4FFB-B886-4BF4BC011A9C' AND  " +
                //"trashed = 0 AND " +
                //"(cmsPropertyData.propertytypeid = 6 OR cmsPropertyData.propertytypeid = 27 OR cmsPropertyData.propertytypeid = 24)  AND " +
                //"(cmsContent.contentType = 1031 OR cmsContent.contentType = 1032 OR cmsContent.contentType = 1033) AND " +
                //"parentId = " + id + " GROUP BY n.id";

                var items = db.Fetch<CanvasMedia>(sql);

                return Json(new { items = items, history = Parents.OrderBy(x => x.level) });
            }

        }

        private List<CanvasParents> Parents = new List<CanvasParents>();

        private void PopulateParents(IPublishedContent folder)
        {
            if (folder != null)
            {

                var parent = new CanvasParents();

                parent.id = folder.Id;
                parent.name = folder.Name;
                parent.level = folder.Level;

                Parents.Add(parent);

                PopulateParents(folder.Parent);
            }
        }

        [HttpPost]
        public JsonResult GetMediaItem(int id)
        {
            var item = Umbraco.TypedMedia(id);

            string url = string.Empty;
            string type = string.Empty;
            string name = string.Empty;

            if (item != null)
            {
                type = item.ContentType.Alias.ToLower();

                if (type != "folder")
                {
                    url = item.Url;
                }

                name = item.Name;
            }

            return Json(new { src = url, type = type, name = name });
        }

        [HttpPost]
        [ValidateInput(false)]
        public JsonResult CreateTemplate(string name, string content, string controlType)
        {
            if (!System.IO.File.Exists(Server.MapPath("/App_Plugins/Canvas/Views/Templates/" + controlType + "/" + name + ".cshtml")))
            {
                System.IO.File.WriteAllText(Server.MapPath("/App_Plugins/Canvas/Views/Templates/" + controlType + "/" + name + ".cshtml"), content, Encoding.UTF8);

                var templates = CanvasHelper.GetTemplates(controlType);

                return Json(new { success = true, templates = templates });
            }
            else
            {
                return Json(new { success = false, message = "Template with this name exist" });
            }

        }

        [HttpPost]
        [ValidateInput(false)]
        public JsonResult SaveTemplate(string name, string content, string controlType)
        {
            if (System.IO.File.Exists(Server.MapPath("/App_Plugins/Canvas/Views/Templates/" + controlType + "/" + name + ".cshtml")))
            {
                System.IO.File.WriteAllText(Server.MapPath("/App_Plugins/Canvas/Views/Templates/" + controlType + "/" + name + ".cshtml"), content, Encoding.UTF8);

                var templates = CanvasHelper.GetTemplates(controlType);

                return Json(new { success = true, templates = templates });
            }
            else
            {
                return Json(new { success = false, message = "Template does not exist" });
            }

        }

        [HttpPost]
        [ValidateInput(false)]
        public JsonResult SaveMacroTemplate(int id, string content)
        {

            using (var db = DatabaseContext.Database)
            {
                var view = db.FirstOrDefault<string>("SELECT macroPython FROM cmsMacro WHERE id = @0", id);

                if (System.IO.File.Exists(Server.MapPath(view)))
                {
                    System.IO.File.WriteAllText(Server.MapPath(view), content, Encoding.UTF8);


                    return Json(new { success = true });
                }
                else
                {
                    return Json(new { success = false, message = "Template does not exist" });
                }
            }
        }

        [HttpPost]
        [ValidateInput(false)]
        public JsonResult GetTemplateValue(string path)
        {
            if (System.IO.File.Exists(Server.MapPath(path)))
            {
                var content = System.IO.File.ReadAllText(Server.MapPath(path), Encoding.UTF8);

                return Json(new { success = true, content = content });
            }
            else
            {
                return Json(new { success = false, message = "Template with this name does not exist" });
            }

        }

        [HttpPost]
        [ValidateInput(false)]
        public JsonResult GetMacroTemplateValue(int id)
        {

            using (var db = DatabaseContext.Database)
            {
                var view = db.FirstOrDefault<string>("SELECT macroPython FROM cmsMacro WHERE id = @0", id);

                if (System.IO.File.Exists(Server.MapPath(view)))
                {
                    var content = System.IO.File.ReadAllText(Server.MapPath(view), Encoding.UTF8);

                    return Json(new { success = true, content = content });
                }
                else
                {
                    return Json(new { success = false, message = "Template with this name does not exist" });
                }
            }

        }

        [HttpPost]
        public JsonResult DeleteTemplate(string path, string controlType)
        {
            if (System.IO.File.Exists(Server.MapPath(path)))
            {
                System.IO.File.Delete(Server.MapPath(path));

                var templates = CanvasHelper.GetTemplates(controlType);

                return Json(new { success = true, templates = templates });
            }
            else
            {
                return Json(new { success = false, message = "Template file not found" });
            }

        }

        [HttpPost]
        public JsonResult GetSettings(int pageId)
        {
            var cs = Services.ContentService;

            var page = cs.GetById(pageId);

            return Json(new { success = true, pageId = pageId, tabs = page.PropertyGroups.Where(x => x.Name != "canvas" && x.Name != "uEdit"), properties = page.Properties });
        }

        [HttpPost]
        [ValidateInput(false)]
        public JsonResult SavePage(FormCollection form)
        {
            var cs = Services.ContentService;

            var pageId = form["pageId"];

            var page = cs.GetById(Convert.ToInt32(pageId));

            var properties = page.Properties;

            foreach (var property in properties)
            {

                var value = form[property.Alias];

                if (page.HasProperty(property.Alias) && value != null)
                {
                    page.SetValue(property.Alias, value);
                }

            }

            cs.Save(page);

            var tmp = Umbraco.RenderTemplate(page.Id);

            return Json(new { success = true, html = tmp.ToString() });
        }

        [HttpPost]
        public JsonResult Logout()
        {
            UmbracoContext.Current.Security.ClearCurrentLogin();
            Session.Remove("CanvasAuthenticate");

            return Json(new { success = true });
        }

        public ActionResult LogoutOfUmbraco(string url) {
            UmbracoContext.Current.Security.ClearCurrentLogin();

            return Redirect(url);
        }

        private CanvasArea AreaResult = null;

        private void FindArea(CanvasArea area, string alias)
        {

            if (area.Alias == alias)
            {
                AreaResult = area;
            }

            if (AreaResult == null)
            {

                foreach (var c in area.Controls.Where(x => x.Type == "Grid" || x.Type == "Section"))
                {

                    foreach (var a in c.Areas)
                    {
                        FindArea(a, alias);
                    }

                }

            }

        }

        private CanvasArea AreaControlResult = null;

        private void FindAreaWithControl(CanvasArea area, Guid controlId)
        {

            var control = area.Controls.Where(x => x.ControlID == controlId).FirstOrDefault();

            if (control != null)
            {
                AreaControlResult = area;
            }

            if (AreaControlResult == null)
            {

                foreach (var c in area.Controls.Where(x => x.Type == "Grid" || x.Type == "Section"))
                {

                    foreach (var a in c.Areas)
                    {
                        FindAreaWithControl(a, controlId);
                    }

                }

            }

        }

        private CanvasModel CanvasModel = new CanvasModel();

        private List<IContent> allNodes = new List<IContent>();

        private void GetAllNodes()
        {

            var cs = Services.ContentService;

            var rootNodes = cs.GetRootContent().Where(x => !x.Trashed && x.HasProperty("uEdit") && x.HasProperty("canvas") && !string.IsNullOrEmpty(x.GetValue<string>("uEdit")));

            foreach (var node in rootNodes)
            {

                allNodes.Add(node);

                var children = node.Children().Where(x => !x.Trashed && x.HasProperty("uEdit") && x.HasProperty("canvas") && !string.IsNullOrEmpty(x.GetValue<string>("uEdit")));

                if (children.Any())
                {
                    IteriateNodes(children);
                }
            }
        }

        private void IteriateNodes(IEnumerable<IContent> nodes)
        {

            foreach (var node in nodes)
            {

                allNodes.Add(node);

                var children = node.Children().Where(x => !x.Trashed && x.HasProperty("uEdit") && x.HasProperty("canvas"));

                if (children.Any())
                {
                    IteriateNodes(children);
                }

            }

        }
        public ActionResult ConvertuEditToCanvas()
        {

            var cs = Services.ContentService;

            GetAllNodes();

            foreach (var node in allNodes)
            {

                Log.Info("Trying to convert node: " + node.Id);

                var uEditObject = JsonConvert.DeserializeObject<Archetype.Models.ArchetypeModel>(node.GetValue<string>("uEdit"));

                // Store all areas to fetch sections and grids later
                var alluEditAreas = uEditObject.Fieldsets.ToList();

                CanvasModel = new CanvasModel();

                // Get only root areas
                foreach (var fieldset in alluEditAreas.Where(x => !x.Properties.Take(1).First().Value.ToString().Contains("section-") && !x.Properties.Take(1).First().Value.ToString().Contains("grid-")))
                {
                    // get area property
                    var areaProperty = fieldset.Properties.Take(1).FirstOrDefault();
                    var areaControls = fieldset.Properties.Skip(1).Take(1).FirstOrDefault();

                    IteriateThroughControlsInArea(areaProperty, areaControls, alluEditAreas, null);

                }

                var newCanvasJson = new JavaScriptSerializer().Serialize(CanvasModel);

                node.SetValue("canvas", newCanvasJson);

                if (node.Published)
                {
                    cs.SaveAndPublishWithStatus(node);
                }
                else
                {
                    cs.Save(node);
                }

                Log.Info("Finished converting node: " + node.Id);

            }

            return Content("Success");
        }

        private void IteriateThroughControlsInArea(ArchetypePropertyModel areaProperty, ArchetypePropertyModel areaControls, IEnumerable<Archetype.Models.ArchetypeFieldsetModel> alluEditAreas, CanvasControl cControl)
        {

            Log.Info("Area: " + areaProperty.Value);

            var canvasArea = new CanvasArea();

            canvasArea.Alias = areaProperty.Value.ToString();

            var canvasControls = new List<CanvasControl>();

            var controlsSet = JsonConvert.DeserializeObject<Canvas.Models.ArchetypeModel>(areaControls.Value.ToString());


            if (controlsSet.Fieldsets.Where(x => !string.IsNullOrEmpty(x.Properties.Where(z => z.Alias == "type").FirstOrDefault().Value)).Any())
            {

                foreach (var controlFieldset in controlsSet.Fieldsets)
                {

                    if (controlFieldset.Properties.Where(x => x.Alias == "controlid").FirstOrDefault() != null && controlFieldset.Properties.Where(x => x.Alias == "type").FirstOrDefault() != null && !string.IsNullOrEmpty(controlFieldset.Properties.Where(x => x.Alias == "type").FirstOrDefault().Value))
                    {

                        var controlId = controlFieldset.Properties.Where(x => x.Alias == "controlid").FirstOrDefault();
                        var controlType = controlFieldset.Properties.Where(x => x.Alias == "type").FirstOrDefault().Value;

                        Log.Info("Control Type: " + controlType);

                        var CanvasControl = new CanvasControl();

                        var template = controlFieldset.Properties.Where(x => x.Alias == "template").FirstOrDefault() != null ? controlFieldset.Properties.Where(x => x.Alias == "template").FirstOrDefault().Value : null;

                        if (template != null && !string.IsNullOrEmpty(template.ToString()))
                        {

                            template = template.ToString().Replace("\\Views\\Partials\\uEdit", "\\App_plugins\\Canvas\\Views").Replace("uEdit", "");
                        }

                        CanvasControl.Type = controlType.Replace("uEdit", "").Replace("Richtext", "RichText");
                        CanvasControl.ControlID = new Guid(controlId.Value.ToString());
                        CanvasControl.Class = controlFieldset.Properties.Where(x => x.Alias == "class").FirstOrDefault() != null ? controlFieldset.Properties.Where(x => x.Alias == "class").FirstOrDefault().Value : null;
                        CanvasControl.Columns = controlFieldset.Properties.Where(x => x.Alias == "columns").FirstOrDefault() != null ? controlFieldset.Properties.Where(x => x.Alias == "columns").FirstOrDefault().Value : null;
                        CanvasControl.Content = controlFieldset.Properties.Where(x => x.Alias == "content").FirstOrDefault() != null ? controlFieldset.Properties.Where(x => x.Alias == "content").FirstOrDefault().Value : null;
                        CanvasControl.Description = controlFieldset.Properties.Where(x => x.Alias == "description").FirstOrDefault() != null ? controlFieldset.Properties.Where(x => x.Alias == "description").FirstOrDefault().Value : null;
                        CanvasControl.Item = controlFieldset.Properties.Where(x => x.Alias == "item").FirstOrDefault() != null ? controlFieldset.Properties.Where(x => x.Alias == "item").FirstOrDefault().Value : null;
                        CanvasControl.Macro = controlFieldset.Properties.Where(x => x.Alias == "macro").FirstOrDefault() != null ? controlFieldset.Properties.Where(x => x.Alias == "macro").FirstOrDefault().Value : null;
                        CanvasControl.Template = template;
                        CanvasControl.Title = controlFieldset.Properties.Where(x => x.Alias == "title").FirstOrDefault() != null ? controlFieldset.Properties.Where(x => x.Alias == "title").FirstOrDefault().Value : null;

                        if (controlType == "uEditGrid" && controlFieldset.Properties.Where(x => x.Alias == "columns").FirstOrDefault() != null)
                        {
                            string _columns = controlFieldset.Properties.Where(x => x.Alias == "columns").FirstOrDefault().Value;

                            string[] cols = _columns.Split(';');

                            int c = 0;


                            foreach (var col in cols)
                            {

                                var _col = col.Split(':');

                                if (!string.IsNullOrEmpty(col) && _col.Length == 3)
                                {


                                    var colNumber = _col[0];
                                    var screen = _col[1];
                                    var config = _col[2];

                                    string areaAlias = "grid-" + colNumber + "-" + controlId.Value + "-" + c;

                                    Log.Info("Looking for Grid Area Alias: " + areaAlias);

                                    var area = alluEditAreas.Where(x => x.Properties.Take(1).FirstOrDefault().Value.ToString() == areaAlias).First();

                                    if (area != null)
                                    {

                                        Log.Info("Found Area: " + areaAlias);
                                        var areaProperty2 = area.Properties.Take(1).FirstOrDefault();
                                        var areaControls2 = area.Properties.Skip(1).Take(1).FirstOrDefault();

                                        IteriateThroughControlsInArea(areaProperty2, areaControls2, alluEditAreas, CanvasControl);
                                    }

                                    c++;

                                }

                            }

                            c = 0;


                        }

                        if (controlType == "uEditSection")
                        {

                            string areaAlias = "section-" + controlId.Value;

                            Log.Info("Looking for  section alias: " + areaAlias);

                            var area = alluEditAreas.Where(x => x.Properties.Take(1).FirstOrDefault().Value.ToString() == areaAlias).First();

                            if (area != null)
                            {

                                Log.Info("Found Section area: " + areaAlias);

                                var areaProperty2 = area.Properties.Take(1).FirstOrDefault();
                                var areaControls2 = area.Properties.Skip(1).Take(1).FirstOrDefault();

                                IteriateThroughControlsInArea(areaProperty2, areaControls2, alluEditAreas, CanvasControl);
                            }
                        }

                        canvasControls.Add(CanvasControl);

                        canvasArea.Controls = canvasControls;


                    }

                }
            }

            if (cControl != null)
            {
                cControl.Areas.Add(canvasArea);
            }
            else {
                CanvasModel.Areas.Add(canvasArea);
            }

        }

    }
}
