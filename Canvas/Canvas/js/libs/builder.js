
if (!window.jQuery) {

    (function () {
        // Load the script
        var script = document.createElement("SCRIPT");
        script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js';
        script.type = 'text/javascript';
        document.getElementsByTagName("head")[0].appendChild(script);

        // Poll for jQuery to come into existance
        var checkReady = function (callback) {
            if (window.jQuery) {
                callback(jQuery);
            }
            else {
                window.setTimeout(function () { checkReady(callback); }, 100);
            }
        };

        // Start polling...
        checkReady(function ($) {

            CanvasLoadDependencies();

        });
    })();

} else {
    CanvasLoadDependencies();
};

function CanvasLoadDependencies() {
    $.when(
        $.getScript("/umbraco/canvas/js/sortable.js"),
        $.getScript("/Umbraco/lib/tinymce/tinymce.min.js", function () {
            tinymce.dom.Event.domLoaded = true;
        }),
        $.getScript("/Umbraco/lib/codemirror/lib/codemirror.js"),
        $.getScript("/umbraco/canvas/js/app.min.js"),
        $.Deferred(function (deferred) {
            $(deferred.resolve);
        })
    ).done(function () {

        CanvasApp();

    });
}

window.tinyMCEPreInit = {
    base: '/Umbraco/lib/tinymce/',
    suffix: '.min',
    query: ''
};



