// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"geojson_files/parks.geojson":[function(require,module,exports) {
module.exports = "/parks.c473af01.geojson";
},{}],"geojson_files/demographics.geojson":[function(require,module,exports) {
module.exports = "/demographics.2c5278af.geojson";
},{}],"geojson_files/allmaps.geojson":[function(require,module,exports) {
module.exports = "/allmaps.20dbe0af.geojson";
},{}],"geojson_files/pm25.geojson":[function(require,module,exports) {
module.exports = "/pm25.1e5fcb37.geojson";
},{}],"index.js":[function(require,module,exports) {
"use strict";

var _parks = _interopRequireDefault(require("./geojson_files/parks.geojson"));

var _demographics = _interopRequireDefault(require("./geojson_files/demographics.geojson"));

var _allmaps = _interopRequireDefault(require("./geojson_files/allmaps.geojson"));

var _pm = _interopRequireDefault(require("./geojson_files/pm25.geojson"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var w1;
var w2;
var w3;
var w4;
var w5;
var w6;
var w7;
var w8;
var w9;
var geojsonAll; // helpers

function getSelectedTab() {
  var radios = document.getElementsByName('options');

  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      return radios[i].id;
    }
  }
}

;

function resetWeights() {
  var weightElem = document.getElementsByClassName('form-control');

  for (var i = 0, length = weightElem.length; i < length; i++) {
    weightElem[i].value = '1.0';
  }
}

function getWeights(selected) {
  w1 = Number(document.getElementById('w_1').value);
  w2 = Number(document.getElementById('w_2').value);
  w3 = Number(document.getElementById('w_3').value);
  w4 = Number(document.getElementById('w_4').value);
  w5 = Number(document.getElementById('w_5').value);
  w6 = Number(document.getElementById('w_6').value);
  w7 = Number(document.getElementById('w_7').value);
  w8 = Number(document.getElementById('w_8').value);
  w9 = Number(document.getElementById('w_9').value);
  var weights;

  if (selected == "exposure") {
    weights = [w1, w2, w3, w4, w5];
  } else if (selected == "sensitivity") {
    weights = [w1, w2, w3, w4, w5, w6, w7, w8, w9];
  } else {
    weights = [w1, w2];
  }

  var norm = weights.reduce(function (a, b) {
    return a + b;
  }, 0);
  var normWeights = weights.map(function (w) {
    return w / norm;
  });
  return normWeights;
}

function dotProd(vec1, vec2) {
  var acc = 0;

  for (var i = 0; i < vec1.length; i++) {
    acc = acc + vec1[i] * vec2[i];
  }

  return acc;
}

function changeWeights() {
  var selected = getSelectedTab();
  var weights = getWeights(selected);
  mainMap.removeLayer(geojsonAll); // geojsonAll = new L.GeoJSON.AJAX(allmapsUrl, {style: style_exposure});

  if (selected == "exposure") {
    geojsonAll = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_exposure,
      onEachFeature: onEachFeature
    });
  } else if (selected == "sensitivity") {
    geojsonAll = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_sensitivity,
      onEachFeature: onEachFeature
    });
  } else {
    geojsonAll = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_adaptation,
      onEachFeature: onEachFeature
    });
  }

  geojsonAll.addTo(mainMap);
}

function parkStyle(feature) {
  return {
    fillColor: "#2ca25f",
    color: "#777777",
    weight: 1.5,
    opacity: 1,
    fillOpacity: 1
  };
}

;

function getColorLegend(d, palette) {
  var colors = getPalette(palette);
  return d == 1 ? colors[0] : d == 2 ? colors[1] : d == 3 ? colors[2] : d == 4 ? colors[3] : d == 5 ? colors[4] : '#f2f0f7';
}

function getColorExposureIndex(d) {
  return d == '[1.8,2.4]' ? '#FFFFB2' : d == '(2.4,2.8]' ? '#FECC5C' : d == '(2.8,3.2]' ? '#FD8D3C' : d == '(3.2,3.6]' ? '#F03B20' : d == '(3.6,4.4]' ? '#BD0026' : '#f2f0f7';
}

function getMainMapColor(d, palette) {
  var colors = getPalette(palette);
  return d <= 1.5 ? colors[0] : d <= 2.5 ? colors[1] : d <= 3.5 ? colors[2] : d <= 4.5 ? colors[3] : d <= 5 ? colors[4] : '#f2f0f7';
}

