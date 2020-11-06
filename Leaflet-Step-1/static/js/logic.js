//Getting colors 
function getColor(depth) {
    if (depth <= 10) {
        return 'limegreen'
    }
    if (depth <= 30) {
        return 'greenyellow'
    }
    if (depth <= 50) {
        return 'gold'
    }
    if (depth <= 70) {
        return 'sandybrown'
    }
    if (depth <= 90) {
        return 'darkorange'
    }
    if (depth > 90) {
        return 'darkred'
    }
}
//store API endpoint
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//Query the URL
d3.json(queryUrl, function (data) {
    createFeatures(data.features);
});

//Create function to run on certain features
// Create popup with informatin
function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) +
            "</h3><hr><p>" + "Magnitude: " + feature.properties.mag +
            "</h3><hr><p>" + "Depth: " + feature.geometry.coordinates[2] + "</p>");
    }
    console.log(earthquakeData);

    function pointToLayer(feature, latlng) {
        let circle = L.circleMarker(latlng, {
            fillOpacity: 1,
            radius: feature.properties.mag * 3,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: 'darkgreen'
        });
        return circle
    }
    // Create a GeoJSON layer 
    // Run the onEachFeature function 
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
    });

    // Send the earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    let lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        zoomOffset: -1,
        id: "dark-v10",
        accessToken: API_KEY
    });
    // Defining baseMaps to hold our base layers
    let baseMaps = {
        "Light Map": lightmap,
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    let overlayMaps = {
        Earthquakes: earthquakes

    };

    // Creating the map
    let myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [lightmap, earthquakes]
    });

    // Create a layer control and adding it to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    //Creating the legend
    let legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {

        let div = L.DomUtil.create("div", 'info legend'),
            labels = ['<strong> EARTHQUAKE DEPTH </strong>'],
            depth = [0, 10, 30, 50, 70, 90],
            color = ['limegreen', 'greenyellow', 'gold', 'sandybrown', 'darkorange', 'darkred'];


        for (let i = 0; i < depth.length; i++) {
            div.innerHTML +=
                labels.push(
                    '<i style="background:' + color[i] + '"></i> ' +
                    depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+'));
        }
        div.innerHTML = labels.join('<br>');
        return div;

    };

    legend.addTo(myMap);
}