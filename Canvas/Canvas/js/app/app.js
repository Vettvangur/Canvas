/**
 * Umbraco Canvas Live Editor 1.0
 * @copyright Vettvangur ehf. Garðar Þorsteinsson (c) 2015
 */

var CanvasApp = function () {

    var app = {};

    // App Parameters
    // -----------
    app.params = {

        apiUrl: '/umbraco/canvas/api',
        pageId: function () {
            return $('input[name=canvas-pageId]').val();
        },
        version: function () {
            return $('input[name=canvas-version]').val();
        },
        controls: ["Grid", "Section", "Macro", "RichText", "Media", "Text", "Heading", "Button"],
        controlIndex: 0,
        tinyMceConfig: {
            selector: "textarea.canvas-editable",
            mode: "exact",
            skin: "umbraco",
            menubar: false,
            statusbar: false,
            relative_urls: false,
            force_p_newlines: 'false',
            remove_linebreaks: false,
            force_br_newlines: true,
            apply_source_formatting: true,
            remove_trailing_nbsp: false,
            image_dimensions: false,
            init_instance_callback: function (editor) {
                app.pickers.mediaPicker.canvasResizeImage(editor);
            },
            toolbar: "codemirror bold italic alignleft aligncenter alignright bullist umlist outdent indent link image umbmediapicker umbembeddialog umbmacro",
            plugins: [
                "autolink lists link print anchor table",
                "code fullscreen contextmenu paste codemirror"
            ],
            codemirror: {
                indentOnInit: true, // Whether or not to indent code on init. 
                path: '/Umbraco/lib/codemirror', // Path to CodeMirror distribution
                config: {           // CodeMirror config object
                    mode: 'htmlmixed',
                    lineNumbers: true
                }
            }
        },
        tinyMceConfigAdv: {
            selector: "textarea#canvas-advanced-content",
            mode: "exact",
            skin: "umbraco",
            menubar: false,
            statusbar: false,
            remove_trailing_nbsp: true,
            image_dimensions: false,
            init_instance_callback: function (editor) {
                app.pickers.mediaPicker.canvasResizeImage(editor);
            },
            toolbar: "codemirror undo redo bold italic formatselect alignleft aligncenter alignright bullist umlist outdent indent link table umbmediapicker umbcontentpicker umbembeddialog umbmacro fullscreen anchor paste searchreplace",
            plugins: [
                "autolink lists link print anchor table",
                "code fullscreen contextmenu paste codemirror"
            ],
            codemirror: {
                indentOnInit: true, // Whether or not to indent code on init. 
                path: '/Umbraco/lib/codemirror', // Path to CodeMirror distribution
                config: {           // CodeMirror config object
                    mode: 'htmlmixed',
                    lineNumbers: true,
                    indentUnit: 4,
                    tabSize: 4,
                }
            }
        }
    };


    // Canvas Bar
    // -----------
    app.bar = {

        init: function () {
            var me = this;

            if (window.location.pathname.indexOf('.aspx') <= -1) {
                me.wrapper();
                me.render();
                me.screenOptions();
                me.controlMenu();
            }


        },

        wrapper: function () {
            var me = this;

            $('body').wrapInner("<div class='canvas-pageWrapper'></div>");

            if (window.location.pathname.indexOf('.aspx') <= -1) {
                $('.canvas-pageWrapper').hide();

                app.controlMenu.init();

                var iframe = document.createElement('iframe');

                iframe.src = '/umbraco/dialogs/Preview.aspx?id=' + app.params.pageId();
                iframe.className = 'canvas-iframe';
                iframe.width = '100%';
                iframe.onload = function () {
                    app.areas.init($(iframe.contentDocument));
                    app.control.init($(iframe.contentDocument));
                };

                document.body.appendChild(iframe);

                $('body').addClass('canvas-body');
                
                me.resizeIframe();

                $(window).resize(function () {
                    me.resizeIframe();
                });
            }

        },

        resizeIframe: function() {
            var height = $(window).height();

            $('.canvas-iframe').css('height', height - 60);
        },

        render: function () {
            var $bar = $('<div><div class="canvas-bar"><div class="canvas-left"></div><div class="canvas-right"></div></div></div>');

            $bar.find('.canvas-bar .canvas-left').append('<div class="canvas-item canvas-item-logo canvas-border-right"><img src="/app_plugins/canvas/content/svg/vettvangur.svg" style=width:40px; height:20px;" alt="Vettvangur"/></div>');
            $bar.find('.canvas-bar .canvas-left').append('<a href="#" class="canvas-item canvas-border-right canvas-item-menu canvasicon-menu"></a>');
            $bar.find('.canvas-bar .canvas-left').append('<a href="#" class="canvas-item canvas-border-right canvas-item-templates canvasicon-papers"></a>');

            $bar.find('.canvas-bar .canvas-right').append('<a href="#" class="canvas-item canvas-border-right canvas-item-settings canvasicon-cog"></a>');
            $bar.find('.canvas-bar .canvas-right').append('<div class="canvas-options canvas-item canvas-border-right canvas-item-screens canvasicon-desktop"><ul class="canvas-screen-options"><li class="canvasicon-desktop canvas-selected"></li><li class="canvasicon-tablet-landscape"></li><li class="canvasicon-tablet"></li><li class="canvasicon-smartphone-landscape"></li><li class="canvasicon-smartphone"></li></ul></div>');

            $('body').append($bar.html());
        },

        screenOptions: function () {

            $('body').on('click', '.canvas-options', function (e) {
                e.preventDefault();

                $(this).toggleClass('canvas-open');
            });

            $('body').on('click', '.canvas-item-screens li', function (e) {
                e.preventDefault();

                var Class = $(this).attr('class');

                $('.canvas-item-screens li').removeClass('canvas-selected');

                $(this).addClass('canvas-selected');

                var $container = $(this).closest('.canvas-options');

                $container.removeClass('canvas-open canvasicon-desktop canvasicon-laptop canvasicon-tablet canvasicon-tablet-landscape canvasicon-smartphone canvasicon-smartphone-landscape');

                $container.addClass(Class);

                var width = "100%";

                if (Class == 'canvasicon-desktop') {
                    width = "100%";
                }
                if (Class == 'canvasicon-tablet-landscape') {
                    width = "1024px";
                }
                if (Class == 'canvasicon-tablet') {
                    width = "768px";
                }
                if (Class == 'canvasicon-smartphone-landscape') {
                    width = "480px";
                }
                if (Class == 'canvasicon-smartphone') {
                    width = "320px";
                }

                $('.canvas-pageWrapper').attr('style','width:' + width);

            });

        },

        controlMenu: function() {
            $('body').on('click', '.canvas-item-menu', function (e) {
                e.preventDefault();

                $('.canvas-menu').toggleClass('canvas-open');

            });
        }
    };

    // Control Menu
    // -----------
    app.controlMenu = {

        init: function () {

            var me = this;

            if ($('.canvas-menu').length <= 0) {
                me.render();
                me.makeControlsDraggable();
                me.resizeList();

                $(window).on('resize', function () {
                    me.resizeList();
                });
            }
        },

        render: function () {

           
            var $menu = $('<div><div class="canvas-menu">' +
                    '<ul class="canvas-controls" id="canvas-controls">' +
                    '</ul>' +
                '</div></div>');

            $(app.params.controls).each(function () {

                var control = this;

                $menu.find('.canvas-controls').append('<li class="canvas-control" data-control="' + control + '" data-controlType="' + control + '">' + control + '</li>');

            });

            $('body').append($menu.html());

        },

        makeControlsDraggable: function () {

            var el = document.getElementById('canvas-controls')

            var sortable = new Sortable(el, {
                group: {
                    name: 'controls',
                    put: false,
                    pull: 'clone'
                },
                delay: 0,
                sort: false,  // sorting inside list
                ghostClass: "canvas-sortable-placeholder",  // Class name for the drop placeholder
                chosenClass: "canvas-sortable-chosen",  // Class name for the chosen item
                draggable: ".canvas-control",  // Specifies which items inside the element should be sortable
                animation: 0,
                forceFallback: true,
                fallbackClass: "canvas-sortable-fallback",
                fallbackOnBody: true,
                setData: function (dataTransfer, dragEl) {
                    dataTransfer.setData('Text', dragEl.textContent);
                },

                // dragging started
                onStart: function (/**Event*/evt) {
                    $('.canvas-menu,.canvas-window,canvas-overlay').removeClass('canvas-open');
                    $('body').addClass('canvas-ui-dragging');
                },

                // dragging ended
                onEnd: function (/**Event*/evt) {
                    $('.canvas-menu').addClass('canvas-open');
                    $('body').removeClass('canvas-ui-dragging');

                    var $item = $(evt.item);

                    if (!$item.parent().hasClass('canvas-controls')) {
                        $item.remove();
                    }
                }
            });

        },

        resizeList: function () {

            var height = 0;
            var windowHeight = $(window).height();

            $('.canvas-menu').css('height', windowHeight - 60);

        },

    };

    app.areas = {

        init: function ($doc) {
            this.MakeSortable($doc.find('.canvas-area'),$doc);
        },

        MakeSortable: function ($element,$doc) {
            var me = this;

            $($element).each(function () {

                var $container = $(this);

                var sortable = new Sortable($container[0], {

                    group: {
                        name: 'controls',
                        put: true,
                        pull: true
                    },
                    sort: true,
                    delay: 0,
                    handle: '.canvas-action-move',
                    animation: 0,  // ms, animation speed moving items when sorting, `0` — without animation
                    draggable: ".canvas-control",  // Specifies which items inside the element should be sortable
                    ghostClass: "canvas-sortable-control",  // Class name for the drop placeholder
                    chosenClass: "canvas-sortable-chosen",  // Class name for the chosen item
                    scroll: true, // or HTMLElement
                    scrollSensitivity: 5, // px, how near the mouse must be to an edge to start scrolling.
                    scrollSpeed: 10, // px

                    setData: function (dataTransfer, dragEl) {
                        dataTransfer.setData('Text', dragEl.textContent);
                    },

                    // dragging started
                    onStart: function (evt) {
                        $doc.find('.canvas-menu,.canvas-window,canvas-overlay').removeClass('canvas-open');
                        $doc.find('body').addClass('canvas-ui-dragging');
                    },

                    // dragging ended
                    onEnd: function (evt) {

                        $doc.find('body').removeClass('canvas-ui-dragging');
                    },

                    // Element is dropped into the list from another list
                    onAdd: function (evt) {

                        var $item = $(evt.item);
                        var $areaDraggedFrom = $(evt.from);
                        var $areaDroppedTo = $(evt.to);
                        var position = evt.newIndex;

                        app.params.controlIndex = position;

                        if ($areaDraggedFrom.hasClass('canvas-controls')) {

                            var controlType = $item.text();

                            me.addControl($areaDroppedTo, controlType, position);
                        } else {

                            if ($areaDraggedFrom.find('> .canvas-control').length <= 0) {
                                $areaDraggedFrom.addClass('canvas-area-empty');
                            }

                            me.sortControl($areaDraggedFrom.data('area'), $areaDroppedTo, $item.data('controlid'));

                        }

                        $areaDroppedTo.removeClass('canvas-area-empty');

                    },

                    // Changed sorting within list
                    onUpdate: function (/**Event*/evt) {

                        var $item = $(evt.item);
                        var $areaDraggedFrom = $(evt.from);
                        var $areaDroppedTo = $(evt.to);
                        var position = evt.newIndex;

                        app.params.controlIndex = position;

                        me.sortControl($areaDraggedFrom.data('area'), $areaDroppedTo, $item.data('controlid'));

                    }
                });

            });

        },

        addControl: function ($areaDroppedTo, controlType, position) {

            var me = this;

            $.ajax({
                type: "POST",
                url: app.params.apiUrl + '/AddControl?areaAlias=' + $areaDroppedTo.data('area') + '&controlType=' + controlType + '&pageId=' + app.params.pageId(),
                success: function (json) {

                    app.helpers.loader.stop();

                    var $controlWrapper = me.renderControlWrapper(json.controlType,json.controlId);

                    var position = app.params.controlIndex;

                    if (position == 0) {

                        $areaDroppedTo.prepend($controlWrapper);
                    } else {

                        var dropAfterElement = $areaDroppedTo.find("> .canvas-control:eq(" + (position - 1) + ")");

                        if (dropAfterElement.length > 0) {
                            dropAfterElement.after($controlWrapper);
                        } else {
                            $areaDroppedTo.append($controlWrapper);
                        }

                    }

                    // Check if need to sort

                    if ($areaDroppedTo.find(' > .canvas-control').length > 0) {

                        me.sortControl($areaDroppedTo.data('area'), $areaDroppedTo, json.controlId);

                    }

                    app.areas.MakeSortable($('.canvas-area'),$('body'));

                    app.control.editControl(json.controlId);

                }
            });


        },

        sortControl: function (areaDraggedFromAlias, $areaDroppedTo, controlId) {

            var me = this;

            app.helpers.loader.start();

            $.ajax({
                type: "POST",
                url: app.params.apiUrl + '/SortControl?areaFromAlias=' + areaDraggedFromAlias + '&areaToAlias=' + $areaDroppedTo.attr('data-area') + '&pageId=' + app.params.pageId() + '&controlId=' + controlId + '&position=' + app.params.controlIndex,
                success: function (json) {
                    app.helpers.loader.stop();
                    app.helpers.RenderPublish();
                },
                error: function (a, b, c) {
                }
            });

        },

        renderControlWrapper: function (controlType, controlId) {

            var actions = '<div class="canvas-control-actions"><a href="#" class="canvas-action-edit">Edit</a><a href="#" class="canvas-action-delete">Delete</a><a href="#" class="canvas-action-move">Move</a></div>';

            var $widgetWrapper = $("<div class='canvas-control' data-controlId='" + controlId + "' data-controlType='" + controlType + "'><div class='canvas-control-content'></div><span class='canvas-border canvas-border-top'></span><span class='canvas-border canvas-border-right'></span><span class='canvas-border canvas-border-bottom'></span><span class='canvas-border canvas-border-left'></span></div>");

            if (controlType == 'Grid') {
                // Grid control
                content = '<div class="row"><div class="column medium-6"><div class="canvas-area canvas-area-empty" data-area="grid-6-' + controlId + '-0" data-pageid="' + app.params.pageId() + '" data-position="0"></div></div><div class="column medium-6"><div class="canvas-area canvas-area-empty" data-area="grid-6-' + controlId + '-1" data-pageid="' + app.params.pageId() + '" data-position="1"></div></div></div>';
                $widgetWrapper.prepend(actions).find('.canvas-control-content').prepend(content);
            } else if (controlType == 'Media') {
                // Media control
                $widgetWrapper.prepend(actions).find('.canvas-control-content').prepend('<div class="canvas-media-placeholder">No media set</div>');
            } else if (controlType == 'Macro') {
                // Macro control
                $widgetWrapper.prepend(actions).find('.canvas-control-content').prepend('<div class="canvas-macro-placeholder">No macro selected</div>');
            } else if (controlType == 'Section') {
                // Section control
                content = '<section><div class="container"><div class="canvas-area" data-area="section-' + controlId + '"></div></div></section>';
                $widgetWrapper.prepend(actions).find('.canvas-control-content').prepend(content);
            } else if (controlType == 'Heading') {
                $widgetWrapper.prepend(actions).find('.canvas-control-content').prepend('<div class="canvas-heading-placeholder">No title set</div>');
            } else if (controlType == 'Button') {
                $widgetWrapper.prepend(actions).find('.canvas-control-content').prepend('<div class="canvas-button-placeholder">No title set</div>');
            } else {
                // Rich Text & Text control
                $widgetWrapper.prepend(actions).find('.canvas-control-content').prepend('<div class="canvas-richtext-placeholder">Write content here...</a>');
            }

            app.control.deleteControl($widgetWrapper.find('.canvas-action-delete'));
            app.control.initEditControl($widgetWrapper.find('.canvas-action-edit'));

            return $widgetWrapper;

        }


    };

    app.control = {

        init: function ($doc) {
            var me = this;

            this.deleteControl($doc.find('.canvas-action-delete'));
            this.initEditControl($doc.find('.canvas-action-edit'));

        },

        deleteControl: function ($element) {

            $element.on('click', function (e) {
                e.preventDefault();

                var widget = $(this).closest('.canvas-control');

                var area = $(this).closest('.canvas-area');
                var areaAlias = area.attr('data-area');
                var controlId = widget.attr('data-controlId');
                var controlType = widget.attr('data-controlType');
                var areaPosition = area.attr('data-position');

                if (areaPosition != '' && areaPosition !== undefined) {
                    areaAlias = areaAlias + '-' + areaPosition;
                }

                app.helpers.loader.start();

                $.ajax({
                    type: "POST",
                    url: app.params.apiUrl + '/DeleteControl?areaAlias=' + areaAlias + '&controlId=' + controlId + '&pageId=' + app.params.pageId() + '&controlType=' + controlType,
                    success: function (json) {

                        widget.remove();

                        app.helpers.loader.stop();

                        var widgets = area.find('> .canvas-control');
                        var i = 0;

                        $(widgets).each(function (i) {

                            $(this).attr('data-position', i);

                            i++;
                        });

                        if (area.find(' > .canvas-control').length <= 0) {
                            //area.append('<div class="canvas-area-placeholder"></div>');
                            area.addClass('canvas-area-empty');
                        }

                        app.helpers.RenderPublish();

                    },
                    error: function (a, b, c) {

                    }
                });

            });

        },

        initEditControl: function ($element) {
            var me = this;

            $element.on('click', function (e) {
                e.preventDefault();

                var controlId = $(this).closest('.canvas-control').attr('data-controlId');

                me.editControl(controlId);

            });
        },

        editControl: function (controlId) {
            var me = this;

            $window = $('.canvas-window');

            //$('.canvas-menu').removeClass('canvas-open');

            app.helpers.loader.start();

            $.ajax({
                type: "GET",
                url: app.params.apiUrl + '/EditControl?controlId=' + controlId + '&pageId=' + app.params.pageId(),
                success: function (json) {

                    app.helpers.loader.stop();

                    $window.html('');

                    var $form = $('<div class="canvas-container"><a href="#" class="canvas-window-close">Close window</a><form method="post" action="' + app.params.apiUrl + '/EditControl">'
                        + '<input type="hidden" name="controlId" value="' + controlId + '" />'
                        + '<input type="hidden" name="pageId" value="' + app.params.pageId() + '" />'
                        + '<input type="hidden" name="controlType" value="' + json.type + '" />'
                        + '</form></div>');

                    $(json.properties).each(function (i,o) {

                        var $property = me.propertiesBuilder.renderProperty(o.Key,json.type,o.Value,json);

                        $form.find('form').append($property);
                    });

                    $form.find('form').append('<button type="submit" data-type="save">Save</button>');

                    $window.append($form).addClass('canvas-open');

                    tinymce.init(app.params.tinyMceConfig);

                    me.postEdit($form.find('form'));

                }
            });

        },

        postEdit: function ($form) {
        
            $form.on('submit', function (e) {

                e.preventDefault();

                var $button = $form.find('button[type=submit]');

                $button.attr('disabled', 'disabled');

                app.helpers.loader.start();

                $form.find('.canvas-macro-properties-wrapper').each(function (i, v) {

                    var $macroControlGroup = $(this).parent();
                    var $inputMacro = $macroControlGroup.find('input[name=Macro]');
  
                    $(this).find('.canvas-control-group').each(function (i, v) {

                        var input = $(this).find('input,textarea,select');

                        var inputValue = input.val();
                        var inputAlias = input.attr('name');

                        var $inputMacroValue = $inputMacro.val();

                        if (inputAlias != 'select-macro') {

                            if (input.is(':checkbox')) {
                                inputValue = input.is(':checked') ? '1' : '0';
                            }

                            var re = new RegExp(inputAlias + "=(\"[^<>\"]*\"|'[^<>']*'|\w+)", "g");

                            if ($inputMacroValue.indexOf(inputAlias + "=") > -1) {
                                $inputMacroValue = $inputMacroValue.replace(re, inputAlias + "='" + inputValue + "'")
                            } else {
                                $inputMacroValue = $inputMacroValue.replace("/>", inputAlias + "='" + inputValue + "' />")
                            }

                            $inputMacro.val($inputMacroValue);

                        }

                    });

                });


                if ($form.find('.canvas-control-group-columns').length > 0) {

                    var columnsValue = "";

                    $form.find('.canvas-control-group-columns').each(function (i, v) {

                        var col = $(this).find('.canvas-gridColumns-col').val();
                        var screen = $(this).find('.canvas-gridColumns-screen').val();
                        var config = $(this).find('.canvas-gridColumns-config').val();

                        columnsValue = columnsValue + (col + ":" + screen + ":" + config + ";");

                    });

                    $form.find('input[name=Columns]').val(columnsValue);

                }

                $.ajax({
                    type: "POST",
                    url: $form.attr('action'),
                    data: $form.serialize(),
                    success: function (json) {

                        window.location.reload();
                    },
                    error: function (a, b, c) {
                        app.helpers.loader.stop();
                    }
                });

            });

        },

        propertiesBuilder: {

            renderProperty: function (propertyName, controlType, propertyValue, json) {

                var me = this;
                var $property = '';

                switch (propertyName) {

                    case "Title":

                        if (controlType == "RichText" || controlType == "Media" || controlType == "Text" || controlType == "Heading" || controlType == "Button") {

                            $property = me.build('Umbraco.Textbox', propertyName, propertyName, propertyValue);

                        }

                        break;

                    case "Description":

                        if (controlType == "Media") {

                            $property = me.build('Umbraco.TextboxMultiple', propertyName, propertyName, propertyValue);

                        }

                        if (controlType == "Button") {
                            $property = me.build('Umbraco.Textbox', propertyName, "Url", propertyValue);
                        }

                        break;
                    case "Content":

                        if (controlType == "RichText") {

                            $property = me.build('Umbraco.TinyMCEv3', propertyName, propertyName, propertyValue);

                        }

                        if (controlType == "Text") {

                            $property = me.build('Umbraco.TextboxMultiple', propertyName, propertyName, propertyValue);
                        }

                        break;
                    case "Template":

                        if (controlType == "Media" || controlType == "RichText" || controlType == "Text" || controlType == "Section" || controlType == "Grid" || controlType == "Heading" || controlType == "Button") {

                            $property = $('<div class="canvas-control-group canvas-clearfix">'
                                + '<label for="' + propertyName + '">' + propertyName + ' <a href="#" class="canvas-template-new" style="float:right; margin-left:10px;">New</a> <a href="#" class="canvas-template-edit" style="float:right; margin-left:10px;">Edit</a></label>'
                                + '<select name="' + propertyName + '" id="' + propertyName + '"><option value="">Select template</option></select>'
                                + '</div>')

                            $(json.templates).each(function (i) {

                                var selected = "";

                                if (propertyValue == this.path) {
                                    selected = 'selected="selected"';
                                }

                                $property.find('select').append('<option value="' + this.path + '" ' + selected + '>' + this.name + '</option>');

                            });
                        }

                        break;
                    case "Item":

                        if (controlType == "Media" || controlType == "Section") {

                            $property = me.build('Umbraco.MediaPicker', propertyName, propertyName, propertyValue);

                        }

                        break;
                    case "Macro":

                        if (controlType == "Macro") {

                            $property = $('<div class="canvas-control-group">'
                                + '<label for="select-' + propertyName + '">' + propertyName
                                + '<a href="#" class="canvas-macro-editTemplate" style="float:right;">Edit</a>'
                                + '</label>'
                                + '<select name="select-' + propertyName + '" id="select-' + propertyName + '" class="canvas-macro-select"><option value="">Select macro</option></select>'
                                + '<input type="hidden" name="' + propertyName + '" value="' + propertyValue.replace(/"/g, "'") + '" />'
                                + '</div>')

                            var re = new RegExp("macroAlias=(\"[^<>\"]*\"|'[^<>']*'|\w+)", "g");
                            var match = re.exec(propertyValue);
                            var macroAlias = '';

                            if (propertyValue != '') {
                                macroAlias = match[1].replace(/"/g, '').replace(/'/g, '');
                            }

                            $property.find('.canvas-macro-select').on('change', function (e) {
                                e.preventDefault();

                                var select = $(this);
                                var val = select.val();

                                $('.canvas-properties-wrapper').html('');

                                $('.canvas-window input[name=Macro]').val('');

                                if (val != '') {

                                    me.renderMacroProperties(val, select, '', select.find('option:selected').attr('data-macroAlias'));

                                }

                            });

                            $(json.macros).each(function (i) {

                                var selected = "";

                                if (macroAlias == this.macroAlias) {
                                    selected = 'selected="selected"';

                                    me.renderMacroProperties(this.id, $property.find('select'), propertyValue, this.macroAlias);

                                }

                                $property.find('select').append('<option value="' + this.id + '" data-macroAlias="' + this.macroAlias + '" ' + selected + '>' + this.macroName + '</option>');

                            });

                        }

                        break;

                    case "Columns":

                        if (controlType == "Grid") {

                            $property = $('<div class="canvas-control-group canvas-clearfix">'
                                + '<label for="' + propertyName + '">' + propertyName + ' <a href="#" class="canvas-columns-add">Add Column</a></label>'
                                + '<input type="hidden" name="' + propertyName + '" id="' + propertyName + '" value="' + propertyValue + '" />'
                                + '</div>')

                            var columns = propertyValue.split(';');

                            var screens = ['small', 'medium', 'large'];

                            $(columns).each(function (index, item) {

                                if (item != '') {

                                    var values = item.split(':');

                                    var row = $('<div class="canvas-control-group canvas-control-group-columns  canvas-clearfix">'
                                    + '<select class="canvas-gridColumns-col"></select>'
                                    + '<select class="canvas-gridColumns-screen"></select>'
                                    + '<input type="text" class="canvas-gridColumns-config" value="' + values[2] + '"/>'
                                    + '<a href="#">X</a>'
                                    + '</div>');

                                    for (i = 1; i < 13; i++) {
                                        row.find('.canvas-gridColumns-col').append('<option value="' + i + '">' + i + '</option>');
                                    }

                                    $(screens).each(function (x, z) {
                                        row.find('.canvas-gridColumns-screen').append('<option value="' + z + '">' + z + '</option>');
                                    });

                                    row.find('.canvas-gridColumns-col option[value=' + values[0] + ']').attr('selected', 'selected');
                                    row.find('.canvas-gridColumns-screen option[value=' + values[1] + ']').attr('selected', 'selected');

                                    $property.append(row);
                                }


                            });

                            $property.find('.canvas-columns-add').on('click', function (e) {

                                e.preventDefault();

                                var screens = ['small', 'medium', 'large'];

                                var group = $(this).closest('.canvas-control-group');

                                var row = $('<div class="canvas-control-group canvas-control-group-columns ">'
                                           + '<select class="canvas-gridColumns-col"></select>'
                                           + '<select class="canvas-gridColumns-screen"></select>'
                                           + '<input type="text" class="canvas-gridColumns-config"/>'
                                           + '<a href="#">X</a>'
                                           + '</div>');

                                for (i = 1; i < 13; i++) {
                                    row.find('.canvas-gridColumns-col').append('<option value="' + i + '">' + i + '</option>');
                                }

                                $(screens).each(function (x, z) {
                                    row.find('.canvas-gridColumns-screen').append('<option value="' + z + '">' + z + '</option>');
                                });

                                group.append(row);

                            });

                            $('body').on('click', '.canvas-control-group-columns a', function (e) {

                                e.preventDefault();

                                var group = $(this).closest('.canvas-control-group-columns');

                                group.remove();

                            });


                        }

                        if (controlType == "Heading") {
                            $property = $('<div class="canvas-control-group canvas-clearfix">'
                                + '<label for="' + propertyName + '">Heading</label>'
                                + '<select name="' + propertyName + '" id="' + propertyName + '">'
                                + '<option value="h1" ' + (propertyValue == "h1" ? "selected=selcted" : "") + '>H1</option>'
                                + '<option value="h2" ' + (propertyValue == "h2" ? "selected=selcted" : "") + '>H2</option>'
                                + '<option value="h3" ' + (propertyValue == "h3" ? "selected=selcted" : "") + '>H3</option>'
                                + '<option value="h4" ' + (propertyValue == "h4" ? "selected=selcted" : "") + ' ' + (propertyValue == "" ? "selected=selcted" : "") + '>H4</option>'
                                + '<option value="h5" ' + (propertyValue == "h5" ? "selected=selcted" : "") + '>H5</option>'
                                + '<option value="h6" ' + (propertyValue == "h6" ? "selected=selcted" : "") + '>H6</option>'
                                + '</select>'
                                + '</div>');
                        }

                        if (controlType == "Button") {
                            $property = me.build('Umbraco.Textbox', propertyName, "Icon", propertyValue);
                        }

                        break;

                    case "Class":

                        if (controlType == "Grid" || controlType == "Section" || controlType == "Heading" || controlType == "Button") {

                            $property = me.build('Umbraco.Textbox', propertyName, propertyName, propertyValue);

                        }

                        break;

                    default:
                        "";
                }

                return $property;

            },

            build: function (contentType, alias, name, value) {

                var property = $('');

                if (contentType == 'Umbraco.TextboxMultiple' || contentType == 'textMultiple') {

                    property = $('<div class="canvas-control-group">'
                     + '<label for="' + alias + '">' + name + '</label>'
                     + '<textarea name="' + alias + '" rows="6" id="' + alias + '">' + value + '</textarea>'
                     + '</div>');

                } else if (contentType == 'Umbraco.Textbox' || contentType == 'text') {

                    property = $('<div class="canvas-control-group">'
                        + '<label for="' + alias + '">' + name + '</label>'
                        + '<input type="text" name="' + alias + '" id="' + alias + '" value="' + value + '" />'
                        + '</div>');

                } else if (contentType == 'contentTypeMultiple') {

                    var contentValue = 'Add';

                    var values = value.split(",");

                    property = $('<div class="canvas-control-group">'
                        + '<label for="' + alias + '">' + name + '</label>'
                        + '<div class="canvas-multipleContentPicker-Items">'
                        + '</div>'
                        + '<input type="hidden" name="' + alias + '" id="' + alias + '" value="' + value + '" />'
                        + '</div>');

                    for (var i = 0; i < values.length; i++) {

                        if (values[i] != '') {

                            app.helpers.loader.start();

                            $.ajax({
                                type: "POST",
                                url: app.params.apiUrl + '/GetContentItem?id=' + values[i],
                                success: function (json) {

                                    app.helpers.loader.stop();

                                    var $item = $('<div><div class="canvas-multipleContentPicker-Item" data-itemId="' + json.id + '">'
                                    + '<a href="#" class="canvas-ContentPicker ' + (json.id != '' ? 'canvas-MultipleContentPicker-remove' : 'canvas-MultipleContentPicker-add') + '" >' + json.name + '</a>'
                                    + '</div></div>');

                                    property.find('.canvas-multipleContentPicker-Items').append($item.html());

                                },
                                error: function (a, b, c) {

                                }
                            });

                        }
                    }

                    var $itemAdd = $('<div><div class="canvas-multipleContentPicker-Item">'
                    + '<a href="#" class="canvas-ContentPicker canvas-MultipleContentPicker-add" >Add</a>'
                    + '</div></div>');

                    property.find('.canvas-multipleContentPicker-Items').append($itemAdd.html());


                } else if (contentType == 'Umbraco.ContentPickerAlias' || contentType == 'content') {

                    var contentValue = 'Add';

                    property = $('<div class="canvas-control-group">'
                        + '<label for="' + alias + '">' + name + '</label>'
                        + '<a href="#" class="canvas-ContentPicker ' + (value != '' ? 'canvas-ContentPicker-remove' : 'canvas-ContentPicker-add') + '" >' + contentValue + '</a>'
                        + '<input type="hidden" name="' + alias + '" id="' + alias + '" value="' + value + '" />'
                        + '</div>');

                    if (value != '') {

                        app.helpers.loader.start();

                        $.ajax({
                            type: "POST",
                            url: app.params.apiUrl + '/GetContentItem?id=' + value,
                            success: function (json) {
                                app.helpers.loader.stop();
                                property.find('a').text(json.name);
                            },
                            error: function (a, b, c) {

                            }
                        });

                    }

                } else if (contentType == 'Umbraco.TrueFalse' || contentType == 'yesNo') {

                    var checked = '';

                    if (value != null && value == 1) {
                        checked = 'checked="checked"';
                    }

                    property = $('<div class="canvas-control-group canvas-control-checkbox">'
                        + '<label for="' + alias + '">'
                        + '<input type="checkbox" name="' + alias + '" id="' + alias + '" ' + checked + '/>'
                        + name
                        + '</label>'
                        + '</div>');

                } else if (contentType == 'Umbraco.TinyMCEv3') {

                    property = $('<div class="canvas-control-group">'
                        + '<label for="' + alias + '">' + alias + '  <a href="#" class="canvas-content-edit-advanced" style="float:right;">Advanced</a></label>'
                        + '<textarea class="canvas-editable" name="' + alias + '" id="canvas-editor-simple" rows="7">' + value + '</textarea>'
                        + '</div>');

                } else if (contentType == 'Umbraco.MediaPicker' || contentType == 'media') {

                    property = $('<div class="canvas-control-group">'
                        + '<label for="' + alias + '">' + alias + '</label>'
                        + '<input type="hidden" name="' + alias + '" id="' + alias + '" value="' + value + '" />'
                        + '<div class="canvas-image-wrapper" data-Id="' + value + '"><i class="canvas-icon canvas-icon-add"></i></div>'
                        + '</div>');

                    if (value != '') {

                        $.ajax({
                            type: "POST",
                            url: app.params.apiUrl + '/GetMediaItem?id=' + value,
                            success: function (json) {

                                property.find('.canvas-image-wrapper p').remove();

                                if (json.type == 'image') {

                                    var src = json.src;

                                    var thumbSplit = src.split('.');

                                    var thumbSrc = src.replace('.' + thumbSplit[thumbSplit.length - 1], '_thumb.' + thumbSplit[thumbSplit.length - 1]);

                                    var thumbPath = app.params.version() == '6' ? thumbSrc : '/umbraco/backoffice/UmbracoApi/Images/GetBigThumbnail?originalImagePath=' + json.src;

                                    var img = '<img src="' + thumbPath + '" alt="' + json.name + '" title="' + json.name + '"/>';

                                    property.find('.canvas-image-wrapper').addClass('canvas-hasImage').removeClass('canvas-hasFile').append(img);
                                }
                                if (json.type == 'file') {
                                    var file = '<i class="canvas-icon-document"></i><p>' + json.name + '</p>';

                                    property.find('.canvas-image-wrapper').addClass('canvas-hasFile').removeClass('canvas-hasImage').append(file);
                                }
                                if (json.type == 'folder') {
                                    var file = '<i class="canvas-icon-folder"></i><p>' + json.name + '</p>';

                                    property.find('.canvas-image-wrapper').addClass('canvas-hasFile').removeClass('canvas-hasImage').append(file);
                                }

                            },
                            error: function (a, b, c) {

                            }
                        });

                    }

                    property.find('.canvas-image-wrapper').on('click', function (e) {
                        e.preventDefault();

                        app.pickers.mediaPicker.params.$container = $(this).closest('.canvas-control-group');

                        app.pickers.mediaPicker.init();

                        var id = -1;

                        if ($(this).attr('data-Id') != '') {
                            id = $(this).attr('data-Id');
                        }

                        app.pickers.mediaPicker.loadMedia(id);

                    });

                } else {
                    property = $('<div class="canvas-control-group">'
                        + '<label for="' + alias + '">' + name + '</label>'
                        + '<input type="text" name="' + alias + '" id="' + alias + '" value="' + value + '" />'
                        + '</div>');
                }


                return property;
            },

            renderMacroProperties: function (macroId, select, macro, macroAlias) {

                var me = this;

                app.helpers.loader.start();

                $.ajax({
                    type: "POST",
                    url: app.params.apiUrl + '/GetMacroProperty?id=' + macroId,
                    success: function (json) {

                        app.helpers.loader.stop();

                        if (macro == '') {
                            $('.canvas-window input[name=Macro]').val("<?UMBRACO_MACRO macroAlias='" + macroAlias + "' />");
                        }

                        $('.canvas-macro-properties-wrapper').remove();

                        var propWrapper = $('<div class="canvas-macro-properties-wrapper"></div>');

                        $(json.properties).each(function (i, v) {

                            var inputValue = $('.canvas-window input[name=Macro]').val();

                            var macroAttributeValue = '';

                            if (macro != '') {

                                var re = new RegExp(json.properties[i].macroPropertyAlias + "=(\"[^<>\"]*\"|'[^<>']*'|\w+)", "g");
                                var match = re.exec(macro);

                                if (match != null) {
                                    macroAttributeValue = match[1].replace(/"/g, '');
                                }

                            } else {
                                $('.canvas-window input[name=Macro]').val(inputValue.replace('/>', ' ' + json.properties[i].macroPropertyAlias + "='' />"));
                            }

                            var $property = me.build(json.properties[i].editorAlias, json.properties[i].macroPropertyAlias, json.properties[i].macroPropertyName, macroAttributeValue);

                            propWrapper.append($property);

                        });

                        propWrapper.insertAfter(select);
                    },
                    error: function (a, b, c) {

                    }
                });

            },

            tabBuilder: function (tabObject, tabProperties, container) {

                var me = this;
                var $tabContainer = $('<div class="canvas-Tab"><h4>' + tabObject.Name + '</h4><div class="canvas-Tab-Properties"></div></div>');

                $(tabObject.PropertyTypes).each(function (index, o) {

                    var propertyEditorAlias = o.PropertyEditorAlias;
                    var propertyAlias = o.Alias;
                    var propertyName = o.Name;
                    var propertyValue = "";

                    for (var i = 0; i < tabProperties.length; i++) {

                        if (tabProperties[i].Alias == propertyAlias) {
                            propertyValue = tabProperties[i].Value;
                        }
                    }

                    if (!propertyValue) {
                        propertyValue = '';
                    }

                    var $property = me.build(propertyEditorAlias, propertyAlias, propertyName, propertyValue);

                    $tabContainer.find('.canvas-Tab-Properties').append($property);

                });

                return $tabContainer;

            }

        }

    };

    // Modules
    // -----------
    app.modules = {

        init: function() {
            this.templates.init();
            this.settings.init();
            this.advanced();
        },

        templates: {

            init: function () {
                var me = this;

                $('body').on('click', '.canvas-template-new', function (e) {
                    e.preventDefault();

                    var $overlay = $('<div class="canvas-overlay"><div class="canvas-container"></div></div>').hide();

                    var $editor = $('<div class="canvas-editor-wrapper"><label for="canvas-code-name">Name</label><input type="text" name="canvas-code-name" id="canvas-code-name" /> <textarea name="canvas-codeEditor" id="canvas-codeEditor" style="width:100%; height:500px;"></textarea><div class="canvas-editor-controls"><button type="button" class="canvas-btn canvas-btn-primary">Save</button><button type="button" class="canvas-btn canvas-btn-secondary">Cancel</button></div></div>');

                    $overlay.find('.canvas-container').append($editor);

                    $('body').append($overlay.fadeIn());
                    
                    var myCodeMirror = CodeMirror.fromTextArea(document.getElementById("canvas-codeEditor"), app.modules.codeMirror.config);

                    app.modules.codeMirror.setMode(myCodeMirror, 'xml');
                    app.modules.codeMirror.setMode(myCodeMirror, 'javascript');
                    app.modules.codeMirror.setMode(myCodeMirror, 'css');
                    app.modules.codeMirror.setMode(myCodeMirror, 'htmlmixed');

                    myCodeMirror.getDoc().setValue('@inherits Umbraco.Web.Mvc.UmbracoViewPage<dynamic>');

                    myCodeMirror.setSize("100%", 500);

                    $editor.on('click', '.canvas-btn-primary', function (e) {
                        e.preventDefault();

                        var me = $(this);

                        $.ajax({
                            type: "POST",
                            url: app.params.apiUrl + '/CreateTemplate',
                            data: { content: myCodeMirror.getValue(), name: $('#canvas-code-name').val(), controlType: $('.canvas-window input[name=controlType]').val() },
                            success: function (json) {

                                me.removeAttr('disabled');

                                if (json.success) {

                                    $('.canvas-control-group #Template').html('<option value="">Select Template</option>');

                                    $(json.templates).each(function (i) {

                                        var selected = "";

                                        if ($('#canvas-code-name').val() == this.name) {
                                            selected = 'selected="selected"';
                                        }

                                        $('.canvas-control-group #Template').append('<option value="' + this.path + '" ' + selected + '>' + this.name + '</option>');

                                    });

                                    $('.canvas-overlay').fadeOut(function () {
                                        $(this).remove();
                                    });

                                } else {
                                    alert(json.message);
                                }

                            },
                            error: function (a, b, c) {
                                me.removeAttr('disabled');
                            }
                        });

                    });

                    $editor.on('click', '.canvas-btn-secondary', function (e) {
                        e.preventDefault();

                        $('.canvas-overlay').fadeOut(function () {
                            $(this).remove();
                        });

                    });

                });

                $('body').on('click', '.canvas-macro-editTemplate', function (e) {
                    e.preventDefault();

                    var $container = $(this).closest('.canvas-control-group');
                    var $select = $container.find('#select-Macro');
                    if ($select.val() != '') {


                        var $overlay = $('<div class="canvas-overlay"><div class="canvas-container"></div></div>').hide();

                        var $editor = $('<div class="canvas-editor-wrapper"><textarea name="canvas-codeEditor" id="canvas-codeEditor" style="width:100%; height:500px;"></textarea><div class="canvas-editor-controls"><button type="button" class="canvas-btn canvas-btn-primary">Save</button><button type="button" class="canvas-btn canvas-btn-secondary">Cancel</button></div></div>');

                        $overlay.find('.canvas-container').append($editor);

                        $('body').append($overlay.fadeIn());

                        var myCodeMirror = CodeMirror.fromTextArea(document.getElementById("canvas-codeEditor"), app.modules.codeMirror.config);

                        app.modules.codeMirror.setMode(myCodeMirror, 'xml');
                        app.modules.codeMirror.setMode(myCodeMirror, 'javascript');
                        app.modules.codeMirror.setMode(myCodeMirror, 'css');
                        app.modules.codeMirror.setMode(myCodeMirror, 'htmlmixed');

                        myCodeMirror.getDoc().setValue('@inherits Umbraco.Web.Mvc.UmbracoViewPage<dynamic>');


                        $.ajax({
                            type: "POST",
                            url: app.params.apiUrl + '/GetMacroTemplateValue',
                            data: { id: $select.val() },
                            success: function (json) {
                                myCodeMirror.getDoc().setValue(json.content);
                                myCodeMirror.setSize("100%", 500);
                            }
                        });

                        $editor.on('click', '.canvas-btn-primary', function (e) {
                            e.preventDefault();

                            var me = $(this);

                            me.attr('disabled', 'disabled');

                            app.helpers.loader.start();

                            $.ajax({
                                type: "POST",
                                url: app.params.apiUrl + '/SaveMacroTemplate',
                                data: { content: myCodeMirror.getValue(), id: $select.val(), },
                                success: function (json) {

                                    app.helpers.loader.stop();

                                    me.removeAttr('disabled');

                                    if (json.success) {

                                        location.reload();

                                    } else {
                                        alert(json.message);
                                    }

                                },
                                error: function (a, b, c) {
                                    me.removeAttr('disabled');
                                }
                            });

                        });

                        $editor.on('click', '.canvas-btn-secondary', function (e) {
                            e.preventDefault();

                            $('.canvas-overlay').fadeOut(function () {
                                $(this).remove();
                            });

                        });

                    } else {
                        alert('No template selected');
                    }

                });

                $('body').on('click', '.canvas-template-edit', function (e) {
                    e.preventDefault();

                    var $container = $(this).closest('.canvas-control-group');
                    var $select = $container.find('#Template');

                    if ($container.find('#Template').val() != '') {


                        var $overlay = $('<div class="canvas-overlay"><div class="canvas-container"></div></div>').hide();

                        var $editor = $('<div class="canvas-editor-wrapper"><label for="canvas-code-name">Name</label><input type="text" name="canvas-code-name" id="canvas-code-name"  value="' + $select.find('option:selected').text() + '"  /> <textarea name="canvas-codeEditor" id="canvas-codeEditor" style="width:100%; height:500px;"></textarea><div class="canvas-editor-controls"><button type="button" class="canvas-btn canvas-btn-primary">Save</button><button type="button" class="canvas-btn canvas-btn-secondary">Cancel</button><button type="button" class="canvas-btn canvas-btn-danger canvas-right">Delete</button></div></div>');

                        $overlay.find('.canvas-container').append($editor);

                        $('body').append($overlay.fadeIn());

                        var myCodeMirror = CodeMirror.fromTextArea(document.getElementById("canvas-codeEditor"), app.modules.codeMirror.config);

                        app.modules.codeMirror.setMode(myCodeMirror, 'xml');
                        app.modules.codeMirror.setMode(myCodeMirror, 'javascript');
                        app.modules.codeMirror.setMode(myCodeMirror, 'css');
                        app.modules.codeMirror.setMode(myCodeMirror, 'htmlmixed');

                        myCodeMirror.getDoc().setValue('@inherits Umbraco.Web.Mvc.UmbracoViewPage<dynamic>');

                        $.ajax({
                            type: "POST",
                            url: app.params.apiUrl + '/GetTemplateValue',
                            data: { path: $select.val() },
                            success: function (json) {
                                myCodeMirror.getDoc().setValue(json.content);
                                myCodeMirror.setSize("100%", 500);
                            }
                        });


                        $editor.on('click', '.canvas-btn-primary', function (e) {
                            e.preventDefault();

                            var me = $(this);

                            me.attr('disabled', 'disabled');

                            app.helpers.loader.start();


                            $.ajax({
                                type: "POST",
                                url: app.params.apiUrl + '/SaveTemplate',
                                data: { content: myCodeMirror.getValue(), name: $('#canvas-code-name').val(), controlType: $('.canvas-window input[name=controlType]').val() },
                                success: function (json) {

                                    app.helpers.loader.stop();

                                    me.removeAttr('disabled');

                                    if (json.success) {

                                        $select.html('<option value="">Select emplate</option>');

                                        $(json.templates).each(function (i) {

                                            var selected = "";

                                            if ($('#canvas-code-name').val() == this.name) {
                                                selected = 'selected="selected"';
                                            }

                                            $select.append('<option value="' + this.path + '" ' + selected + '>' + this.name + '</option>');

                                        });

                                        $('.canvas-overlay').fadeOut(function () {
                                            $(this).remove();
                                        });

                                    } else {
                                        alert(json.message);
                                    }

                                },
                                error: function (a, b, c) {
                                    me.removeAttr('disabled');
                                }
                            });

                        });

                        $editor.on('click', '.canvas-btn-secondary', function (e) {
                            e.preventDefault();

                            $('.canvas-overlay').fadeOut(function () {
                                $(this).remove();
                            });

                        });

                        $editor.on('click', '.canvas-btn-danger', function (e) {
                            e.preventDefault();

                            var me = $(this);

                            me.attr('disabled', 'disabled');

                            app.helpers.loader.start();

                            $.ajax({
                                type: "POST",
                                url: app.params.apiUrl + '/DeleteTemplate',
                                data: { path: $select.val(), controlType: $('.canvas-window input[name=controlType]').val() },
                                success: function (json) {

                                    me.removeAttr('disabled');

                                    app.helpers.loader.stop();

                                    if (json.success) {

                                        $select.html('<option value="">Select Template</option>');

                                        $(json.templates).each(function (i) {

                                            $select.append('<option value="' + this.path + '">' + this.name + '</option>');

                                        });

                                        $('.canvas-overlay').fadeOut(function () {
                                            $(this).remove();
                                        });

                                    } else {
                                        alert('Server error');
                                    }

                                },
                                error: function (a, b, c) {
                                    me.removeAttr('disabled');
                                    app.helpers.loader.stop();
                                }
                            });

                        });


                    } else {
                        alert('No template selected');
                    }

                });

            }
        },

        codeMirror: {
            config: {
                mode: "htmlmixed",
                lineNumbers: true,
                lineWrapping: true,
                tabSize: 4,
                matchBrackets: true,
                styleActiveLine: true
            },

            setMode: function (cm, mode) {
                if (mode !== undefined) {
                    var script = '/Umbraco/lib/codemirror/mode/' + mode + '/' + mode + '.js';

                    $.getScript(script, function (data, success) {
                        if (success) cm.setOption('mode', mode);
                        else cm.setOption('mode', 'clike');
                    });
                }
                else cm.setOption('mode', 'clike');
            }
        },

        settings: {

            init: function () {
                
                $('body').on('click','.canvas-item-settings', function (e) {

                    e.preventDefault();

                    $window = $('.canvas-window');

                    $('.canvas-menu').removeClass('canvas-open');

                    app.helpers.loader.start();

                    $.ajax({
                        type: "POST",
                        url: app.params.apiUrl + '/GetSettings?pageId=' + app.params.pageId(),
                        success: function (json) {

                            app.helpers.loader.stop();

                            $window.html('');

                            var $container = '';

                            var $form = $('<form method="post" action="' + app.params.apiUrl + '/SavePage" class="canvas-page-save">'
                                + '<input type="hidden" name="pageId" value="' + app.params.pageId() + '" />'
                                + '</form>');

                            $(json.tabs).each(function (i, o) {

                                $container = app.control.propertiesBuilder.tabBuilder(o, json.properties, $form);

                                $form.append($container);
                            });

                            $form.append('<button type="submit" data-type="save">Save</button>');

                            $window.append('<a href="#" class="canvas-window-close">Close window</a>').append($form).addClass('canvas-open');

                            tinymce.init(app.params.tinyMceConfig);

                            $form.on('click', '.canvas-Tab h4', function (e) {

                                $(this).parent().find('.canvas-Tab-Properties').toggle();

                            });

                            $form.on('submit', function (e) {
                                e.preventDefault();

                                app.helpers.loader.start();

                                $form.find('button[type=submit]').attr('disabled', 'disabled').text('...');

                                $.ajax({
                                    type: "POST",
                                    url: $form.attr('action'),
                                    data: $form.serialize(),
                                    success: function (json) {

                                        window.location.reload();
                                    },
                                    error: function (a, b, c) {
                                        app.helpers.loader.stop();
                                    }
                                });
                            });

                        }
                    });

                });
            }
        },

        advanced: function () {

            $('body').on('click', '.canvas-content-edit-advanced', function (e) {
                e.preventDefault();

                var $overlay = $('<div class="canvas-overlay"><div class="canvas-container"></div></div>').hide();

                var $editor = $('<div class="canvas-editor-wrapper"><textarea name="canvas-advanced-content" id="canvas-advanced-content" style="width:100%; height:500px;"></textarea><div class="canvas-editor-controls"><button type="button" class="canvas-btn canvas-btn-primary">Save</button><button type="button" class="canvas-btn canvas-btn-secondary">Cancel</button></div></div>');

                $overlay.find('.canvas-container').append($editor);

                $('body').append($overlay.fadeIn());


                $editor.on('click', '.canvas-btn-primary', function (e) {
                    e.preventDefault();

                    var data = tinymce.get('canvas-advanced-content').getContent();

                    tinymce.get('canvas-editor-simple').setContent(data);

                    $('.canvas-overlay').fadeOut(function () {

                        $(this).remove();

                    });

                });

                $overlay.find('.container').append($editor);

                $('body').append($overlay.fadeIn());

                var baseLineConfigObj = app.params.tinyMceConfigAdv;

                baseLineConfigObj.setup = function (editor) {

                    editor.addButton('umbmediapicker', {
                        icon: 'custom icon-picture',
                        tooltip: 'Media Picker',
                        onclick: function () {

                            var selectedElm = editor.selection.getNode(),
                                currentTarget;


                            if (selectedElm.nodeName === 'IMG') {
                                var img = $(selectedElm);
                                currentTarget = {
                                    name: img.attr("alt"),
                                    url: img.attr("src"),
                                    id: img.attr("rel")
                                };
                            }

                            var content = editor.selection.getContent();
                            app.pickers.mediaPicker.init(editor, content);

                            var id = -1;

                            app.pickers.mediaPicker.loadMedia(id);

                        }
                    });

                    editor.addButton('umbcontentpicker', {
                        icon: 'custom icon-document',
                        tooltip: 'Content Picker',
                        onclick: function () {

                            var content = editor.selection.getContent();

                            app.pickers.contentPicker.open();

                        }
                    });

                };

                tinymce.init(baseLineConfigObj);

                var data = tinymce.get('canvas-editor-simple').getContent();

                tinymce.get('canvas-advanced-content').setContent(data);


                $editor.on('click', '.canvas-btn-secondary', function (e) {
                    e.preventDefault();

                    $('.canvas-overlay').fadeOut(function () {
                        $(this).remove();
                    });

                });

            });

        }
    },

    // Pickers
    // -----------
    app.pickers = {

        init: function() {
            this.contentPicker.init();
            this.multipleContentPicker.init();
        },

        contentPicker: {

            params: {
                $container: ''
            },

            init: function (editor, content) {

                var me = this;

                $('body').on('click', '.canvas-ContentPicker-add', function (e) {
                    e.preventDefault();

                    me.params.$container = $(this).closest('.canvas-control-group');

                    me.open();
                });

                $('body').on('click', '.canvas-ContentPicker-remove', function (e) {
                    e.preventDefault();

                    var $container = $(this).closest('.canvas-control-group');

                    $container.find('input').val('');
                    $container.find('a').text('Add').removeClass('canvas-ContentPicker-remove').addClass('canvas-ContentPicker-add');
                });

                $('body').on('click', '.canvas-contentpicker .canvas-plus', function () {

                    var contentId = $(this).next().attr('data-contentId');
                    var $container = $(this).parent();

                    if ($container.find(' > ul').length > 0) {
                        $container.toggleClass('canvas-open');
                    } else {

                        $container.addClass('canvas-open');

                        $.ajax({
                            type: "POST",
                            url: app.params.apiUrl + '/GetContent',
                            data: {
                                pageId: contentId
                            },
                            success: function (json) {

                                var list = $('<ul></ul>');

                                $(json).each(function (index, item) {
                                    list.append('<li class="' + (item.hasChildren ? 'canvas-hasChildren' : 'canvas-hasNoChildren') + '">' + (item.hasChildren ? '<div class="canvas-plus"></div>' : '') + '<a href="#" data-href=' + item.url + ' data-contentId=' + item.id + '>' + item.name + '</a></li>');
                                });

                                $container.append(list);

                            }
                        });

                    }

                });

                $('body').on('click', '.canvas-contentpicker .canvas-Content-Tree a', function (e) {
                    e.preventDefault();

                    if (typeof editor !== 'undefined') {

                        var text = $(this).text();
                        var href = $(this).attr('data-href').replace(/^.*\/\/[^\/]+/, '');

                        if (content != '') {
                            editor.selection.setContent('<a href="' + href + '">' + content + '</strong>');
                        } else {
                            editor.insertContent(editor.dom.createHTML('a', { href: href }, text));
                        }

                    } else {

                        me.params.$container.find('input').val($(this).attr('data-contentId'));
                        me.params.$container.find('a').text($(this).text()).removeClass('canvas-ContentPicker-add').addClass('canvas-ContentPicker-remove');

                    }

                    $('.canvas-overlap').fadeOut(function () {

                        $(this).remove();

                    });

                });

            },

            open: function () {

                var me = this;

                $('.canvas-overlap').remove();

                var overlap = $('<div class="canvas-overlap canvas-contentpicker"><div class="canvas-content-container"></div><!--div class="canvas-overlap-footer"><a href="#">Cancel</a></div--></div>').hide();

                $('body').append(overlap.fadeIn());

                $('.canvas-overlap').on('click', '.canvas-overlap-footer a', function (e) {

                    e.preventDefault();

                    $('.canvas-overlap').fadeOut(function () {

                        $(this).remove();

                    });

                });

                app.helpers.loader.start();

                $.ajax({
                    type: "POST",
                    url: app.params.apiUrl + '/GetContent',
                    data: {
                        pageId: 0
                    },
                    success: function (json) {
                        app.helpers.loader.stop();
                        var list = $('<ul class="canvas-Content-Tree"></ul>');

                        $(json).each(function (index, item) {
                            list.append('<li class="' + (item.hasChildren ? 'canvas-hasChildren' : 'canvas-hasNoChildren') + '">' + (item.hasChildren ? '<div class="canvas-plus"></div>' : '') + '<a href="#" data-href=' + item.url + ' data-contentId=' + item.id + '>' + item.name + '</a></li>');
                        });

                        overlap.find('.canvas-content-container').append(list);

                        $('body').append(overlap.fadeIn());

                    }
                });

            }
        },

        multipleContentPicker: {

            params: {
                $container: ''
            },

            init: function () {
                var me = this;

                $('body').on('click', '.canvas-MultipleContentPicker-add', function (e) {
                    e.preventDefault();

                    me.params.$container = $(this).closest('.canvas-control-group');
                    me.params.$item = $(this).closest('.canvas-multipleContentPicker-Item');

                    me.open();

                });

                $('body').on('click', '.canvas-MultipleContentPicker-remove', function (e) {
                    e.preventDefault();

                    var $container = $(this).closest('.canvas-control-group');
                    var $item = $(this).closest('.canvas-multipleContentPicker-Item');

                    var itemId = $item.attr('data-itemId');

                    $container.find('input').val($container.find('input').val().replace(',' + itemId, '').replace(itemId, ''));
                    $item.remove();
                });


                $('body').on('click','.canvas-multiplecontentpicker-menu .canvas-plus', function () {

                    var contentId = $(this).next().attr('data-contentId');
                    var $container = $(this).parent();

                    if ($container.find(' > ul').length > 0) {
                        $container.toggleClass('canvas-open');
                    } else {

                        $container.addClass('canvas-open');

                        app.helpers.loader.start();

                        $.ajax({
                            type: "POST",
                            url: app.params.apiUrl + '/GetContent',
                            data: {
                                pageId: contentId
                            },
                            success: function (json) {
                                app.helpers.loader.stop();
                                var list = $('<ul></ul>');

                                $(json).each(function (index, item) {
                                    list.append('<li class="' + (item.hasChildren ? 'canvas-hasChildren' : 'canvas-hasNoChildren') + '">' + (item.hasChildren ? '<div class="canvas-plus"></div>' : '') + '<a href="#" data-href=' + item.href + ' data-contentId=' + item.id + '>' + item.name + '</a></li>');
                                });

                                $container.append(list);

                            }
                        });

                    }

                });


                $('body').on('click','.canvas-multiplecontentpicker-menu a', function (e) {
                    e.preventDefault();

                    var dev = ',';

                    if (me.params.$container.find('input').val() === '') {
                        dev = '';
                    }

                    me.params.$container.find('input').val(me.params.$container.find('input').val() + dev + $(this).attr('data-contentId'));
                    me.params.$item.find('a').text($(this).text()).removeClass('canvas-MultipleContentPicker-add').addClass('canvas-MultipleContentPicker-remove');


                    me.params.$container.find('.canvas-multipleContentPicker-Items').append('<div class="canvas-multipleContentPicker-Item"><a href="#" class="canvas-ContentPicker canvas-MultipleContentPicker-add">Add</a></div>');

                    $('.canvas-overlap').fadeOut(function () {

                        $(this).remove();

                    });

                });

            },

            open: function () {
                var me = this;

                $('.canvas-overlap').remove();

                var overlap = $('<div class="canvas-overlap canvas-multiplecontentpicker-menu"><div class="canvas-content-menu-container"></div><div class="canvas-overlap-footer"><a href="#">Cancel</a></div></div>').hide();

                $('body').append(overlap.fadeIn());

                $('.canvas-overlap').on('click', '.canvas-overlap-footer a', function (e) {

                    e.preventDefault();

                    $('.canvas-overlap').fadeOut(function () {

                        $(this).remove();

                    });

                });

                app.helpers.loader.start();

                $.ajax({
                    type: "POST",
                    url: app.params.apiUrl + '/GetContent',
                    data: {
                        pageId: 0
                    },
                    success: function (json) {

                        app.helpers.loader.stop();

                        var list = $('<ul class="canvas-Content-Tree"></ul>');

                        $(json).each(function (index, item) {
                            list.append('<li class="' + (item.hasChildren ? 'canvas-hasChildren' : 'canvas-hasNoChildren') + '">' + (item.hasChildren ? '<div class="canvas-plus"></div>' : '') + '<a href="#" data-contentId=' + item.id + '>' + item.name + '</a></li>');
                        });

                        overlap.find('.canvas-content-menu-container').append(list);

                        $('body').append(overlap.fadeIn());

                    }
                });
            }

        },

        mediaPicker: {

            params: {
                $container: ''
            },

            init: function (editor, content) {
                var m = this;

                $('.canvas-overlap').remove();

                var overlap = $('<div class="canvas-overlap"><div class="canvas-media-menu-header"><a href="#" class="canvas-window-close">Close window</a><ul class="canvas-media-breadcrumb"></ul></div><div class="canvas-media-menu-container"></div><div class="canvas-overlap-footer"><a href="#">Cancel</a></div></div>').hide();

                $('body').append(overlap.fadeIn());

                $('.canvas-overlap').on('click', '.canvas-media-folder a', function (e) {

                    var me = $(this);

                    e.preventDefault();

                    var img = me.parent().find('i');
                    var text = '<p>' + me.parent().text() + '</p>';
                    $('.canvas-image-wrapper i,.canvas-image-wrapper img,.canvas-image-wrapper p').remove();

                    m.params.$container.find('.canvas-image-wrapper').append(img).append(text).addClass('canvas-hasFile').attr('data-Id', me.parent().attr('data-Id')).removeClass('canvas-hasImage');
                    m.params.$container.find('input[type=hidden]').val(me.parent().attr('data-Id'));

                    $('.canvas-overlap').fadeOut(function () {

                        $(this).remove();

                    });


                });

                $('.canvas-overlap').on('click', '.canvas-media-folder,.canvas-media-breadcrumb a', function (e) {

                    e.preventDefault();

                    var me = $(this);

                    $('.canvas-media-menu-container').fadeOut(function () {
                        $('.canvas-media-menu-container').html('');

                        m.loadMedia(me.attr('data-Id'));

                    });

                });

                $('.canvas-overlap').on('click', '.canvas-overlap-footer a', function (e) {

                    e.preventDefault();

                    $('.canvas-overlap').fadeOut(function () {

                        $(this).remove();

                    });

                });

                $('.canvas-overlap').on('click', '.canvas-media-image', function () {

                    var me = $(this);

                    var img = me.find('img');

                    if ($('.canvas-content-overlay').length > 0) {

                        var data = {
                            alt: '',
                            src: img.attr('data-src'),
                            rel: '',
                            id: '__mcenew'
                        };

                        editor.insertContent('<div class="img-wrapper">' + editor.dom.createHTML('img', data) + '</div>');

                        window.setTimeout(function () {

                            var imgElm = editor.dom.get('__mcenew');
                            var size = editor.dom.getSize(imgElm);

                            var newSize = app.modules.media.scaleToMaxSize(800, size.w, size.h);

                            editor.dom.setAttrib(imgElm, 'id', null);

                            var src = data.src + "?width=" + newSize.width + "&height=" + newSize.height;
                            editor.dom.setAttrib(imgElm, 'src', src);
                            editor.dom.setAttrib(imgElm, 'data-mce-src', src);

                        }, 500);

                    } else {


                        m.params.$container.find('.canvas-image-wrapper i,.canvas-image-wrapper img,.canvas-image-wrapper p').remove();

                        m.params.$container.find('.canvas-image-wrapper').append(img).addClass('canvas-hasImage').attr('data-Id', me.attr('data-Id')).removeClass('canvas-hasFile');
                        m.params.$container.find('input[type=hidden]').val(me.attr('data-Id'));

                    }

                    $('.canvas-overlap').fadeOut(function () {

                        $(this).remove();

                    });

                });

                $('.canvas-overlap').on('click', '.canvas-media-file', function () {

                    var me = $(this);

                    var img = me.find('i');
                    var text = '<p>' + me.text() + '</p>';
                    $('.canvas-image-wrapper i,.canvas-image-wrapper img,.canvas-image-wrapper p').remove();

                    if ($('.canvas-content-overlay').length > 0) {

                        var href = me.attr('data-src');

                        if (content != '') {
                            editor.selection.setContent('<a href="' + href + '">' + content + '</strong>');
                        } else {
                            editor.insertContent(editor.dom.createHTML('a', { href: href }, me.text()));
                        }

                    }
                    else {
                        m.params.$container.find('.canvas-image-wrapper').append(img).append(text).addClass('canvas-hasFile').attr('data-Id', me.attr('data-Id')).removeClass('canvas-hasImage');
                        m.params.$container.find('input[type=hidden]').val(me.attr('data-Id'));
                    }


                    $('.canvas-overlap').fadeOut(function () {

                        $(this).remove();

                    });

                });
            },

            loadMedia: function (parentId) {

                $.ajax({
                    type: "POST",
                    url: app.params.apiUrl + '/GetMedia?id=' + parentId,
                    success: function (json) {

                        $('.canvas-media-breadcrumb').html('<li><a href="#" data-Id="-1">Media</a></li>');

                        $(json.history).each(function (i, v) {

                            $('.canvas-media-breadcrumb').append('<li><a href="#" data-Id="' + v.id + '">' + v.name + '</a></li>');

                        });

                        $(json.items).each(function (i, v) {

                            var item = "";

                            if (v.contentType == '1031') {
                                item = '<div class="canvas-media-folder canvas-media-item" data-Id="' + v.id + '">' +
                                    '<a href="#" class="canvas-icon-add"></a>' +
                                    '<i class="canvas-icon-folder"></i> ' + v.text + '</div>';
                            }

                            if (v.contentType == '1032') {

                                var src = v.src;

                                var thumbSplit = src.split('.');

                                var thumbSrc = src.replace('.' + thumbSplit[thumbSplit.length - 1], '_thumb.' + thumbSplit[thumbSplit.length - 1]);

                                var thumbPath = app.params.version() == '6' ? thumbSrc : '/umbraco/backoffice/UmbracoApi/Images/GetBigThumbnail?originalImagePath=' + v.src;

                                item = '<div class="canvas-media-image canvas-media-item" data-Id="' + v.id + '"><img src="' + thumbPath + '" alt="' + v.text + '" title="' + v.text + '" data-src="' + v.src + '"/></div>';
                            }

                            if (v.contentType == '1033') {
                                item = '<div class="canvas-media-file canvas-media-item" data-Id="' + v.id + '" data-src="' + v.src + '"><i class="canvas-icon-document"></i> ' + v.text + '</div>';
                            }

                            $('.canvas-media-menu-container').append(item).fadeIn();

                        });

                    },
                    error: function (a, b, c) {

                    }
                });

            },

            scaleToMaxSize: function (maxSize, width, height) {
                var retval = { width: width, height: height };

                var maxWidth = maxSize; // Max width for the image
                var maxHeight = maxSize;    // Max height for the image
                var ratio = 0;  // Used for aspect ratio

                        // Check if the current width is larger than the max
                if (width > maxWidth) {
                    ratio = maxWidth / width;   // get ratio for scaling image

                    retval.width = maxWidth;
                    retval.height = height * ratio;

                    height = height * ratio;    // Reset height to match scaled image
                    width = width * ratio;    // Reset width to match scaled image
                }

                        // Check if current height is larger than max
                if (height > maxHeight) {
                    ratio = maxHeight / height; // get ratio for scaling image

                    retval.height = maxHeight;
                    retval.width = width * ratio;
                    width = width * ratio;    // Reset width to match scaled image
                }

                return retval;
            },

            canvasResizeImage: function(editor) {
            
                var me = this;

                editor.on('mouseup', function (e) {

                    var mySelection = editor.selection.getNode();

                    if (mySelection.tagName == "IMG") {

                        if (mySelection.src.indexOf("width") != -1) {

                            setTimeout(
                                me.fixSize(mySelection,editor),
                                100
                            );
                        }
                    }

                });

            },

            fixSize: function (el,editor) {
                newWidth = el.width;
                newHeight = el.height;
                newUrl = el.src.replace(/width=[0-9]+/,"width="+newWidth);
                newUrl = newUrl.replace(/height=[0-9]+/,"height="+newHeight);

                editor.dom.setAttrib(el, 'src', newUrl);
            }

        }

    };

    // Helpers
    // -----------
    app.helpers = {

        init: function () {

            this.isPagePublished();

            $('body').on('click', '.canvas-window-close', function (e) {
                e.preventDefault();

                $(this).closest('.canvas-window').removeClass('canvas-open');
                $(this).closest('.canvas-overlap').hide();
            });

        },

        isPagePublished: function () {

            var me = this;

            $.ajax({
                type: "POST",
                url: app.params.apiUrl + '/IsPagePublished?pageId=' + app.params.pageId(),
                success: function (data) {

                    if (data.isPublished == false) {

                        me.RenderPublish();
                    }

                },
                error: function (a, b, c) {

                }
            });

        },

        RenderPublish: function () {

            if ($('.canvas-item-publish').length <= 0) {

                $('.canvas-bar .canvas-right').append('<a href="#" class="canvas-item canvas-border-left canvas-item-cancel canvasicon-cross2"></a><a href="#" class="canvas-item canvas-border-left canvas-item-publish canvasicon-floppy-disk"></a>');

                $('body').on('click', '.canvas-item-publish', function (e) {
                    e.preventDefault();

                    var me = $(this);

                    me.attr('disabled', 'disabled');

                    app.helpers.loader.start();

                    $.ajax({
                        type: "POST",
                        url: app.params.apiUrl + '/PublishPage?pageId=' + app.params.pageId(),
                        success: function (json) {

                            me.removeAttr('disabled');

                            app.helpers.loader.stop();

                            $('.canvas-item-cancel, .canvas-item-publish').fadeOut(function () {
                                $(this).remove();
                            });
                        }
                    });

                });

                $('body').on('click', '.canvas-item-cancel', function (e) {
                    e.preventDefault();

                    var me = $(this);

                    me.attr('disabled', 'disabled');

                    app.helpers.loader.start();

                    $.ajax({
                        type: "POST",
                        url: app.params.apiUrl + '/Cancel?pageId=' + app.params.pageId(),
                        success: function (json) {

                            me.removeAttr('disabled');

                            location.reload();
                        },
                        error: function (a, b, c) {

                        }
                    });

                });

            }

        },

        loader: {

            start: function () {
                if ($('.canvas-progress-loader').length <= 0) {
                    $('body').append('<div class="canvas-progress-loader"></div>');
                }
            },

            stop: function () {
                $('.canvas-progress-loader').fadeOut(function () {
                    $(this).remove();
                });
            }
        },

        getQueryString: function (target) {
            if (target == 'parent') {
                var queryStringKeyValue = window.parent.location.search.replace('?', '').split('&');
            }
            else {
                var queryStringKeyValue = window.location.search.replace('?', '').split('&');
            }

            var qsJsonObject = {};
            if (queryStringKeyValue != '') {
                for (i = 0; i < queryStringKeyValue.length; i++) {
                    qsJsonObject[queryStringKeyValue[i].split('=')[0]] = queryStringKeyValue[i].split('=')[1];
                }
            }
            return qsJsonObject;
        }

    };

    // initializer
    // -----------
    app.initialize = (function () {
        app.bar.init();
        //app.controlMenu.init();
        app.pickers.init();
        app.modules.init();
        app.helpers.init();

        $('body').append('<div class="canvas-window"></div>')

        // globalize scope
        CanvasApp = app;

    }());
};