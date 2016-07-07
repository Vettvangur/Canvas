angular.module("umbraco").controller("CanvasEditor.controller", function ($scope, $log, $routeParams, contentResource, contentEditingHelper, angularHelper, notificationsService, $q) {

    var root = $scope.model.value;
    $scope.canvasContent = '';
    $scope.canvasRoots = [];
    $scope.activeTab = '',
    $scope.latestValue = root;
    $scope.idle = false;
    $scope.nodeId = $routeParams.id;
    $scope.url = '/';
    $scope.host = '';
    $scope.pathname = '/';

    getContent();

    $scope.updateTab = function (alias) {

        $scope.activeTab = alias;

        iteriateOverRootAreas(root.Areas);

        return false;
    };

    $scope.isActiveTab = function (alias) {
        
        return alias === $scope.activeTab ? true : false;
    }

    function iteriateOverRootAreas(rootAreas) {
        var i = 0;
        $scope.canvasContent = '';
        $scope.canvasRoots = [];

        for (var key in rootAreas) {

            if (rootAreas.hasOwnProperty(key)) {
                i++;

                var area = rootAreas[key];

                if (area.Controls.length > 0) {
                    
                    if (i == 1 && $scope.activeTab === '') {
                        $scope.activeTab = area.Alias;
                    }

                    $scope.canvasContent += '<article class="canvasRootArea ' + ($scope.activeTab === area.Alias ? "canvasShow" : "") + '">';
                    iteriateOverControls(area.Controls);
                    $scope.canvasContent += '</article>';
                }

                $scope.canvasRoots.push(area.Alias);
            }
        }

    }

    function iteriateOverAreas(areas) {

        for (var key in areas) {

            if (areas.hasOwnProperty(key)) {

                var area = areas[key][0];

                if (typeof area === 'undefined' || area === null) {
                    area = areas[key];
                }

                if (typeof area !== 'undefined') {

                    if (area.Controls.length > 0) {

                        iteriateOverControls(area.Controls);
                    }

                }


            }

        }

    }

    function iteriateOverControls(controls) {

        for (var key in controls) {

            if (controls.hasOwnProperty(key)) {

                var control = controls[key];
                var areas = control.Areas;

                $scope.canvasContent = $scope.canvasContent + renderControl(control);


            }

        }

    }

    function renderControl(control) {

        var content = '';

        if (control.Type == 'Grid') {
            content = renderGrid(control);
        } else if (control.Type == 'Section') {
            content = renderSection(control);
        } else {
            content = renderDefault(control);
        }

        return '<div class="canvas-wrapper" id="' + control.ControlID +'">' + content + "</div>";
    }

    function renderDefault(control) {
        return '<div class="canvas-control">' + control.Type + '</div>';
    }

    function renderGrid(control) {

        var columns = control.Columns;

        var cols = columns.split(';');

        var areas = '<div class="canvas-grid"><h4>Grid</h4>';

        for (var colKey in cols) {

            var col = cols[colKey];

            if (col !== '') {

                var colValues = col.split(':');
                var colSize = colValues[0];

                var area = control.Areas[colKey];
                var areaControls = area.Controls;

                var areaContent = '';

                for (var areaControlKey in areaControls) {

                    if (areaControls.hasOwnProperty(areaControlKey)) {
                        areaContent = areaContent + renderControl(areaControls[areaControlKey]);
                    }

                }

                areaContent === 'Grid Column-' + colSize ? '' : areaContent;

                areas = areas + '<div class="canvas-column canvas-col-' + colSize + '" id="' + area.Alias + '">' + areaContent + '</div>';

            }
            
        }

        areas = areas + "</div>";

        return areas;
    }

    function renderSection(control) {

        var areaContent = '';

        var area = control.Areas[0];
        var areaControls = area.Controls;

        for (var areaControlKey in areaControls) {

            if (areaControls.hasOwnProperty(areaControlKey)) {
                areaContent = areaContent + renderControl(areaControls[areaControlKey]);
            }

        }

        areaContent === 'Section' ? 'Section' : areaContent;

        return '<div class="canvas-section"><h4>Section</h4>' + areaContent + '</div>';
    }

    function getLatestValue() {

        if (!$scope.idle) {
            getContent();
        }
    }

    function getContent() {

        if (typeof $routeParams.id !== 'undefined') {

            contentResource.getById($routeParams.id)
                .then(function (content) {

                    var properties = contentEditingHelper.getAllProps(content);
                    var canvasValue = $scope.GetPropertyValue('canvas', properties);

                    $scope.latestValue = canvasValue;

                    if (content.urls.length > 0) {

                        var href = content.urls[0];

                        var l = document.createElement("a");

                        l.href = href;

                        $scope.url = href;
                        $scope.host = l.origin;
                        $scope.pathname = l.pathname;
                    }

                });

        }


    }

    function updateIdle() {
        $scope.idle = true;
    }

    iteriateOverRootAreas(root.Areas);

    setInterval(getLatestValue, 10000);

    $scope.$on("formSubmitting", function (e) {

        var currentForm = angularHelper.getCurrentForm($scope);

        if (JSON.stringify($scope.latestValue) !== JSON.stringify(root)) {
            notificationsService.warning("Warning",
                "There have been some changes to the content since you opened the node in Umbraco, please reload and try again.");
            currentForm.$setValidity('canvas', false);
        }

    });

    setInterval(updateIdle, 60000);

    var myListener = function () {
        $scope.idle = false;
    };

    document.addEventListener('mousemove', myListener, false);

    $scope.GetPropertyValue = function (alias, properties) {

        var value = getByKey(alias, properties)

        if (value != null) {
            return value.value;
        }

        return '';

    };

    function getByKey(key, data) {
        var found = null;

        for (var i = 0; i < data.length; i++) {
            var element = data[i];

            if (element.alias == key) {
                found = element;
            }
        }

        return found;
    }

});