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
                        element.properties.s1=newElement.gsx$s1liga.$t;
                        element.properties.s2=newElement.gsx$s2liga.$t;
                        element.properties.s3=newElement.gsx$s3liga.$t;
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
                .attr("xlink:href", function(d) { return "https://"+ "abc"[d[1] % 3] +".basemaps.cartocdn.com/rastertiles/voyager_nolabels/"+d[2]+"/"+d[0]+"/"+d[1]+"@2x.png"; })
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
                .attr("stroke-width", 0.5)
                .attr("fill-opacity",0)
                .attr("stroke", "#212529")
                .attr("d", path);

            // MUY PARECIDOS - PASO 2
            map.append("g").attr('id', 'step-2').attr('opacity', 0)
                .selectAll("path")
                .data(topojson.feature(mexico, mexico.objects.collection).features)
                .join("path")
                .attr("fill", function(d,i){
                    return d.properties.puntaje > 25 ? '#2eb2e7' :
                            d.properties.puntaje > 20  ? '#73e4ff' :
                            d.properties.puntaje > 15  ? '#aaffff' :
                            d.properties.puntaje > 10  ? 'rgba(255, 255, 255, 0)' :
                            'rgba(255, 255, 255, 0)';
                })
                .attr("stroke-width", 0.3)
                .attr("stroke", "#212529")
                .attr("d", path);

            // MUY DIFERENTES PASO 3
            map.append("g").attr('id', 'step-3').attr('opacity', 0)
            .selectAll("path")
            .data(topojson.feature(mexico, mexico.objects.collection).features)
            .join("path")
            .attr("fill", function(d,i){
                /* return color(i); */
                return d.properties.puntaje > 15  ? 'rgba(255, 255, 255, 0)' :
                        d.properties.puntaje > 10  ? '#ffca8a' :
                        d.properties.puntaje > 5  ? '#ff995b' :
                        d.properties.puntaje >= 0  ? '#e7692e' :
                        'rgba(255, 255, 255, 0)';
            })
            .attr("stroke-width", 0.3)
            .attr("stroke", "#212529")
            .attr("d", path);

            // MAPA COMPLETO PASO 4
            map.append("g").attr('id', 'step-4').attr('opacity', 0)
            .selectAll("path")
            .data(topojson.feature(mexico, mexico.objects.collection).features)
            .join("path")
            .attr("fill", function(d,i){
                return d.properties.puntaje > 25 ? '#2eb2e7' :
                            d.properties.puntaje > 20  ? '#73e4ff' :
                            d.properties.puntaje > 15  ? '#aaffff' :
                            d.properties.puntaje > 10  ? '#ffca8a' :
                            d.properties.puntaje > 5  ? '#ff995b' :
                            d.properties.puntaje >= 0  ? '#e7692e' :
                                        'rgba(255, 255, 255, 0)';
            })
            .attr("d", path)
            .attr("stroke-width", 0.3)
            .attr("stroke", "#212529")
            .attr('class', 'entidad')
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .on('click', function(d,i){
                let color = d.properties.puntaje > 25 ? '#2eb2e7' :
                            d.properties.puntaje > 20  ? '#73e4ff' :
                            d.properties.puntaje > 15  ? '#aaffff' :
                            d.properties.puntaje > 10  ? '#ffca8a' :
                            d.properties.puntaje > 5  ? '#ff995b' :
                            d.properties.puntaje >= 0  ? '#e7692e' :
                            '#FFF';
                
                let s1 = d.properties.s1 !== "" ? "enabled" : "disabled";
                let s2 = d.properties.s2 !== "" ? "enabled" : "disabled";
                let s3 = d.properties.s3 !== "" ? "enabled" : "disabled";
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
                              <div id="progreso"></div>
                              <p>${d.properties.resumen}</p>
                            </div>
                            <br>
                            <div class="text-center">
                            <small>Sistemas:</small>
                                <br>
                                <a id="s1" class="${s1}" target="_blank" href="${d.properties.s1}"><img class="iconos-sistemas" src="https://plataformadigitalnacional.org/static/media/1_icono.e354d998.svg"></img></a>
                                <a id="s2" class="${s2}" target="_blank" href="${d.properties.s2}"><img class="iconos-sistemas" src="https://plataformadigitalnacional.org/static/media/2_icono.ef41eb28.svg"></img></a>
                                <a id="s3" class="${s3}" target="_blank" href="${d.properties.s3}"><img class="iconos-sistemas" src="https://plataformadigitalnacional.org/static/media/3_icono.a875e0f5.svg"></img></a>
                                <br>
                                <a class="btn btn-secondary btn-sm" href="https://docs.google.com/spreadsheets/d/1E4YkpVl4zhkqA5_Aipq1u1-pBvSc7OXnQ5hZZ2mu9mc/export?format=csv">Descargar CSV</a>
                                <a class="btn btn-secondary btn-sm" href="https://google.com.mx">Descargar Metodología</a>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button class="btn btn-outline-dark btn-sm" type="submit" onclick="modal.close();">Cerrar</button>
                        </div>
                    </div>`,
                    beforeOpen: function(next) {
                        document.getElementById("scroll").style.opacity=0;
                        let bar = new ProgressBar.Circle('#progreso', {
                            color: color,
                            // This has to be the same size as the maximum width to
                            // prevent clipping
                            strokeWidth: 6,
                            trailWidth: 1,
                            easing: 'easeInOut',
                            duration: 1200,
                            text: {
                                autoStyleContainer: false
                            },
                            from: { color: color, width: 1 },
                            to: { color: color, width: 4 },
                            step: function(state, circle) {
                                var value = Math.round(circle.value() * 100);
                                if (value === 0) {
                                circle.setText('');
                                } else {
                                circle.setText(`${d.properties.puntaje}<br><p id="txtSimilitud">${d.properties.similitud}</p>`);
                                }
                            
                            }
                        });
                        bar.text.style.fontSize = '2rem';
                        let puntajeFinal = d.properties.puntaje / 30;
                        bar.animate(puntajeFinal);  // Number from 0.0 to 1.0
                        next();
                    }
                    , beforeClose: function(next) {
                        next();
                    }
                    , afterClose: function() {
                        document.getElementById("scroll").style.opacity=1;
                    }
                    /* , bodyClass: 'modal-open' */
                    /* , dialogClass: 'modal-dialog' */
                    /* , dialogOpenClass: 'animated fadeIn'
                    , dialogCloseClass: 'animated fadeOut' */
                    , escapeClose: true
                });
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

// search the CSSOM for a specific -webkit-keyframe rule
function findKeyframesRule(rule)
    {
        // gather all stylesheets into an array
        var ss = document.styleSheets;

        // loop through the stylesheets
        for (var i = 0; i < ss.length; ++i) {

            // loop through all the rules
            for (var j = 0; j < ss[i].cssRules.length; ++j) {

                // find the -webkit-keyframe rule whose name matches our passed over parameter and return that rule
                if (ss[i].cssRules[j].type == window.CSSRule.WEBKIT_KEYFRAMES_RULE && ss[i].cssRules[j].name == rule)
                    return ss[i].cssRules[j];
            }
        }

        // rule not found
        return null;
    }

// kick things off
init();
