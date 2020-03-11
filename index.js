import parkUrl from './geojson_files/parks.geojson';
import demographicsUrl from './geojson_files/demographics.geojson';

function parkStyle(feature) {
    return {
        fillColor: "#2ca25f",
        color: "#777777",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 1,
    };
};

function getColorPopulation(d) {
    return d > 7000 ? '#54278f' :
        d > 5000 ? '#756bb1' :
        d > 3000 ? '#9e9ac8' :
        d > 800 ? '#cbc9e2' :
        '#f2f0f7';
}

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

// base map
var mymap = L.map('mapid').setView([36.77, -119.78], 12);
var Stamen_TonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(mymap);

var geojsonPark = new L.GeoJSON.AJAX(parkUrl, {style: parkStyle});
geojsonPark.addTo(mymap);

var info = L.control();

info.onAdd = function (mymap) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Population Density</h4>' +  (props ?
                                                            '<b>' + props.NAMELSAD10 + '</b><br />' + props.population_density.toFixed(1) + ' people / mi<sup>2</sup>'
                                                            : 'Hover over a census tract');
};

info.addTo(mymap);

var geojsonPopulation;

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
    geojsonPopulation.resetStyle(e.target);
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

geojsonPopulation = new L.GeoJSON.AJAX(demographicsUrl,
                                           {style: stylePopulation,
                                            onEachFeature: onEachFeature,
                                           });
geojsonPopulation.addTo(mymap);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 800, 3000, 5000, 7000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        console.log(getColorPopulation(grades[i] + 1))
        div.innerHTML +=
            '<i style="background:' + getColorPopulation(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(mymap);

var overlayMaps = {
    "Parks": geojsonPark,
    "Populations": geojsonPopulation,
};

L.control.layers(overlayMaps).addTo(mymap);

