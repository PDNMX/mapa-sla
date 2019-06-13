let projection = d3.geoMercator()
    .scale(1200)
    .center([-102.34034978813841, 24.012062015793]);
let path = d3.geoPath(projection);
let map = d3.select('#mexico');
let mexico;

var width = Math.max(960, window.innerWidth),
    height = Math.max(500, window.innerHeight);

let tile = d3.tile()
    .scale(projection.scale() * 2 * Math.PI)
    .translate(projection([0, 0]));

let tip = d3.tip()
      .attr('class', 'd3-tip')
      .html(function(d) { return d.properties.nombre + '<br>Puntaje: ' + d.properties.puntaje })
      .direction('s');

map.call(tip);


d3.json("mexico.json")
    .then(function(data) {
        mexico = data;
        fetch('https://spreadsheets.google.com/feeds/list/1E4YkpVl4zhkqA5_Aipq1u1-pBvSc7OXnQ5hZZ2mu9mc/o1a8gfg/public/values?alt=json')
        .then(function(response) {
            return response.json();
        })
        .then(function(jsonHugo) {
            mexico.objects.collection.geometries.forEach(function(element){
                jsonHugo.feed.entry.forEach(function(newElement) {
                    if(parseInt(element.properties.clave)===parseInt(newElement.gsx$claveagee.$t)){
                        element.properties.puntaje=parseInt(newElement.gsx$puntaje.$t);
                    }
                });
            });
            /* console.log(mexico); */
            return(mexico);
        }).then(function(mexico){
            var tiles = tile();
            /* var defs = map.append("defs"); */

            // Agrega el mapa de carto DB
            map.append("g")
                .selectAll("image")
                .data(tiles)
                .enter().append("image")
                /* .attr("xlink:href", function(d) { return "http://" + "abc"[d[1] % 3] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; }) */
                .attr("xlink:href", function(d) { return "https://cartodb-basemaps-"+ "abc"[d[1] % 3] + ".global.ssl.fastly.net/light_nolabels/"+ d[2] +"/"+ + d[0] +"/"+ d[1] + "@2x.png"; })
                /* .attr("xlink:href", function(d) { return "https://cartocdn_" + "abc"[d[1] % 3] + ".global.ssl.fastly.net/base-midnight/"+ d[2] +"/"+ d[0] +"/"+ d[1] +"@2x.png"; }) */
                .attr("width", Math.round(tiles.scale))
                .attr("height", Math.round(tiles.scale))
                .attr("x", function(d) { return Math.round((d[0] + tiles.translate[0]) * tiles.scale); })
                .attr("y", function(d) { return Math.round((d[1] + tiles.translate[1]) * tiles.scale); });
            
            // REMARCANDO LAS ENTIDADES - PASO 1
            map.append("g").attr('id', 'step-1').attr('opacity', 0)
                .selectAll("path")
                .data(topojson.feature(mexico, mexico.objects.collection).features)
                .join("path")
                .attr("stroke-width", 0.8)
                .attr("fill-opacity",0)
                .attr("d", path);
            
            // MUY PARECIDOS - PASO 2
            map.append("g").attr('id', 'step-2').attr('opacity', 0)
                .selectAll("path")
                .data(topojson.feature(mexico, mexico.objects.collection).features)
                .join("path")
                .attr("fill", function(d,i){
                    return d.properties.puntaje > 25 ? '#1b7837' :
                            d.properties.puntaje > 20  ? '#7fbf7b' :
                            d.properties.puntaje > 15  ? '#d9f0d3' :
                            d.properties.puntaje > 10  ? '#FFF' :
                            '#FFF';
                })
                .attr("stroke-width", 0.8)
                .attr("d", path);

            // MUY DIFERENTES PASO 3 
            map.append("g").attr('id', 'step-3').attr('opacity', 0)
            .selectAll("path")
            .data(topojson.feature(mexico, mexico.objects.collection).features)
            .join("path")
            .attr("fill", function(d,i){
                /* return color(i); */
                return d.properties.puntaje > 15  ? '#FFF' :
                        d.properties.puntaje > 10  ? '#e7d4e8' :
                        d.properties.puntaje > 5  ? '#af8dc3' :
                        d.properties.puntaje >= 0  ? '#762a83' :
                        '#FFF';
            })
            .attr("stroke-width", 0.8)
            .attr("d", path);
            
            // MAPA COMPLETO PASO 4 
            map.append("g").attr('id', 'step-4').attr('opacity', 0)
            .selectAll("path")
            .data(topojson.feature(mexico, mexico.objects.collection).features)
            .join("path")
            .attr("fill", function(d,i){
                return d.properties.puntaje > 25 ? '#1b7837' :
                            d.properties.puntaje > 20  ? '#7fbf7b' :
                            d.properties.puntaje > 15  ? '#d9f0d3' :
                            d.properties.puntaje > 10  ? '#e7d4e8' :
                            d.properties.puntaje > 5  ? '#af8dc3' :
                            d.properties.puntaje >= 0  ? '#762a83' :
                                        '#FFF';
            })
            .attr("d", path)
            .attr("stroke-width", 0.8)
            .attr('class', 'entidad')
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .on('click', function(d,i){
                var div = document.getElementById('masInfo');
                div.innerHTML = `<p>Entidad: <b>${d.properties.nombre}</b></p>
                                  <p>Puntaje: <b>${d.properties.puntaje}</b></p>
                                  <p>Más info...</p>`;
            });
        })
    });

