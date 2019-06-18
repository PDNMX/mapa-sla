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
      .html(function(d) { return d.properties.nombre })
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
                        element.properties.similitud=newElement.gsx$similitud.$t;
                        element.properties.resumen=newElement.gsx$resumen.$t;
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
/*                 .attr("xlink:href", function(d) { return "https://cartodb-basemaps-" + "abc"[d[1] % 3] + ".global.ssl.fastly.net/voyager_nolabels/"+ d[2] +"/"+ + d[0] +"/"+ d[1] + "@2x.png"; })
 */                .attr("xlink:href", function(d) { return "https://"+ "abc"[d[1] % 3] +".basemaps.cartocdn.com/rastertiles/voyager_nolabels/"+d[2]+"/"+d[0]+"/"+d[1]+"@2x.png"; })
                /* .attr("xlink:href", function(d) { return "https://cartocdn_" + "abc"[d[1] % 3] + ".global.ssl.fastly.net/base-midnight/"+ d[2] +"/"+ d[0] +"/"+ d[1] +"@2x.png"; }) */
                .attr("width", Math.round(tiles.scale))
                .attr("height", Math.round(tiles.scale))
                .attr("x", function(d) { return Math.round((d[0] + tiles.translate[0]) * tiles.scale); })
                .attr("y", function(d) { return Math.round((d[1] + tiles.translate[1]) * tiles.scale); })
                .attr('opacity', 1);
            
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
                let color = d.properties.puntaje > 25 ? '#1b7837' :
                            d.properties.puntaje > 20  ? '#7fbf7b' :
                            d.properties.puntaje > 15  ? '#d9f0d3' :
                            d.properties.puntaje > 10  ? '#e7d4e8' :
                            d.properties.puntaje > 5  ? '#af8dc3' :
                            d.properties.puntaje >= 0  ? '#762a83' :
                            '#FFF';
                let modal = new RModal(document.getElementById('modal'), {
                    content:
                    `<div class="modal-content">
                        <div class="modal-header" style="background-color: ${color};">
                            <h1 style="color: #fff;"><strong>${d.properties.nombre}</strong></h1>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Cerrar" onclick="modal.close();">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div>
                                <h3>Puntaje: ${d.properties.puntaje}/30</h3>
                                <h3>Similitud: ${d.properties.similitud}</h3>
                                <br>
                                <p>${d.properties.resumen}</p>
                            </div>
                            <br>
                            <a class="btn btn-warning btn-sm" href="https://docs.google.com/spreadsheets/d/1E4YkpVl4zhkqA5_Aipq1u1-pBvSc7OXnQ5hZZ2mu9mc/export?format=csv">CSV</a>
                        </div>
    
                        <div class="modal-footer">
                            <button class="btn btn-outline-dark btn-sm" type="submit" onclick="modal.close();">Cerrar</button>
                        </div>
                    </div>`,
                    beforeOpen: function(next) {
                        document.getElementById("scroll").style.opacity=0; 
                        next();
                    }
                    , afterOpen: function() {
                        console.log('opened');
                    }
    
                    , beforeClose: function(next) {
                        
                        next();
                    }
                    , afterClose: function() {
                        document.getElementById("scroll").style.opacity=1; 
                        console.log('closed');
                    }
                    /* , bodyClass: 'modal-open' */
                    , dialogClass: 'modal-dialog'
                    /* , dialogOpenClass: 'animated fadeIn'
                    , dialogCloseClass: 'animated fadeOut' */
                    , focus: true
                    , focusElements: ['input.form-control', 'textarea', 'button.btn-primary']
                    , escapeClose: true
                });
                /* document.addEventListener('keydown', function(ev) {
                    modal.keydown(ev);
                }, false); */
                window.modal = modal;
                modal.open();
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
        if (response.index === 3) {
            document.getElementById("masInfo").style.display = "none";
        }
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
        debug: false,
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
