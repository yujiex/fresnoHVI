import parkUrl from './geojson_files/parks.geojson';
import demographicsUrl from './geojson_files/demographics.geojson';
import allmapsUrl from './geojson_files/allmaps.geojson';
import testurl from './geojson_files/pm25.geojson';

var w1;
var w2;
var w3;
var w4;
var w5;
var geojsonAll;
// helpers

function changeWeights() {
    w1 = Number(document.getElementById('w_1').value);
    w2 = Number(document.getElementById('w_2').value);
    w3 = Number(document.getElementById('w_3').value);
    w4 = Number(document.getElementById('w_4').value);
    w5 = Number(document.getElementById('w_5').value);
    var norm = w1 + w2 + w3 + w4 + w5;
    console.log(w1);
    console.log(w2);
    console.log(w3);
    console.log(w4);
    console.log(w5);
    exposureMap.removeLayer(geojsonAll);
    geojsonAll = new L.GeoJSON.AJAX(allmapsUrl, {style: style_exposure,
                                                     onEachFeature: onEachFeature,
                                                    });
    geojsonAll.addTo(exposureMap);
}

function parkStyle(feature) {
    return {
        fillColor: "#2ca25f",
        color: "#777777",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 1,
    };
};

function stylePopulation(feature) {
    return {
        fillColor: getColorPopulation(feature.properties.population_density),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
};

function getColorExposure(d) {
    return d == 1 ? '#FFFFB2' :
        d == 2 ? '#FECC5C' :
        d == 3 ? '#FD8D3C' :
        d == 4 ? '#F03B20' :
        d == 5 ? '#BD0026' :
        '#f2f0f7';
}

function getColorExposureIndex(d) {
    return d == '[1.8,2.4]' ? '#FFFFB2' :
        d == '(2.4,2.8]' ? '#FECC5C' :
        d == '(2.8,3.2]' ? '#FD8D3C' :
        d == '(3.2,3.6]' ? '#F03B20' :
        d == '(3.6,4.4]' ? '#BD0026' :
        '#f2f0f7';
}

function getIntExposure(d) {
    return d <= 1.5 ? '#FFFFB2' :
        d <= 2.5 ? '#FECC5C' :
        d <= 3.5 ? '#FD8D3C' :
        d <= 4.5 ? '#F03B20' :
        d <= 5 ? '#BD0026' :
        '#f2f0f7';
}

function style_exposure(feature) {
    w1 = Number(document.getElementById('w_1').value);
    w2 = Number(document.getElementById('w_2').value);
    w3 = Number(document.getElementById('w_3').value);
    w4 = Number(document.getElementById('w_4').value);
    w5 = Number(document.getElementById('w_5').value);
    var norm = w1 + w2 + w3 + w4 + w5;
    return {
        // fillColor: getColorExposureIndex(feature.properties.overall_exposure),
        fillColor: getIntExposure(
            (w1 / norm * feature.properties.heat_days_tmaxtmin +
             w2 / norm * feature.properties.high_temp_streak_longest +
             w3 / norm * feature.properties.high_hi_hours +
             w4 / norm * feature.properties.pm25_concentration +
             w5 / norm * feature.properties.ozone_exceedance)
        ),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_high_hi_hours(feature) {
    return {
        fillColor: getColorExposure(feature.properties.high_hi_hours),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function  style_high_temp_streak_longest(feature) {
    return {
        fillColor: getColorExposure(feature.properties.high_temp_streak_longest),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_heat_days_tmaxtmin(feature) {
    return {
        fillColor: getColorExposure(feature.properties.heat_days_tmaxtmin),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_pm25_concentration(feature) {
    return {
        fillColor: getColorExposure(feature.properties.pm25_concentration),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_ozone_exceedance(feature) {
    return {
        fillColor: getColorExposure(feature.properties.ozone_exceedance),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

// install actions
document.getElementById('w_1').onchange = changeWeights;
document.getElementById('w_2').onchange = changeWeights;
document.getElementById('w_3').onchange = changeWeights;
document.getElementById('w_4').onchange = changeWeights;
document.getElementById('w_5').onchange = changeWeights;

// heat days map
var heat_days_tmaxtminMap = L.map('heat_days_tmaxtmin').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(heat_days_tmaxtminMap);
new L.GeoJSON.AJAX(allmapsUrl, {style: style_heat_days_tmaxtmin
                                                 // onEachFeature: onEachFeature,
                                                }).addTo(heat_days_tmaxtminMap);

// heat days map
var high_temp_streak_longestMap = L.map('high_temp_streak_longest').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(high_temp_streak_longestMap);
new L.GeoJSON.AJAX(allmapsUrl, {style: style_high_temp_streak_longest,
                                // onEachFeature: onEachFeature,
                               }).addTo(high_temp_streak_longestMap);

// high HI map
var high_hi_hoursMap = L.map('high_hi_hours').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(high_hi_hoursMap);
new L.GeoJSON.AJAX(allmapsUrl, {style: style_high_hi_hours,
                                // onEachFeature: onEachFeature,
                               }).addTo(high_hi_hoursMap);

// pm2.5 map
var pm25_concentrationMap = L.map('pm25_concentration').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(pm25_concentrationMap);
new L.GeoJSON.AJAX(allmapsUrl, {style: style_pm25_concentration,
                                // onEachFeature: onEachFeature,
                               }).addTo(pm25_concentrationMap);

//ozone map
var ozone_exceedanceMap = L.map('ozone_exceedance').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(ozone_exceedanceMap);
new L.GeoJSON.AJAX(allmapsUrl, {style: style_ozone_exceedance,
                                // onEachFeature: onEachFeature,
                               }).addTo(ozone_exceedanceMap);


// exposure map
var exposureMap = L.map('mainview').setView([36.77, -119.78], 11);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(exposureMap);

geojsonAll = new L.GeoJSON.AJAX(allmapsUrl, {style: style_exposure,
                                                 onEachFeature: onEachFeature,
                                                });
geojsonAll.addTo(exposureMap);

var info = L.control();

info.onAdd = function (exposureMap) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    w1 = Number(document.getElementById('w_1').value);
    w2 = Number(document.getElementById('w_2').value);
    w3 = Number(document.getElementById('w_3').value);
    w4 = Number(document.getElementById('w_4').value);
    w5 = Number(document.getElementById('w_5').value);
    var norm = w1 + w2 + w3 + w4 + w5;
    console.log(norm);
    this._div.innerHTML = '<h4>Exposure</h4>' +
        (props ? '<b>' +
         props.GEOID10 + '</b><br />' +
         'overall exposure: ' +
         (w1 / norm * props.heat_days_tmaxtmin +
          w2 / norm * props.high_temp_streak_longest +
          w3 / norm * props.high_hi_hours +
          w4 / norm * props.pm25_concentration +
          w5 / norm * props.ozone_exceedance).toFixed(1) + '<br/>' +
         '<br/>' +
         'class label of individual factors' + '<br/>' +
         '# overheat days: ' + props.heat_days_tmaxtmin + '<br/>' +
         'longest overheat-day streak: ' + props.high_temp_streak_longest + '<br/>' +
         '# hours with high HI: ' + props.high_hi_hours + '<br/>' +
         'PM2.5 concentration: ' + props.pm25_concentration + '<br/>' +
         'Ozone exceedance: ' + props.ozone_exceedance + '<br/>'
         : 'Hover over a census tract');
};

info.addTo(exposureMap);

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
    };
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

// fixme: need to update legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [1, 1.5, 2.5, 3.5, 4.5],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColorExposure(i + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(exposureMap);