// scrollama basic
let container = document.querySelector('#scroll');
let text = container.querySelector('.scroll__text');
let steps = text.querySelectorAll('.step');

// initialize the scrollama
let scroller = scrollama();

// scrollama event handlers
function handleStepEnter(response) {
    // response = { element, direction, index }
    console.log(response.index, '-------- enter');
    // add to color to current step
    response.element.classList.add('is-active');
    // show corresponding map step if scrolling down
    let stepAnterior = parseInt(response.index) - 1;
    let stepPosterior = parseInt(response.index) + 1;
    if (response.direction == 'down') {
        if (response.index === 4) {
            document.getElementById("masInfo").style.display = "block";
        }
        map.select('#step-'+response.index).transition().duration(1500).attr('opacity', 0.75)
        map.select('#step-'+stepAnterior).transition().duration(1500).attr('opacity', 0)
    };
    if (response.direction == 'up') {
        map.select('#step-'+stepPosterior).transition().duration(1500).attr('opacity', 0)
        map.select('#step-'+response.index).transition().duration(1500).attr('opacity', 0.75)
    }
}

function handleStepExit(response) {
    // response = { element, direction, index }
    console.log(response.index, '-------- exit');
    // remove color from current step
    response.element.classList.remove('is-active');
    // hide corresponding map step if scrolling up
    // if (response.direction == 'up') map.select('#step-'+response.index).transition().duration(2000).attr('opacity', 0);
    if (response.direction == 'down'&& response.index !== 4) map.select('#step-'+response.index).attr('opacity', 0);
}

function handleStepProgress(response) {
    // response = { element, progress, index }
    console.log(response.index, '-------- progress -', response.progress);
}

function init() {
    // set random padding for different step heights (not required)
    // steps.forEach(function (step) {
    //     // let v = 100 + Math.floor(Math.random() * window.innerHeight / 4);
    //     // step.style.padding = v + 'px 0px';
    //     step.style.height = '300px';
    // });

    // 1. setup the scroller with the bare-bones options
    // this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller.setup({
        step: '.scroll__text .step',
        debug: true,
        offset: 0.3,
        // progress: true,
    })
    .onStepEnter(handleStepEnter)
    //.onStepExit(handleStepExit)
    // .onStepProgress(handleStepProgress)
    // setup resize event
    window.addEventListener('resize', scroller.resize);
}

// kick things off
init();
