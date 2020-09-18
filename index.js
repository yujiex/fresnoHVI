import allmapsUrl from './geojson_files/allmaps.geojson';

var w1;
var w2;
var w3;
var w4;
var w5;
var w6;
var w7;
var w8;
var w9;
var geojsonAll;
// helpers

function getSelectedTab () {
    var radios = document.getElementsByName('options');
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            return(radios[i].id);
        }
    }
};

function resetWeights (selected) {
    var weightElem = document.getElementsByClassName('form-control');
    var defaultWeights;
    for (var i = 0, length = weightElem.length; i < length; i++) {
        weightElem[i].value = '1.0';
    }
    if (selected == "exposure") {
        weightElem[0].value = '5.0';
        weightElem[1].value = '0.0';
        weightElem[2].value = '0.0';
    } else if (selected == "sensitivity") {
        weightElem[3].value = '5.0';
    } else if (selected == "adaptation") {
        weightElem[0].value = '5.0';
    }
}

function getWeights (selected) {
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
    var norm = weights.reduce(function(a, b) {
        return a + b;
    }, 0);
    var normWeights = weights.map(function(w) { return w/norm;});
    return normWeights;
}

function dotProd (vec1, vec2) {
    var acc = 0;
    for(var i = 0;i < vec1.length;i++) {
        acc = acc + vec1[i] * vec2[i];
    }
    return acc;
}