function style_empty(feature) {
  return {
    fillColor: getColorLegend(feature.properties.high_hi_hours, "orangeRed"),
    weight: 0,
    opacity: 0,
    color: 'white',
    fillOpacity: 0
  };
}

;

function style_exposure(feature) {
  var weights = getWeights('exposure');
  var values = [feature.properties.heat_days_tmaxtmin, feature.properties.high_temp_streak_longest, feature.properties.high_hi_hours, feature.properties.pm25_concentration, feature.properties.ozone_exceedance];
  return {
    fillColor: getMainMapColor(dotProd(weights, values), "orangeRed"),
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_adaptation(feature) {
  var weights = getWeights('adaptation');
  var values = [feature.properties.median_income_kdollars, feature.properties.percent_park];
  return {
    fillColor: getMainMapColor(dotProd(weights, values), "blueGreen"),
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_sensitivity(feature) {
  var weights = getWeights('sensitivity');
  var values = [feature.properties.perc_children, feature.properties.perc_elderly, feature.properties.perc_nonwhite, feature.properties.perc_poverty, feature.properties.perc_no_hs_diploma, feature.properties.perc_cognitive_disability, feature.properties.perc_ambulatory_disability, feature.properties.asthma_prevalence, feature.properties.cardio_disease_prevalence];
  return {
    fillColor: getMainMapColor(dotProd(weights, values), "bluePurple"),
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_high_hi_hours(feature) {
  return {
    fillColor: getColorLegend(feature.properties.high_hi_hours, "orangeRed"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_high_temp_streak_longest(feature) {
  return {
    fillColor: getColorLegend(feature.properties.high_temp_streak_longest, "orangeRed"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_heat_days_tmaxtmin(feature) {
  return {
    fillColor: getColorLegend(feature.properties.heat_days_tmaxtmin, "orangeRed"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_pm25_concentration(feature) {
  return {
    fillColor: getColorLegend(feature.properties.pm25_concentration, "orangeRed"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_ozone_exceedance(feature) {
  return {
    fillColor: getColorLegend(feature.properties.ozone_exceedance, "orangeRed"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_perc_children(feature) {
  return {
    fillColor: getColorLegend(feature.properties.perc_children, "bluePurple"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_perc_elderly(feature) {
  return {
    fillColor: getColorLegend(feature.properties.perc_elderly, "bluePurple"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_perc_nonwhite(feature) {
  return {
    fillColor: getColorLegend(feature.properties.perc_nonwhite, "bluePurple"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_perc_poverty(feature) {
  return {
    fillColor: getColorLegend(feature.properties.perc_poverty, "bluePurple"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_perc_no_hs_diploma(feature) {
  return {
    fillColor: getColorLegend(feature.properties.perc_no_hs_diploma, "bluePurple"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_perc_cognitive_disability(feature) {
  return {
    fillColor: getColorLegend(feature.properties.perc_cognitive_disability, "bluePurple"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_perc_ambulatory_disability(feature) {
  return {
    fillColor: getColorLegend(feature.properties.perc_ambulatory_disability, "bluePurple"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_asthma_prevalence(feature) {
  return {
    fillColor: getColorLegend(feature.properties.asthma_prevalence, "bluePurple"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_cardio_disease_prevalence(feature) {
  return {
    fillColor: getColorLegend(feature.properties.cardio_disease_prevalence, "bluePurple"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_median_income_kdollars(feature) {
  return {
    fillColor: getColorLegend(feature.properties.median_income_kdollars, "blueGreen"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

;

function style_perc_park(feature) {
  return {
    fillColor: getColorLegend(feature.properties.percent_park, "blueGreen"),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

; // install actions to weights

$("input[class='form-control']").change(changeWeights);
$("#resetView").click(function () {
  mainMap.setView([36.77, -119.78], 11);
  f1_map.setView([36.77, -119.78], 10);
  f2_map.setView([36.77, -119.78], 10);
  f3_map.setView([36.77, -119.78], 10);
  f4_map.setView([36.77, -119.78], 10);
  f5_map.setView([36.77, -119.78], 10);
  f6_map.setView([36.77, -119.78], 10);
  f7_map.setView([36.77, -119.78], 10);
  f8_map.setView([36.77, -119.78], 10);
  f9_map.setView([36.77, -119.78], 10);
});

function getPaletteName() {
  var selected = $('input:radio[name="options"]:checked').attr('id');
  return selected == "exposure" ? "orangeRed" : selected == "sensitivity" ? "bluePurple" : "blueGreen";
}

function getPalette(palette) {
  return palette == 'orangeRed' ? ['#FFFFB2', '#FECC5C', '#FD8D3C', '#F03B20', '#BD0026'] : palette == 'bluePurple' ? ['#EDF8FB', '#B3CDE3', '#8C96C6', '#8856A7', '#810F7C'] : ['#EDF8FB', '#B2E2E2', '#66C2A4', '#2CA25F', '#006D2C'];
}

$(document).on('change', 'input:radio[name="options"]', function (event) {
  if ($("#exposure").is(":checked")) {
    console.log("exposure checked");
    $('#titletext').text("Exposure");
    $('#factor1').text("Overheat Days");
    $('#factor2').text("Longest Overheat-day Streak");
    $('#factor3').text("High HI Hours");
    $('#factor4').text("PM2.5 Concentration");
    $('#factor5').text("Ozone Exceedance");
    $('#factor6').text("");
    $('#factor7').text("");
    $('#factor8').text("");
    $('#factor9').text("");
    $('#f3').show();
    $('#f4').show();
    $('#f5').show();
    $('#f6').hide();
    $('#f7').hide();
    $('#f8').hide();
    $('#f9').hide();
    resetWeights();
    $('#w_3').show();
    $('#w_4').show();
    $('#w_5').show();
    $('#w_6').hide();
    $('#w_7').hide();
    $('#w_8').hide();
    $('#w_9').hide();
    mainMap.removeLayer(geojsonAll);
    geojsonAll = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_exposure,
      onEachFeature: onEachFeature
    }).addTo(mainMap); // update legend

    mainMap.removeControl(legend);
    legend = new L.control({
      position: 'bottomright'
    });

    legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [1, 1.5, 2.5, 3.5, 4.5],
          labels = [];
      var palette = getPaletteName();
      console.log("palette name");
      console.log(palette); // loop through our density intervals and generate a label with a colored square for each interval

      for (var i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + getColorLegend(i + 1, palette) + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
    };

    legend.addTo(mainMap);
    f1_map.removeLayer(f1Geojson);
    f1Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_heat_days_tmaxtmin
    }).addTo(f1_map);
    f2_map.removeLayer(f2Geojson);
    f2Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_high_temp_streak_longest
    }).addTo(f2_map);
    f3_map.removeLayer(f3Geojson);
    f3Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_high_hi_hours
    }).addTo(f3_map);
    f4_map.removeLayer(f4Geojson);
    f4Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_pm25_concentration
    }).addTo(f4_map);
    f5_map.removeLayer(f5Geojson);
    f5Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_ozone_exceedance
    }).addTo(f5_map);
  } else if ($("#sensitivity").is(":checked")) {
    console.log("sensitivity checked");
    $('#titletext').text("Sensitivity");
    $('#factor1').text("Percent Children");
    $('#factor2').text("Percent Elderly");
    $('#factor3').text("Percent Non-white");
    $('#factor4').text("Percent in Poverty");
    $('#factor5').text("Percent Low Education");
    $('#factor6').text("Percent Cognitive Disability");
    $('#factor7').text("Percent Ambulatory Disability");
    $('#factor8').text("Percent Asthma ER visits / 10000 population");
    $('#factor9').text("Heart Attach per 1000 population");
    $('#f3').show();
    $('#f4').show();
    $('#f5').show();
    $('#f6').show();
    $('#f7').show();
    $('#f8').show();
    $('#f9').show();
    resetWeights();
    $('#w_3').show();
    $('#w_4').show();
    $('#w_5').show();
    $('#w_6').show();
    $('#w_7').show();
    $('#w_8').show();
    $('#w_9').show();
    mainMap.removeLayer(geojsonAll);
    geojsonAll = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_sensitivity,
      onEachFeature: onEachFeature
    }).addTo(mainMap);
    mainMap.removeControl(legend);
    legend = new L.control({
      position: 'bottomright'
    });

    legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [1, 1.5, 2.5, 3.5, 4.5],
          labels = [];
      var palette = getPaletteName();
      console.log("palette name");
      console.log(palette); // loop through our density intervals and generate a label with a colored square for each interval

      for (var i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + getColorLegend(i + 1, palette) + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
    };

    legend.addTo(mainMap);
    f1_map.removeLayer(f1Geojson);
    f1Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_perc_children
    }).addTo(f1_map);
    f2_map.removeLayer(f2Geojson);
    f2Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_perc_elderly
    }).addTo(f2_map);
    f3_map.removeLayer(f3Geojson);
    f3Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_perc_nonwhite
    }).addTo(f3_map);
    f4_map.removeLayer(f4Geojson);
    f4Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_perc_poverty
    }).addTo(f4_map);
    f5_map.removeLayer(f5Geojson);
    f5Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_perc_no_hs_diploma
    }).addTo(f5_map);
    f6_map.removeLayer(f6Geojson);
    f6Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_perc_cognitive_disability
    }).addTo(f6_map);
    f7_map.removeLayer(f7Geojson);
    f7Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_perc_ambulatory_disability
    }).addTo(f7_map);
    f8_map.removeLayer(f8Geojson);
    f8Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_asthma_prevalence
    }).addTo(f8_map);
    f9_map.removeLayer(f9Geojson);
    f9Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_cardio_disease_prevalence
    }).addTo(f9_map);
  } else {
    console.log("adaptation checked");
    $('#titletext').text("Adaptation");
    $('#factor1').text("Income");
    $('#factor2').text("Percent Area of Parks");
    $('#factor3').text("");
    $('#factor4').text("");
    $('#factor5').text("");
    $('#factor6').text("");
    $('#factor7').text("");
    $('#factor8').text("");
    $('#factor9').text("");
    $('#f3').hide();
    $('#f4').hide();
    $('#f5').hide();
    $('#f6').hide();
    $('#f7').hide();
    $('#f8').hide();
    $('#f9').hide();
    $('#w_3').hide();
    $('#w_4').hide();
    $('#w_5').hide();
    $('#w_6').hide();
    $('#w_7').hide();
    $('#w_8').hide();
    $('#w_9').hide();
    mainMap.removeLayer(geojsonAll);
    geojsonAll = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_adaptation,
      onEachFeature: onEachFeature
    }).addTo(mainMap); // update legend

    mainMap.removeControl(legend);
    legend = new L.control({
      position: 'bottomright'
    });

    legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [1, 1.5, 2.5, 3.5, 4.5],
          labels = [];
      var palette = getPaletteName();
      console.log("palette name");
      console.log(palette); // loop through our density intervals and generate a label with a colored square for each interval

      for (var i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + getColorLegend(i + 1, palette) + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
    };

    legend.addTo(mainMap);
    f1_map.removeLayer(f1Geojson);
    f1Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_median_income_kdollars
    }).addTo(f1_map);
    f2_map.removeLayer(f2Geojson);
    f2Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
      style: style_perc_park
    }).addTo(f2_map);
  }
});
$('#w_6').hide();
$('#w_7').hide();
$('#w_8').hide();
$('#w_9').hide(); // heat days map

var f1_map = L.map('f1').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(f1_map);
var f1Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
  style: style_heat_days_tmaxtmin // onEachFeature: onEachFeature,

}).addTo(f1_map); // heat days map

var f2_map = L.map('f2').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(f2_map);
var f2Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
  style: style_high_temp_streak_longest // onEachFeature: onEachFeature,

}).addTo(f2_map); // high HI map

var f3_map = L.map('f3').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(f3_map);
var f3Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
  style: style_high_hi_hours // onEachFeature: onEachFeature,

}).addTo(f3_map); // pm2.5 map

var f4_map = L.map('f4').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(f4_map);
var f4Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
  style: style_pm25_concentration // onEachFeature: onEachFeature,

}).addTo(f4_map); //ozone map

var f5_map = L.map('f5').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(f5_map);
var f5Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
  style: style_ozone_exceedance // onEachFeature: onEachFeature,

}).addTo(f5_map); // place-holders

var f6_map = L.map('f6').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(f6_map);
var f6Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
  style: style_empty // onEachFeature: onEachFeature,

}).addTo(f6_map);
var f7_map = L.map('f7').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(f7_map);
var f7Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
  style: style_empty // onEachFeature: onEachFeature,

}).addTo(f7_map);
var f8_map = L.map('f8').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(f8_map);
var f8Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
  style: style_empty // onEachFeature: onEachFeature,

}).addTo(f8_map);
var f9_map = L.map('f9').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(f9_map);
var f9Geojson = new L.GeoJSON.AJAX(_allmaps.default, {
  style: style_empty // onEachFeature: onEachFeature,

}).addTo(f9_map);
$('#f6').hide();
$('#f7').hide();
$('#f8').hide();
$('#f9').hide(); // exposure map

