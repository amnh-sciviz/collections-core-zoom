'use strict';

// utility function for returning a promise that resolves after a delay
function delay(t) {
    return new Promise(function (resolve) {
        setTimeout(resolve, t);
    });
}

Promise.delay = function (fn, t) {
    // fn is an optional argument
    if (!t) {
        t = fn;
        fn = function () {};
    }
    return delay(t).then(fn);
}

Promise.prototype.delay = function (fn, t) {
    // return chained promise
    return this.then(function () {
        return Promise.delay(fn, t);
    });

}

function addStreamStopListener(stream, callback) {
    stream.addEventListener('ended', function() {
        callback();
        callback = function() {};
    }, false);
    stream.addEventListener('inactive', function() {
        callback();
        callback = function() {};
    }, false);
    stream.getTracks().forEach(function(track) {
        track.addEventListener('ended', function() {
            callback();
            callback = function() {};
        }, false);
        track.addEventListener('inactive', function() {
            callback();
            callback = function() {};
        }, false);
    });
}

function invokeGetDisplayMedia(success, error) {
  var displaymediastreamconstraints = {
      video: {
        displaySurface: 'application', // monitor, window, application, browser
        logicalSurface: true,
        cursor: 'never' // never, always, motion
      }
  };

  // above constraints are NOT supported YET
  // that's why overriding them
  displaymediastreamconstraints = {
      video: true
  };

  if(navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
  } else {
      navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
  }
}

function invokeSaveAsDialog(file, fileName) {
    if (!file) {
        throw 'Blob object is required.';
    }

    if (!file.type) {
        try {
            file.type = 'video/webm';
        } catch (e) {}
    }

    var fileExtension = (file.type || 'video/webm').split('/')[1];

    if (fileName && fileName.indexOf('.') !== -1) {
        var splitted = fileName.split('.');
        fileName = splitted[0];
        fileExtension = splitted[1];
    }

    var fileFullName = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + fileExtension;

    if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
        return navigator.msSaveOrOpenBlob(file, fileFullName);
    } else if (typeof navigator.msSaveBlob !== 'undefined') {
        return navigator.msSaveBlob(file, fileFullName);
    }

    var hyperlink = document.createElement('a');
    hyperlink.href = URL.createObjectURL(file);
    hyperlink.download = fileFullName;

    hyperlink.style = 'display:none;opacity:0;color:transparent;';
    (document.body || document.documentElement).appendChild(hyperlink);

    if (typeof hyperlink.click === 'function') {
        hyperlink.click();
    } else {
        hyperlink.target = '_blank';
        hyperlink.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        }));
    }

    URL.revokeObjectURL(hyperlink.href);
}

// https://github.com/muaz-khan/RecordRTC/blob/master/simple-demos/screen-recording.html
function captureScreen(callback) {
    invokeGetDisplayMedia(function(screen) {
        addStreamStopListener(screen, function() {});
        callback(screen);
    }, function(error) {
        console.error(error);
        alert('Unable to capture your screen. Please check console logs.\n' + error);
    });
}

