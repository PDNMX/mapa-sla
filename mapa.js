fetch('https://spreadsheets.google.com/feeds/list/1E4YkpVl4zhkqA5_Aipq1u1-pBvSc7OXnQ5hZZ2mu9mc/o1a8gfg/public/values?alt=json')
.then(function(response) {
	return response.json();
})
.then(function(jsonHugo) {
	/* console.log(jsonHugo); */
	entidadesMexico.features.forEach(function(element){
		jsonHugo.feed.entry.forEach(function(newElement) {
			/* console.log(newElement.gsx$claveagee.$t);
			console.log(element.properties.clave); */
			if(parseInt(element.properties.clave)===parseInt(newElement.gsx$claveagee.$t)){
				element.properties.puntaje=parseInt(newElement.gsx$puntaje.$t);
			}
		});
	  });
	/* console.log("hola");
	console.log(entidadesMexico);
	console.log("adios"); */
	// Configurando el mapa
	let map = L.map('map').setView([23.9916519, -102.0162908], 4);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		minZoom: 3,
		maxZoom: 10,
		zoom: 100,
		attribution: '',
		id: 'mapbox.light'
	}).addTo(map);


	// control that shows state info on hover
	let info = L.control();

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (props) {
		this._div.innerHTML = '<h4>Puntaje</h4>' +  (props ?
			'<b>' + props.name + '</b><br />' + props.puntaje
			: 'Pasa el cursor por el entidad para ver más detalles');
	};

	info.addTo(map);

	// get color depending on population puntaje value
	function getColor(d) {
		return d > 25 ? '#1b7837' :
				d > 20  ? '#7fbf7b' :
				d > 15  ? '#d9f0d3' :
				d > 10  ? '#e7d4e8' :
				d > 5  ? '#af8dc3' :
				d >= 0  ? '#762a83' :
							'#000';
	}

	function style(feature) {
		return {
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 0.7,
			fillColor: getColor(feature.properties.puntaje)
		};
	}

	function highlightFeature(e) {
		let layer = e.target;

		layer.setStyle({
			weight: 5,
			color: '#666',
			dashArray: '',
			fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}

		info.update(layer.feature.properties);
	}

	let geojson;

	function resetHighlight(e) {
		geojson.resetStyle(e.target);
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

	geojson = L.geoJson(entidadesMexico, {
		style: style,
		onEachFeature: onEachFeature
	}).addTo(map);

	map.attributionControl.addAttribution('');


	let legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {
		let div = L.DomUtil.create('div', 'info legend'),
			grades = [0, 5, 10, 15, 20, 25],
			labels = [],
			from, to;
		for (let i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];

			labels.push(
				'<i style="background:' + getColor(from + 1) + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'));
		}
		div.innerHTML = labels.join('<br>');
		return div;
	};
	legend.addTo(map);
});