var mainMap = L.map('mainview').setView([36.77, -119.78], 11);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(mainMap);
geojsonAll = new L.GeoJSON.AJAX(_allmaps.default, {
  style: style_exposure,
  onEachFeature: onEachFeature
});
geojsonAll.addTo(mainMap);
var info = L.control();

info.onAdd = function (mainMap) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"

  this.update();
  return this._div;
}; // method that we will use to update the control based on feature properties passed


info.update = function (props) {
  var selected = getSelectedTab();
  var weights = getWeights(selected);
  var values;
  var labelstring; // console.log(props.heat_days_tmaxtmin);

  if (props) {
    if (selected == "exposure") {
      values = [props.heat_days_tmaxtmin, props.high_temp_streak_longest, props.high_hi_hours, props.pm25_concentration, props.ozone_exceedance];
      labelstring = '# overheat days: ' + props.heat_days_tmaxtmin + '<br/>' + 'longest overheat-day streak: ' + props.high_temp_streak_longest + '<br/>' + '# hours with high HI: ' + props.high_hi_hours + '<br/>' + 'PM2.5 concentration: ' + props.pm25_concentration + '<br/>' + 'Ozone exceedance: ' + props.ozone_exceedance + '<br/>';
    } else if (selected == "sensitivity") {
      values = [props.perc_children, props.perc_elderly, props.perc_nonwhite, props.perc_poverty, props.perc_no_hs_diploma, props.perc_cognitive_disability, props.perc_ambulatory_disability, props.asthma_prevalence, props.cardio_disease_prevalence];
      labelstring = '% children: ' + props.perc_children + '<br/>' + '% elderly: ' + props.perc_elderly + '<br/>' + '% non-white: ' + props.perc_nonwhite + '<br/>' + '% in poverty: ' + props.perc_poverty + '<br/>' + '% low education: ' + props.perc_no_hs_diploma + '<br/>' + '% with cognitive disability: ' + props.perc_cognitive_disability + '<br/>' + '% with ambulatory disability: ' + props.perc_ambulatory_disability + '<br/>' + 'Athsma ER visits/10000 people: ' + props.asthma_prevalence + '<br/>' + 'Heart attack /1000 people: ' + props.cardio_disease_prevalence + '<br/>';
    } else {
      values = [props.median_income_kdollars, props.percent_park];
      labelstring = 'median income: ' + props.median_income_kdollars + '<br/>' + '% area with parks: ' + props.percent_park + '<br/>';
    }
  } else {
    values = [];
    labelstring = '<b>';
  }

  var titlestring = $('#titletext').text();
  this._div.innerHTML = props ? '<h4>' + $('#titletext').text() + '</h4>' + '<b>' + props.GEOID10 + '</b><br />' + 'overall ' + $('#titletext').text() + ': ' + dotProd(weights, values).toFixed(1) + '<br/>' + '<br/>' + 'class label of individual factors' + '<br/>' + labelstring : 'Hover over a census tract';
};

info.addTo(mainMap);

function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  ;
  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojsonAll.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

console.log();
var legend = L.control({
  position: 'bottomright'
});

legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend'),
      grades = [1, 1.5, 2.5, 3.5, 4.5],
      labels = [];
  var palette = getPaletteName(); // loop through our density intervals and generate a label with a colored square for each interval

  for (var i = 0; i < grades.length; i++) {
    div.innerHTML += '<i style="background:' + getColorLegend(i + 1, palette) + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

  return div;
};

legend.addTo(mainMap);
},{"./geojson_files/parks.geojson":"geojson_files/parks.geojson","./geojson_files/demographics.geojson":"geojson_files/demographics.geojson","./geojson_files/allmaps.geojson":"geojson_files/allmaps.geojson","./geojson_files/pm25.geojson":"geojson_files/pm25.geojson"}],"../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "65461" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/mapapp.e31bb0bc.js.map