var App = (function() {

  function App(config) {
    var defaults = {
      el: '#app',
      here: "trilobites",
      hereColor: "#9a3044",
      colorPalette: false,
      showPath: false,
      showTitle: true,
      mediaArrays: {},
      data: {},
      zoomDuration: 2000,
      packPadding: 12,
      auto: false,
      loops: -1,
      export: false
    };
    this.opt = _.extend({}, defaults, config, queryParams());
    this.init();
  }

  function addHere(node, mediaArray){
    node.isLeaf = true;

    var value = node.value;
    var hereValue = Math.round(value / 500);
    var diffValue = value - hereValue;

    node.children = [
      {"name": "You are here", "pathName": mediaArray.name, "value": hereValue, "isHere": true, "fillColor": "url(#"+mediaArray.id+")"},
      {"value": diffValue, "isHidden": true}
    ]

    return node;
  }

  function enterFullscreen(element) {
    if (!document.fullscreenElement) {
      element.requestFullscreen();
    }
  }

  function exitFullscreen() {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  function formatNumber(v){
    if (isNaN(v)) return v;
    return v.toLocaleString();
  }

  function getColor(node, colorPalette, colorFunction){
    var fillColor = "white";
    if (colorPalette && colorPalette.length > node.depth) fillColor = colorPalette[node.depth-1];
    else fillColor = colorFunction(node.depth);
    return fillColor;
  }

  function queryParams(){
    if (location.search.length) {
      var search = location.search.substring(1);
      return JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) });
    }
    return {};
  };

  function toIdString(text){
    text = ""+text;
    return text.replace(/[\W]+/g,"_");
  }

  App.prototype.init = function(){
    this.looped = 0;
    this.loops = parseInt(this.opt.loops);
    this.$el = $(this.opt.el);
    this.el = this.$el[0];

    this.loadHere();
    console.log('Config data:', this.opt.data);
    var data = this.loadData(this.opt.data);
    this.loadedData = data;
    console.log('Loaded data:', data);
    this.loadDataCircles(data);
    this.loadListeners();
  };

  App.prototype.export = function(){
    if (!this.recorder || !this.recording) return;

    var _this = this;
    this.recording = false;
    this.recorder.stopRecording(function() {
      var blob = _this.recorder.getBlob();
      exitFullscreen();
      invokeSaveAsDialog(blob, _this.opt.here + '.webm');

    });
  };

  App.prototype.exportStart = function(){
    var _this = this;
    var $button = $('.export');

    captureScreen(function(screen) {

        _this.recorder = RecordRTC(screen, {
            type: 'video'
        });

        enterFullscreen($('body')[0]);
        _this.looped = 0;
        _this.loops = 1;
        $button.removeClass('active');

        setTimeout(function(){
          _this.recorder.startRecording();
          _this.recording = true;
          _this.loop();
        }, 4000);
    });
  };

  App.prototype.isLabelVisible = function(d){
    var focus = this.focus;
    return d.parent === focus || d.data.isHere || d === focus && (!d.children || d.data.isLeaf);
      // || d.depth===1 && d === focus;
  }

  App.prototype.isNodeValid = function(d) {
    var focus = this.focus;
    var root = this.root;
    var delta = Math.abs(d.depth - focus.depth);
    return d !== root && delta === 1 && focus !== d && !d.data.isHidden;
  }

  App.prototype.loadData = function(data){

  var imagesToLoad = {};

    data.children = _.map(data.children, function(dept){
      var subdivisions = dept.children;

      // created value (sum) for department
      if (_.has(dept, 'children')) {
        var sum =  _.reduce(dept.children, function(memo, subdivision){ return memo + subdivision.value; }, 0);
        dept.value = sum;
      }

      if (dept.value) {
        dept.formattedValue = formatNumber(dept.value);
      }

      if (dept.children) {
        dept.children = _.map(dept.children, function(subdivision){
          subdivision.formattedValue = formatNumber(subdivision.value);
          if (subdivision.unit) subdivision.formattedValue += " " + subdivision.unit;
          if (subdivision.image) {
            subdivision.imageId = toIdString(subdivision.image);
            subdivision.fillColor = "url(#"+subdivision.imageId+")";
            imagesToLoad[subdivision.imageId] = subdivision.image;
          }
          return subdivision;
        });
      }

      // dept = _.omit(dept, 'value');

      return dept;
    });

    data.formattedValue = formatNumber(_.reduce(data.children, function(memo, dept){ return memo + dept.value; }, 0));

    data = {
      "name": "root",
      "children": [
        data
      ],
      "imagesToLoad": imagesToLoad
    }

    return data;

  };

  App.prototype.loadDataCircles = function(data){
    var _this = this;
    var $el = $(this.opt.el);
    var width = $el.width();
    var height = $el.height();
    var startingDepth = 1;
    var hereColor = this.opt.hereColor;
    var colorPalette = this.opt.colorPalette;

    if (this.opt.showTitle) $el.addClass('has-title');

    var svg = d3.create("svg")
        .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
        .style("display", "block")
        .style("background", '#000')
        .style("cursor", "pointer");

    var filterDef = svg.append("defs");

    // load media array image
    var pattern = filterDef.append("pattern")
                  .attr("id", this.here.id)
                  .attr("patternContentUnits", "objectBoundingBox")
                  .attr("width", "100%")
                  .attr("height", "100%");
    pattern.append("image")
          .attr("xlink:href", this.here.image)
          .attr("preserveAspectRatio", "none")
          .attr("width", "1")
          .attr("height", "1");

    // load images
    _.each(data.imagesToLoad, function(imagePath, imageId){
      var imagePattern = filterDef.append("pattern")
                  .attr("id", imageId)
                  .attr("patternContentUnits", "objectBoundingBox")
                  .attr("width", "100%")
                  .attr("height", "100%");
      imagePattern.append("image")
        .attr("xlink:href", imagePath)
        .attr("preserveAspectRatio", "none")
        .attr("width", "1")
        .attr("height", "1");
    });

    var root = d3.pack()
        .size([width, height])
        .padding(this.opt.packPadding)
      (d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value));
    var focus = root;
    this.root = root;
    this.focus = focus;
    this.width = width;
    this.svg = svg;
    var startingNode = _.find(root.descendants(), function(d){ return d.depth === startingDepth; }) || root;

    var color = d3.scaleLinear()
        .domain([0, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);
    this.colorFunction = color;

    var node = svg.append("g")
      .selectAll("circle")
      .data(root.descendants().slice(1))
      .join("circle")
        .attr("fill", function(d){
          // if (d.data.name === "Coleoptera") {
          //   console.log(d);
          //   console.log(d.ancestors())
          //   console.log(d.descendants())
          // }
          var fillColor = "white";

          if (d.data.fillColor) fillColor = d.data.fillColor;
          else if (d.children && !d.data.isLeaf) fillColor = getColor(d, colorPalette, color);
          return fillColor;
        })
        .attr("pointer-events", d => this.isNodeValid(d) ? null : "none")
        .attr("id", d => d.data.name ? d.data.name.toLowerCase().replaceAll(' ', '-') : '')
        // .style("fill-opacity", d => d.data.isHidden ? 0 : 1)
        .style("fill-opacity", function(d){
          if (d.data.isHidden) return 0;
          else return 1;
        })
        .style("stroke", function(d){
          if (d.data.isHere) return hereColor;
          else return 'none';
        })
        .on("mouseover", function(e, d) {
          d3.select(this).attr("stroke", "#000");
          d3.select(this).attr("stroke-width", "2");
        })
        .on("mouseout", function(e, d) {
          d3.select(this).attr("stroke", null);
        })
        .on("click", function(e, d){
          _this.isNodeValid(d) && (_this.zoom(e, d), e.stopPropagation());
        });

    var label = svg.append("g")
        .style("font", "16px sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
        .attr("fill", function(d){
          if (d.data.isHere) return hereColor;
          // else if (d.depth===1) return "#3d6a64";
          else return "black";
        })
        .style("fill-opacity", d => d.parent === root && !d.data.isHidden || d.depth===1 ? 1 : 0)
        .style("display", d => d.parent === root && !d.data.isHidden ? "inline" : "none");

    label.append("tspan")
      .text(d => d.data.name || "")
      .style("font-weight", "bold")
      .attr("x", 0)
      .attr("dx", 0)
      .attr("dy", 22);

    label.append("tspan")
      .text(d => d.data.formattedValue || "")
      .attr("x", 0)
      .attr("dx", 0)
      .attr("dy", 22);

    d3.select(this.opt.el).node().appendChild(svg.node());

    this.label = label;
    this.node = node;

    this.zoomTo([root.x, root.y, root.r * 2]);
    this.zoom({}, startingNode);

    if (this.opt.auto) {
      this.loop();
    }

  };

  App.prototype.loadHere = function(){
    var data = this.opt.data;
    var hereKey = this.opt.here;
    var mediaArrays = this.opt.mediaArrays;

    if (!_.has(mediaArrays, hereKey)) {
      alert('Could not find key '+hereKey+' in mediaArrays');
      hereKey = _.first(_.keys(mediaArrays));
    }

    var mediaArray = mediaArrays[hereKey];
    mediaArray.id = hereKey;
    var parentKey = mediaArray.parent;

    _.each(data.children, function(child, i){
      if (child.name === parentKey && !_.has(child, 'children')) {
        var updatedChild = addHere(child, mediaArray);
        data.children[i] = updatedChild;
      } else {
        _.each(child.children, function(gchild, j){
          if (gchild.name === parentKey && !_.has(gchild, 'children')) {
            var updatedChild = addHere(gchild, mediaArray);
            data.children[i].children[j] = updatedChild;
          }
        });
      }
    });

    this.here = mediaArray;
    this.opt.data = data;
  };

  App.prototype.loadListeners = function(){
    if (this.opt.export !== false) {
      $('.export').addClass('active').on('click', (e) => {
        this.exportStart();
      });
    }

    $(window).on('resize', (e) => {
      setTimeout(() => this.reset(), 10);

    });
  };

  App.prototype.loop = function(){
    var _this = this;
    var stepDur = this.opt.zoomDuration + this.opt.restDuration;
    var root = this.root;
    var nodes = root.descendants();
    var here = _.find(nodes, function(d){ return d.data.isHere === true; });

    var n = here;
    var nodePath = [];
    do {
      nodePath.push(n);
      if (n.parent && n.parent.depth >= 1) {
        // also add it to the beginning
        if (n.data.isHere !== true) {
          nodePath.unshift(n);
        }
        n = n.parent;
      }
      else n = false;
    } while (n !== false);

    var promise = false;
    _.each(nodePath, function(n){
      if (promise === false) promise = Promise.delay(function(){ _this.zoom({}, n); }, stepDur);
      else promise = promise.delay(function(){ _this.zoom({}, n); }, stepDur);
    });

    var loops = this.loops;
    if (loops > 0) {
      this.looped += 1;
    }
    if (this.looped < loops || loops <= 0) {
      promise.delay(function(){ _this.loop(); }, stepDur);
    } else if (this.recording) {
      promise.delay(function(){ _this.export(); }, stepDur + this.opt.restDuration);
    }

    // var n1 = _.find(nodes, function(d){ return d.data.name == 'AMNH Collections'; });
    // var n2 = _.find(nodes, function(d){ return d.data.name == 'Paleontology'; });
    // var n3 = _.find(nodes, function(d){ return d.data.name == 'Fossil Invertebrates'; });
    // var n4 = _.find(nodes, function(d){ return d.data.name == 'You are here'; });
    //
    // Promise.delay(function(){ zoom({}, n2); }, stepDur)
    //        .delay(function(){ zoom({}, n3); }, stepDur)
    //        .delay(function(){ zoom({}, n4); }, stepDur)
    //        .delay(function(){ zoom({}, n3); }, stepDur)
    //        .delay(function(){ zoom({}, n2); }, stepDur)
    //        .delay(function(){ zoom({}, n1); }, stepDur)
    //        .delay(function(){ loop(); }, stepDur)
  };

  App.prototype.renderNodePath = function(node) {
    if (!this.opt.showPath) return;

    var $pathContainer = $('#current-path');
    $pathContainer.addClass('active');
    var $prev = $pathContainer.clone();
    $pathContainer.parent().append($prev);
    $prev.fadeOut(this.opt.zoomDuration, function(){
      $(this).remove();
    });
    var nodePath = [];
    var currentNode = node;
    do {
      var name = currentNode.data.pathName ? currentNode.data.pathName : currentNode.data.name;
      nodePath.unshift(name);
      if (currentNode.parent) currentNode = currentNode.parent;
    } while(currentNode.parent);

    var html = _.map(nodePath, function(name){
      return '<div class="node">'+name+'</div>';
    });
    html = html.join('');
    $pathContainer.hide();
    $pathContainer.html(html);
    $pathContainer.fadeIn(this.opt.zoomDuration);
  };

  App.prototype.renderTitle = function(node) {
    if (!this.opt.showTitle) return;

    var _this = this;
    var $title = $('#title');
    var colorPalette = this.opt.colorPalette;
    var color = this.colorFunction;

    $title.fadeOut(this.opt.zoomDuration/2, function(){
      if (node.depth >= 3) return;
      var name = node.data.pathName ? node.data.pathName : node.data.name;
      $(this).html('<strong>'+name+'</strong><br />'+node.data.formattedValue);
      var fillColor = getColor(node, colorPalette, color);
      // $(this).css('color', fillColor);
      $(this).fadeIn(_this.opt.zoomDuration/4);
    });
  };

  App.prototype.reset = function() {
    if (!this.svg) return;
    var $svg = $(this.svg);
    $svg.remove();
    this.loadDataCircles(this.loadedData);
  };

  App.prototype.zoom = function(event, toNode) {
    var _this = this;
    this.focus = toNode;
    var focus = this.focus;
    var view = this.view;
    var svg = this.svg;
    var label = this.label;
    var node = this.node;
    var transition = svg.transition()
        .duration(this.opt.zoomDuration)
        .tween("zoom", d => {
          // const i = d3.interpolateZoom.rho(0)(view, [focus.x, focus.y, focus.r * 2]);
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return t => _this.zoomTo(i(t));
        });
    label
      .filter(function(d) { return _this.isLabelVisible(d) || this.style.display === "inline"; })
      .transition(transition)
        .style("fill-opacity", d => this.isLabelVisible(d) ? 1 : 0)
        .on("start", function(d) { if (_this.isLabelVisible(d)) this.style.display = "inline"; })
        .on("end", function(d) { if (!_this.isLabelVisible(d)) this.style.display = "none"; });
    node.attr("pointer-events", d => this.isNodeValid(d) ? null : "none")
    this.renderNodePath(toNode);
    this.renderTitle(toNode);
  };

  App.prototype.zoomTo = function(v) {
    var width = this.width;
    var k = width / v[2];
    var label = this.label;
    var node = this.node;

    this.view = v;

    label.attr("transform", function(d){
      var x = (d.x - v[0]) * k;
      var y = (d.y - v[1]) * k - 22;
      if (d.data.isHere) {
        var z = Math.max(2, k);
        y = y - z*10;
      } else if (d.depth === 1) y = y - v[1] + k*40;
      return `translate(${x},${y})`;
    });
    node.attr("transform", function(d){
      var x = (d.x - v[0]) * k;
      var y = (d.y - v[1]) * k;
      return `translate(${x},${y})`;
    });
    node.attr("r", d => d.r * k);
  }

  return App;

})();

var app = new App(config);
