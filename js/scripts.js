
  mapboxgl.accessToken = 'pk.eyJ1Ijoibm1vbmVtZSIsImEiOiJja3pyYnNmdDA2cXE4Mndtejd5MndwZXFyIn0.3B86lPpNNoajWqAGCQyWYw'


  $.getJSON('./data/neighborhoods.geojson', function(rawData) {
    console.log(rawData)
    // convert disparity property from a string to a number so we cna use it
    // for a choropleth map
    var cleanData = rawData
    cleanData.features = cleanData.features.map(function(feature) {
      var cleanFeature = feature
      cleanFeature.properties.disparities = parseInt(cleanFeature.properties.disparities)
      return cleanFeature
    })

    // bounds for a citywide view of New York
    var nycBounds = [[-74.333496,40.469935], [-73.653717,40.932190]]


    var map = new mapboxgl.Map({
      container: 'mapContainer', // HTML container id
      style: 'mapbox://styles/mapbox/streets-v9', // style URL
      bounds: nycBounds, // sets initial bounds instead of center + zoom
      maxBounds: nycBounds, // sets the max bounds, limited where the user can pan to
      maxZoom: 11 // sets the maximum zoom level

      
    });

    map.on('load', function() {
      map.addSource('neighborhoods', {
        type: 'geojson',
        data: cleanData
      })

      map.addLayer({
        id: 'neighborhoods-districts-fill',
        type: 'fill',
        source: 'neighborhoods',
// gets a color gradient from color deseigner https://colordesigner.io/gradient-generator
        paint: {
          'fill-outline-color': '#db1212',
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'disparities'],
            0,
            '#f0c755',
            1,
            '#f0c755',
            2,
            '#edb341',
            3,
            '#edb341',
            4,
            '#eb9f2f',
            5,
            '#eb9f2f',
            6,
            '#e88a1f',
            7,
            '#e88a1f',
            8,
            '#e47312',
            9,
            '#e47312',
            10,
            '#e05b0c',
            12,
            '#e05b0c',
            13,
            '#da3e0d',
            15,
            '#da3e0d',
            17,
            '#d40d12',
          ],
          'fill-opacity': 0.75
        }
      })


// initialize a source with dummy data
      map.addSource('selected-feature', {
        type: 'geojson',
        data: {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Point",
            "coordinates": [
              -13.7109375,
              34.88593094075317
            ]
          }
        }
      })

      map.addLayer({
        id: 'selected-feature-line',
        type: 'line',
        source: 'selected-feature',
        paint: {
          'line-color': 'black',
          'line-width': 4,
          'line-dasharray': [1, 1]
        }
      })

      map.on('click', function(e) {
        var features = map.queryRenderedFeatures(e.point)
        var featureOfInterestProperties = features[0].properties



        var boroCd = featureOfInterestProperties['boro_cd']
        // look up the feature in cleanData that matches this boro_cd code
        featureOfInterestGeometry = cleanData.features.find(function(feature) {
          return feature.properties['boro_cd'] === boroCd
        })

        console.log('the geometry', featureOfInterestGeometry)
        // use this geometry to update the source for the selected layer
        map.getSource('selected-feature').setData(featureOfInterestGeometry)


        var borough = featureOfInterestProperties['New_York_City_Population_By_Community_Districts_Borough']
        var cdName = featureOfInterestProperties['cd_name']
        var disparities = featureOfInterestProperties['disparities']
        var avg_income = featureOfInterestProperties['avg_income']


        $('#overlay-content-area').html(`
          <h4>${borough}</h4>
          <p>${cdName}</p>
          <p>Disparities: ${numeral(disparities).format('0.0a')}</p>
          <p>Average Income: ${numeral(avg_income).format('0.0a')}</p>
        `)

      })
    })



    $('#toggle-population').on('click', function() {
      var visibility = map.getLayoutProperty('neighborhoods-districts-fill', 'visibility')
      if (visibility === 'none') {
        map.setLayoutProperty('neighborhoods-districts-fill', 'visibility', 'visible');
      } else {
        map.setLayoutProperty('neighborhoods-districts-fill', 'visibility', 'none');
      }
    })
  })