function changeWeights() {
    var selected = getSelectedTab();
    var weights = getWeights(selected);
    mainMap.removeLayer(geojsonAll);
    // geojsonAll = new L.GeoJSON.AJAX(allmapsUrl, {style: style_exposure});
    if (selected == "exposure") {
        geojsonAll = new L.GeoJSON.AJAX(allmapsUrl, {style: style_exposure,
                                                     onEachFeature: onEachFeature,});
    } else if (selected == "sensitivity") {
        geojsonAll = new L.GeoJSON.AJAX(allmapsUrl, {style: style_sensitivity,
                                                     onEachFeature: onEachFeature,});
    } else {
        geojsonAll = new L.GeoJSON.AJAX(allmapsUrl, {style: style_adaptation,
                                                     onEachFeature: onEachFeature,});
    }
    geojsonAll.addTo(mainMap);
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

function getColorLegend(d, palette) {
    var colors = getPalette(palette);
    return d == 1 ? colors[0] :
        d == 2 ? colors[1] :
        d == 3 ? colors[2] :
        d == 4 ? colors[3] :
        d == 5 ? colors[4] :
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

function getHVIColor(d, palette) {
    var colors = getPalette(palette);
    return d <= 1 ? colors[0] :
        d <= 2 ? colors[1] :
        d <= 4 ? colors[2] :
        d <= 8 ? colors[3] : colors[4];
}

function getMainMapColor(d, palette) {
    var colors = getPalette(palette);
    return d <= 1.5 ? colors[0] :
        d <= 2.5 ? colors[1] :
        d <= 3.5 ? colors[2] :
        d <= 4.5 ? colors[3] :
        d <= 5 ? colors[4] :
        '#f2f0f7';
}

function style_empty(feature) {
    return {
        fillColor: getColorLegend(feature.properties.high_hi_hours, "orangeRed"),
        weight: 0,
        opacity: 0,
        color: 'white',
        fillOpacity: 0
    };
};

function normalize_weights(weights) {
    var norm = weights.reduce(function(a, b) {
        return a + b;
    }, 0);
    var normWeights = weights.map(function(w) { return w/norm;});
    return normWeights;
}

function style_overall(feature) {
    var exposureWeights = normalize_weights([5.0, 0.0, 0.0, 1.0, 1.0]);
    var exposureValues = [feature.properties.heat_days_tmaxtmin,
                  feature.properties.high_temp_streak_longest,
                  feature.properties.high_hi_hours,
                  feature.properties.pm25_concentration,
                  feature.properties.ozone_exceedance];
    var sensitivityWeights = normalize_weights([1.0, 1.0, 1.0, 5.0, 1.0, 1.0, 1.0, 1.0, 1.0]);
    var sensitivityValues = [feature.properties.perc_children,
                  feature.properties.perc_elderly,
                  feature.properties.perc_nonwhite,
                  feature.properties.perc_poverty,
                  feature.properties.perc_no_hs_diploma,
                  feature.properties.perc_cognitive_disability,
                  feature.properties.perc_ambulatory_disability,
                  feature.properties.asthma_prevalence,
                  feature.properties.cardio_disease_prevalence];
    var adaptationWeights = normalize_weights([5.0, 1.0]);
    var adaptationValues = [feature.properties.median_income_kdollars,
                  feature.properties.percent_park];
    return {
        fillColor: getHVIColor(
            dotProd(exposureWeights, exposureValues) *
                dotProd(sensitivityWeights, sensitivityValues) /
                dotProd(adaptationWeights, adaptationValues),
            "overallHVI"),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_exposure(feature) {
    var weights = getWeights('exposure');
    var values = [feature.properties.heat_days_tmaxtmin,
                  feature.properties.high_temp_streak_longest,
                  feature.properties.high_hi_hours,
                  feature.properties.pm25_concentration,
                  feature.properties.ozone_exceedance];
    return {
        fillColor: getMainMapColor(
            dotProd(weights, values),
        "orangeRed"),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_adaptation(feature) {
    var weights = getWeights('adaptation');
    var values = [feature.properties.median_income_kdollars,
                  feature.properties.percent_park];
    return {
        fillColor: getMainMapColor(
            dotProd(weights, values),
            "blueGreen"),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_sensitivity(feature) {
    var weights = getWeights('sensitivity');
    var values = [feature.properties.perc_children,
                  feature.properties.perc_elderly,
                  feature.properties.perc_nonwhite,
                  feature.properties.perc_poverty,
                  feature.properties.perc_no_hs_diploma,
                  feature.properties.perc_cognitive_disability,
                  feature.properties.perc_ambulatory_disability,
                  feature.properties.asthma_prevalence,
                  feature.properties.cardio_disease_prevalence];
    return {
        fillColor: getMainMapColor(
            dotProd(weights, values),
            "bluePurple"),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_high_hi_hours(feature) {
    return {
        fillColor: getColorLegend(feature.properties.high_hi_hours, "orangeRed"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function  style_high_temp_streak_longest(feature) {
    return {
        fillColor: getColorLegend(feature.properties.high_temp_streak_longest, "orangeRed"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_heat_days_tmaxtmin(feature) {
    return {
        fillColor: getColorLegend(feature.properties.heat_days_tmaxtmin, "orangeRed"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_pm25_concentration(feature) {
    return {
        fillColor: getColorLegend(feature.properties.pm25_concentration, "orangeRed"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_ozone_exceedance(feature) {
    return {
        fillColor: getColorLegend(feature.properties.ozone_exceedance, "orangeRed"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_perc_children (feature) {
    return {
        fillColor: getColorLegend(feature.properties.perc_children, "bluePurple"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_perc_elderly (feature) {
    return {
        fillColor: getColorLegend(feature.properties.perc_elderly, "bluePurple"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_perc_nonwhite (feature) {
    return {
        fillColor: getColorLegend(feature.properties.perc_nonwhite, "bluePurple"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_perc_poverty (feature) {
    return {
        fillColor: getColorLegend(feature.properties.perc_poverty, "bluePurple"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_perc_no_hs_diploma (feature) {
    return {
        fillColor: getColorLegend(feature.properties.perc_no_hs_diploma, "bluePurple"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_perc_cognitive_disability (feature) {
    return {
        fillColor: getColorLegend(feature.properties.perc_cognitive_disability, "bluePurple"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_perc_ambulatory_disability (feature) {
    return {
        fillColor: getColorLegend(feature.properties.perc_ambulatory_disability, "bluePurple"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_asthma_prevalence (feature) {
    return {
        fillColor: getColorLegend(feature.properties.asthma_prevalence, "bluePurple"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_cardio_disease_prevalence (feature) {
    return {
        fillColor: getColorLegend(feature.properties.cardio_disease_prevalence, "bluePurple"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_median_income_kdollars (feature) {
    return {
        fillColor: getColorLegend(feature.properties.median_income_kdollars, "blueGreen"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

function style_perc_park (feature) {
    return {
        fillColor: getColorLegend(feature.properties.percent_park, "blueGreen"),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
};

// install actions to weights
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

function getPaletteName () {
    var selected = $('input:radio[name="options"]:checked').attr('id');
    return selected == "exposure" ? "orangeRed" :
        selected == "sensitivity" ? "bluePurple" :
        selected == "adaptation" ? "blueGreen" :
        "overallHVI";
}

function getPalette (palette) {
    return (palette == 'orangeRed') ? ['#FFFFB2', '#FECC5C', '#FD8D3C', '#F03B20', '#BD0026'] :
        (palette == 'bluePurple') ? ['#EDF8FB', '#B3CDE3', '#8C96C6', '#8856A7', '#810F7C'] :
        (palette == "blueGreen") ? ['#EDF8FB', '#B2E2E2', '#66C2A4', '#2CA25F', '#006D2C'] :
        ["#1A9641", "#A6D96A", "#FFFFBF", "#FDAE61", "#D7191C"];
}

$(document).on('change', 'input:radio[name="options"]', function (event) {
    if ($("#hvi-overall").is(":checked")) {
        console.log("overall checked");
        $('#titletext').text("Overall");
        $('#hvi-factors').hide();
        mainMap.removeLayer(geojsonAll);
        geojsonAll = new L.GeoJSON.AJAX(allmapsUrl,
                                        {style: style_overall,
                                         onEachFeature: onEachFeature,
                                        }).addTo(mainMap);
        // update legend
        mainMap.removeControl(legend);
        legend = new L.control({position: 'bottomright'});
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 1, 2, 4, 8],
                labels = [];
            var palette = getPaletteName();
            console.log("palette name");
            console.log(palette);
            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColorLegend(i + 1, palette) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }
            return div;
        };
        legend.addTo(mainMap);
    } else if ($("#exposure").is(":checked")) {
        console.log("exposure checked");
        $('#factors').show();
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

        resetWeights('exposure');
        $('#w_3').show();
        $('#w_4').show();
        $('#w_5').show();
        $('#w_6').hide();
        $('#w_7').hide();
        $('#w_8').hide();
        $('#w_9').hide();
        mainMap.removeLayer(geojsonAll);
        geojsonAll = new L.GeoJSON.AJAX(allmapsUrl,
                                        {style: style_exposure,
                                         onEachFeature: onEachFeature,
                                        }).addTo(mainMap);

        // update legend
        mainMap.removeControl(legend);
        legend = new L.control({position: 'bottomright'});
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [1, 1.5, 2.5, 3.5, 4.5],
                labels = [];
            var palette = getPaletteName();
            console.log("palette name");
            console.log(palette);
            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColorLegend(i + 1, palette) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }
            return div;
        };
        legend.addTo(mainMap);

        f1_map.removeLayer(f1Geojson);
        f1Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style:  style_heat_days_tmaxtmin,
                                                   }).addTo(f1_map);
        f2_map.removeLayer(f2Geojson);
        f2Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_high_temp_streak_longest,
                                                   }).addTo(f2_map);
        f3_map.removeLayer(f3Geojson);
        f3Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style:  style_high_hi_hours,
                                                   }).addTo(f3_map);
        f4_map.removeLayer(f4Geojson);
        f4Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style:  style_pm25_concentration,
                                                   }).addTo(f4_map);
        f5_map.removeLayer(f5Geojson);
        f5Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_ozone_exceedance,
                                                   }).addTo(f5_map);
    } else if ($("#sensitivity").is(":checked")) {
        console.log("sensitivity checked");
        $('#factors').show();
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

        resetWeights('sensitivity');
        $('#w_3').show();
        $('#w_4').show();
        $('#w_5').show();
        $('#w_6').show();
        $('#w_7').show();
        $('#w_8').show();
        $('#w_9').show();
        mainMap.removeLayer(geojsonAll);
        geojsonAll = new L.GeoJSON.AJAX(allmapsUrl,
                                        {style: style_sensitivity,
                                         onEachFeature: onEachFeature,
                                        }).addTo(mainMap);
        mainMap.removeControl(legend);

        legend = new L.control({position: 'bottomright'});
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [1, 1.5, 2.5, 3.5, 4.5],
                labels = [];
            var palette = getPaletteName();
            console.log("palette name");
            console.log(palette);
            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColorLegend(i + 1, palette) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }
            return div;
        };
        legend.addTo(mainMap);

        f1_map.removeLayer(f1Geojson);
        f1Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_perc_children,
                                       }).addTo(f1_map);
        f2_map.removeLayer(f2Geojson);
        f2Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_perc_elderly,
                                                   }).addTo(f2_map);
        f3_map.removeLayer(f3Geojson);
        f3Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_perc_nonwhite,
                                                   }).addTo(f3_map);
        f4_map.removeLayer(f4Geojson);
        f4Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_perc_poverty,
                                                   }).addTo(f4_map);
        f5_map.removeLayer(f5Geojson);
        f5Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_perc_no_hs_diploma,
                                                   }).addTo(f5_map);
        f6_map.removeLayer(f6Geojson);
        f6Geojson = new L.GeoJSON.AJAX(allmapsUrl,
                                           {style: style_perc_cognitive_disability,
                                            }).addTo(f6_map);
        f7_map.removeLayer(f7Geojson);
        f7Geojson = new L.GeoJSON.AJAX(allmapsUrl,
                                       {style: style_perc_ambulatory_disability,
                                       }).addTo(f7_map);
        f8_map.removeLayer(f8Geojson);
        f8Geojson = new L.GeoJSON.AJAX(allmapsUrl,
                                       {style: style_asthma_prevalence,
                                       }).addTo(f8_map);
        f9_map.removeLayer(f9Geojson);
        f9Geojson = new L.GeoJSON.AJAX(allmapsUrl,
                                       {style: style_cardio_disease_prevalence,
                                       }).addTo(f9_map);
    } else {
        console.log("adaptation checked");
        $('#factors').show();
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

        resetWeights('adaptation');
        $('#w_3').hide();
        $('#w_4').hide();
        $('#w_5').hide();
        $('#w_6').hide();
        $('#w_7').hide();
        $('#w_8').hide();
        $('#w_9').hide();
        mainMap.removeLayer(geojsonAll);
        geojsonAll = new L.GeoJSON.AJAX(allmapsUrl,
                                        {style: style_adaptation,
                                         onEachFeature: onEachFeature,
                                        }).addTo(mainMap);

        // update legend
        mainMap.removeControl(legend);
        legend = new L.control({position: 'bottomright'});
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [1, 1.5, 2.5, 3.5, 4.5],
                labels = [];
            var palette = getPaletteName();
            console.log("palette name");
            console.log(palette);
            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColorLegend(i + 1, palette) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }
            return div;
        };
        legend.addTo(mainMap);


        f1_map.removeLayer(f1Geojson);
        f1Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_median_income_kdollars,
                                                   }).addTo(f1_map);
        f2_map.removeLayer(f2Geojson);
        f2Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_perc_park,
                                                   }).addTo(f2_map);
    }
});

$('#w_6').hide();
$('#w_7').hide();
$('#w_8').hide();
$('#w_9').hide();

// heat days map
var f1_map = L.map('f1').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(f1_map);
var f1Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_heat_days_tmaxtmin
                                                 // onEachFeature: onEachFeature,
                                                }).addTo(f1_map);

// heat days map
var f2_map = L.map('f2').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(f2_map);
var f2Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_high_temp_streak_longest,
                                // onEachFeature: onEachFeature,
                               }).addTo(f2_map);

// high HI map
var f3_map = L.map('f3').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(f3_map);
var f3Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_high_hi_hours,
                                // onEachFeature: onEachFeature,
                               }).addTo(f3_map);

// pm2.5 map
var f4_map = L.map('f4').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(f4_map);
var f4Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_pm25_concentration,
                                // onEachFeature: onEachFeature,
                               }).addTo(f4_map);

//ozone map
var f5_map = L.map('f5').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(f5_map);
var f5Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_ozone_exceedance,
                                // onEachFeature: onEachFeature,
                               }).addTo(f5_map);

// place-holders
var f6_map = L.map('f6').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(f6_map);
var f6Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_empty,
                                                // onEachFeature: onEachFeature,
                                               }).addTo(f6_map);

var f7_map = L.map('f7').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(f7_map);
var f7Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_empty,
                                                // onEachFeature: onEachFeature,
                                               }).addTo(f7_map);

var f8_map = L.map('f8').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(f8_map);
var f8Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_empty,
                                                // onEachFeature: onEachFeature,
                                               }).addTo(f8_map);

var f9_map = L.map('f9').setView([36.77, -119.78], 10);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(f9_map);
var f9Geojson = new L.GeoJSON.AJAX(allmapsUrl, {style: style_empty,
                                                // onEachFeature: onEachFeature,
                                               }).addTo(f9_map);

$('#f6').hide();
$('#f7').hide();
$('#f8').hide();
$('#f9').hide();

// exposure map
var mainMap = L.map('mainview').setView([36.77, -119.78], 11);
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(mainMap);

geojsonAll = new L.GeoJSON.AJAX(allmapsUrl, {style: style_exposure,
                                                 onEachFeature: onEachFeature,
                                                });
geojsonAll.addTo(mainMap);

var info = L.control();

info.onAdd = function (mainMap) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    var selected = getSelectedTab();
    var weights = getWeights(selected);
    var values;
    var labelstring;
    var hvi;
    // console.log(props.heat_days_tmaxtmin);
    if (props) {
        if (selected == "hvi-overall") {
            var exposureWeights = normalize_weights([5.0, 0.0, 0.0, 1.0, 1.0]);
            var exposureValues = [props.heat_days_tmaxtmin,
                        props.high_temp_streak_longest,
                        props.high_hi_hours,
                        props.pm25_concentration,
                        props.ozone_exceedance];
            var sensitivityWeights = normalize_weights([1.0, 1.0, 1.0, 5.0, 1.0, 1.0, 1.0, 1.0, 1.0]);
            var sensitivityValues = [props.perc_children,
                        props.perc_elderly,
                        props.perc_nonwhite,
                        props.perc_poverty,
                        props.perc_no_hs_diploma,
                        props.perc_cognitive_disability,
                        props.perc_ambulatory_disability,
                        props.asthma_prevalence,
                        props.cardio_disease_prevalence];
            var adaptationWeights = normalize_weights([5.0, 1.0]);
            var adaptationValues = [props.median_income_kdollars,
                        props.percent_park];
            hvi = dotProd(exposureWeights, exposureValues) *
                dotProd(sensitivityWeights, sensitivityValues) /
                dotProd(adaptationWeights, adaptationValues);
            labelstring =
                '<strong>Exposure</strong>' + '<br/>' +
                '&nbsp # overheat days: ' + props.heat_days_tmaxtmin + '<br/>' +
                '&nbsp longest overheat-day streak: ' + props.high_temp_streak_longest + '<br/>' +
                '&nbsp # hours with high HI: ' + props.high_hi_hours + '<br/>' +
                '&nbsp PM2.5 concentration: ' + props.pm25_concentration + '<br/>' +
                '&nbsp Ozone exceedance: ' + props.ozone_exceedance + '<br/>' +
                '<strong>Sensitivity</strong>' + '<br/>' +
                '&nbsp % children: ' + props.perc_children + '<br/>' +
                '&nbsp % elderly: ' + props.perc_elderly + '<br/>' +
                '&nbsp % non-white: ' + props.perc_nonwhite + '<br/>' +
                '&nbsp % in poverty: ' + props.perc_poverty + '<br/>' +
                '&nbsp % low education: ' + props.perc_no_hs_diploma + '<br/>' +
                '&nbsp % with cognitive disability: ' + props.perc_cognitive_disability + '<br/>' +
                '&nbsp % with ambulatory disability: ' + props.perc_ambulatory_disability + '<br/>' +
                '&nbsp Athsma ER visits/10000 people: ' + props.asthma_prevalence + '<br/>' +
                '&nbsp Heart attack /1000 people: ' + props.cardio_disease_prevalence + '<br/>' +
                '<strong>Adaptation</strong>' + '<br/>' +
                '&nbsp median income: ' + props.median_income_kdollars + '<br/>' +
                '&nbsp % area with parks: ' + props.percent_park + '<br/>';
        } else if (selected == "exposure") {
            values = [props.heat_days_tmaxtmin,
                    props.high_temp_streak_longest,
                    props.high_hi_hours,
                    props.pm25_concentration,
                    props.ozone_exceedance];
            hvi = dotProd(weights, values);
            labelstring =
                '# overheat days: ' + props.heat_days_tmaxtmin + '<br/>' +
                'longest overheat-day streak: ' + props.high_temp_streak_longest + '<br/>' +
                '# hours with high HI: ' + props.high_hi_hours + '<br/>' +
                'PM2.5 concentration: ' + props.pm25_concentration + '<br/>' +
                'Ozone exceedance: ' + props.ozone_exceedance + '<br/>';
        } else if (selected == "sensitivity") {
            values = [props.perc_children,
                    props.perc_elderly,
                    props.perc_nonwhite,
                    props.perc_poverty,
                    props.perc_no_hs_diploma,
                    props.perc_cognitive_disability,
                    props.perc_ambulatory_disability,
                    props.asthma_prevalence,
                    props.cardio_disease_prevalence];
            hvi = dotProd(weights, values);
            labelstring =
                '% children: ' + props.perc_children + '<br/>' +
                '% elderly: ' + props.perc_elderly + '<br/>' +
                '% non-white: ' + props.perc_nonwhite + '<br/>' +
                '% in poverty: ' + props.perc_poverty + '<br/>' +
                '% low education: ' + props.perc_no_hs_diploma + '<br/>' +
                '% with cognitive disability: ' + props.perc_cognitive_disability + '<br/>' +
                '% with ambulatory disability: ' + props.perc_ambulatory_disability + '<br/>' +
                'Athsma ER visits/10000 people: ' + props.asthma_prevalence + '<br/>' +
                'Heart attack /1000 people: ' + props.cardio_disease_prevalence + '<br/>';
        } else {
            values = [props.median_income_kdollars,
                    props.percent_park];
            hvi = dotProd(weights, values);
            labelstring =
                'median income: ' + props.median_income_kdollars + '<br/>' +
                '% area with parks: ' + props.percent_park + '<br/>';
        }
    } else {
        values = [];
        labelstring = '<b>';
    }
    var titlestring = $('#titletext').text();
    this._div.innerHTML =
        (props ? '<h4>' + $('#titletext').text() + '</h4>' +
         '<b>' +
         props.GEOID10 + '</b><br />' +
         'overall ' + $('#titletext').text() + ': ' +
         hvi.toFixed(1) + '<br/>' +
         '<br/>' +
         'class label of individual factors' + '<br/>' +
         labelstring
         : 'Hover over a census tract');
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

console.log();

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [1, 1.5, 2.5, 3.5, 4.5],
        labels = [];

    var palette = getPaletteName();

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColorLegend(i + 1, palette) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(mainMap);
