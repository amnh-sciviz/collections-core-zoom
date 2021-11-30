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

var App = (function() {

  function App(config) {
    var defaults = {
      el: '#app',
      here: "trilobites",
      hereColor: "#9a3044",
      mediaArrays: {},
      data: {},
      zoomDuration: 2000,
      packPadding: 12,
      auto: false
    };
    this.opt = _.extend({}, defaults, queryParams(), config);
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

  function queryParams(){
    if (location.search.length) {
      var search = location.search.substring(1);
      return JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) });
    }
    return {};
  };

  function formatNumber(v){
    if (isNaN(v)) return v;
    return v.toLocaleString();
  }

  function toIdString(text){
    text = ""+text;
    return text.replace(/[\W]+/g,"_");
  }

  App.prototype.init = function(){
    this.loadHere();
    console.log(this.opt.data);
    var data = this.loadData(this.opt.data)
    console.log('Loaded data', data);
    this.loadDataCircles(data);
  };

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
    var view;
    var startingDepth = 1;
    var hereColor = this.opt.hereColor;
    var $pathContainer = $('#current-path');

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

    var dotRadius = 2;
    var dotMargin = 1;
    var patternWidth = dotRadius * 2 * 2 + dotMargin * 2;
    var dots = filterDef.append("pattern")
                .attr("id", "dots")
                .attr("patternUnits", "userSpaceOnUse")
                .attr("width", ""+patternWidth)
                .attr("height", ""+patternWidth);

    dots.append("rect").attr("width", ""+patternWidth).attr("height", ""+patternWidth).attr("x", "0").attr("y", "0").attr("fill", "#548e84");
    dots.append("circle").attr("r", ""+dotRadius).attr("cx", ""+dotRadius).attr("cy", ""+dotRadius).attr("fill", "#74d7ca");
    dots.append("circle").attr("r", ""+dotRadius).attr("cx", ""+(dotRadius*3+dotMargin)).attr("cy", ""+dotRadius).attr("fill", "#74d7ca");
    dots.append("circle").attr("r", ""+dotRadius).attr("cx", "0").attr("cy", ""+(dotRadius*3+dotMargin)).attr("fill", "#74d7ca");
    dots.append("circle").attr("r", ""+dotRadius).attr("cx", ""+(dotRadius*2+dotMargin)).attr("cy", ""+(dotRadius*3+dotMargin)).attr("fill", "#74d7ca");
    dots.append("circle").attr("r", ""+dotRadius).attr("cx", ""+patternWidth).attr("cy", ""+(dotRadius*3+dotMargin)).attr("fill", "#74d7ca");

    var root = d3.pack()
        .size([width, height])
        .padding(this.opt.packPadding)
      (d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value));
    var focus = root;
    var startingNode = _.find(root.descendants(), function(d){ return d.depth === startingDepth; }) || root;

    var color = d3.scaleLinear()
        .domain([0, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    function isNodeValid(d) {
      var delta = Math.abs(d.depth - focus.depth);
      return d !== root && delta === 1 && focus !== d && !d.data.isHidden;
    }

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
          else if (d.children && !d.data.isLeaf) fillColor = color(d.depth);
          return fillColor;
        })
        .attr("pointer-events", d => isNodeValid(d) ? null : "none")
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
          isNodeValid(d) && (zoom(e, d), e.stopPropagation());
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

    function zoomTo(v) {
      var k = width / v[2];
      view = v;

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

    function isLabelVisible(d){
      return d.parent === focus || d.data.isHere || d === focus && (!d.children || d.data.isLeaf) || d.depth===1 && d === focus;
    }

    function renderNodePath(node) {
      var $prev = $pathContainer.clone();
      $pathContainer.parent().append($prev);
      $prev.fadeOut(_this.opt.zoomDuration, function(){
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
      $pathContainer.fadeIn(_this.opt.zoomDuration);
    }

    function zoom(event, toNode) {
      focus = toNode;
      var transition = svg.transition()
          .duration(_this.opt.zoomDuration)
          .tween("zoom", d => {
            const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
            return t => zoomTo(i(t));
          });
      label
        .filter(function(d) { return isLabelVisible(d) || this.style.display === "inline"; })
        .transition(transition)
          .style("fill-opacity", d => isLabelVisible(d) ? 1 : 0)
          .on("start", function(d) { if (isLabelVisible(d)) this.style.display = "inline"; })
          .on("end", function(d) { if (!isLabelVisible(d)) this.style.display = "none"; });
      node.attr("pointer-events", d => isNodeValid(d) ? null : "none")
      renderNodePath(toNode);
    }

    zoomTo([root.x, root.y, root.r * 2]);
    zoom({}, startingNode);

    function loop(){
      var stepDur = _this.opt.zoomDuration + 1000;
      var nodes = root.descendants();
      var n1 = _.find(nodes, function(d){ return d.data.name == 'AMNH Collections'; });
      var n2 = _.find(nodes, function(d){ return d.data.name == 'Paleontology'; });
      var n3 = _.find(nodes, function(d){ return d.data.name == 'Fossil Invertebrates'; });
      var n4 = _.find(nodes, function(d){ return d.data.name == 'You are here'; });

      Promise.delay(function(){ zoom({}, n2); }, stepDur)
             .delay(function(){ zoom({}, n3); }, stepDur)
             .delay(function(){ zoom({}, n4); }, stepDur)
             .delay(function(){ zoom({}, n3); }, stepDur)
             .delay(function(){ zoom({}, n2); }, stepDur)
             .delay(function(){ zoom({}, n1); }, stepDur)
             .delay(function(){ loop(); }, stepDur)
    };

    if (this.opt.auto) {
      loop();
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

  return App;

})();

var app = new App(config);
