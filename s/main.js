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

// animations CSS
function animateCSS(element, animationName, callback) {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
}


d3.json("mexico.json")
    .then(function(data) {
        mexico = data;
        fetch('https://sheets.googleapis.com/v4/spreadsheets/1E4YkpVl4zhkqA5_Aipq1u1-pBvSc7OXnQ5hZZ2mu9mc/values/datos?key=AIzaSyDrvQehuVTPGJVCFVx3FUeAq2zqYbTCFDo')
        .then(function(response) {
            return response.json();
        })
        .then(function(jsonHugo) {
            jsonHugo.values.shift();
            //console.log(jsonHugo);
            mexico.objects.collection.geometries.forEach(function(element){
                jsonHugo.values.forEach(function(newElement) {
                    if(parseInt(element.properties.clave)===parseInt(newElement[1])){
                        element.properties.puntaje=parseInt(newElement[28]);
                        element.properties.similitud=newElement[29];
                        element.properties.resumen=newElement[2];
                        element.properties.s1=newElement[30];
                        element.properties.s2=newElement[31];
                        element.properties.s3p=newElement[32];
                        element.properties.s3sp=newElement[33];
                        element.properties.nombre=newElement[0];
                        // bases
                        element.properties.baseLegend=newElement[34];
                        element.properties.baseLink=newElement[35];
                        
                        element.properties.s6=newElement[36];
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
                /* .attr("xlink:href", function(d) { return "https://"+ "abc"[d[1] % 3] +".basemaps.cartocdn.com/rastertiles/voyager_nolabels/"+d[2]+"/"+d[0]+"/"+d[1]+"@2x.png"; }) */
                .attr("xlink:href", function(d) { return "https://cartodb-basemaps-"+ "abc"[d[1] % 3] + ".global.ssl.fastly.net/light_nolabels/"+ d[2] +"/"+ + d[0] +"/"+ d[1] + "@2x.png"; })
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
                .attr("stroke-width", 0.6)
                .attr("stroke-opacity", 1)
                .attr("fill-opacity",0)
                .attr("stroke", "#666666")
                .attr("d", path);

            // MUY PARECIDOS - PASO 2
            map.append("g").attr('id', 'step-2').attr('opacity', 0)
                .selectAll("path")
                .data(topojson.feature(mexico, mexico.objects.collection).features)
                .join("path")
                .attr("fill", function(d,i){
                    return d.properties.puntaje > 25 ? '#6e8396' :
                            d.properties.puntaje > 20  ? '#a8bed0' :
                            d.properties.puntaje > 15  ? '#dfebf4' :
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
            .attr("fill", function(d){
                /* return color(i); */
                return d.properties.puntaje > 15  ? 'rgba(255, 255, 255, 0)' :
                        d.properties.puntaje > 10  ? '#ffd1ca' :
                        d.properties.puntaje > 5  ? '#f08e88' :
                        d.properties.puntaje >= 0  ? '#944b4f' :
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
            .attr("fill", function(d){
                return d.properties.puntaje > 25 ? '#6e8396' :
                            d.properties.puntaje > 20  ? '#a8bed0' :
                            d.properties.puntaje > 15  ? '#dfebf4' :
                            d.properties.puntaje > 10  ? '#ffd1ca' :
                            d.properties.puntaje > 5  ? '#f08e88' :
                            d.properties.puntaje >= 0  ? '#944b4f' :
                                        'rgba(255, 255, 255, 0)';
            })
            .attr("d", path)
            .attr("stroke-width", 0.3)
            .attr("stroke", "#212529")
            .attr('class', 'entidad')
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .on('click', function(d){
                let color = d.properties.puntaje > 25 ? '#6e8396' :
                            d.properties.puntaje > 20  ? '#a8bed0' :
                            d.properties.puntaje > 15  ? '#dfebf4' :
                            d.properties.puntaje > 10  ? '#ffd1ca' :
                            d.properties.puntaje > 5  ? '#f08e88' :
                            d.properties.puntaje >= 0  ? '#944b4f' :
                            '#FFF';
                
                let s1 = (d.properties.s1 !== undefined && d.properties.s1 !== "") ? "enabled" : "disabled";
                let s2 = (d.properties.s2 !== undefined && d.properties.s2 !== "") ? "enabled" : "disabled";

                let s3p = (d.properties.s3p !== undefined && d.properties.s3p !== "") ? "enabled" : "disabled";
                let s3sp = (d.properties.s3sp !== undefined && d.properties.s3sp !== "") ? "enabled" : "disabled";

                let s6 = (d.properties.s6 !== undefined && d.properties.s6 !== "") ? "enabled" : "disabled";

                let bases = (d.properties.baseLegend !== undefined && d.properties.baseLegend !== "") ? "flex" : "none";
                
                let modal = new RModal(document.getElementById('modal'), {
                    content:
                    `<div class="modal-content">
                        <div class="modal-header" style="background-color: ${color};">
                            <h2 style="color: #fff;"><strong>${d.properties.nombre}</strong></h2>
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
                                <br><br>
                                <a id="s1" class="${s1}" target="_blank" href="${d.properties.s1}"><img class="iconos-sistemas" src="img/s1.svg"></img></a>
                                <a id="s2" class="${s2}" target="_blank" href="${d.properties.s2}"><img class="iconos-sistemas" src="img/s2.svg"></img></a>
                                <a id="s3" class="${s3p}" target="_blank" href="${d.properties.s3p}"><img class="iconos-sistemas" src="img/s3Particulares.svg"></img></a>
                                <a id="s3" class="${s3sp}" target="_blank" href="${d.properties.s3sp}"><img class="iconos-sistemas" src="img/s3ServidoresPublicos.svg"></img></a>
                                <a id="s6" class="${s6}" target="_blank" href="${d.properties.s6}"><img class="iconos-sistemas" src="img/s6.svg"></img></a>
                            </div>
                            <div style="display: ${bases}; justify-content: center; margin-top: 15px;">
                                <br><br>
                                <a id="basesLiga" style="background-color: ${color}; color: #fff" type="button" class="btn" target="_blank" href="${d.properties.baseLink}" role="button">
                                <span style="padding: 6px 12px;"><img width="20px" alt="normatividad" src="img/icon-normatividad.svg"></span>
                                ${d.properties.baseLegend}
                                </a>
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
            /* document.querySelector("canvas.particles-js-canvas-el").style.zIndex = -1; */
            animateCSS('canvas.particles-js-canvas-el', 'bounceOutDown', function() {
                document.querySelector("canvas.particles-js-canvas-el").style.zIndex = -1;
                document.querySelector(".d3-tip").style.zIndex = 5;
                document.getElementById("masInfo").style.display = "block";
                document.getElementById("descargas").style.display = "block";
                animateCSS('#masInfo', 'bounceIn')
                animateCSS('#descargas', 'bounceIn')
                map.select('#step-4').transition().duration(1500).attr('opacity', 0.75).attr('shape-rendering', 'geometricPrecision')
            })
        }
        map.select('#step-'+stepAnterior).transition().duration(1500).attr('opacity', 0)
        map.select('#step-'+response.index).transition().duration(1500).attr('opacity', 0.75).attr('shape-rendering', 'geometricPrecision')
        /* animateCSS('#step-'+response.index, 'bounceIn'); */
    };
    if (response.direction == 'up') {
        /* if (response.index === 3) {
            animateCSS('#masInfo', 'bounceOut', function() {
                document.querySelector('#masInfo').style.display = "none";
                document.querySelector('#masInfo').classList.remove('animated', 'bounceOut')
            })
            animateCSS('#descargas', 'bounceOut', function() {
                document.querySelector('#descargas').style.display = "none";
                document.querySelector('#descargas').classList.remove('animated', 'bounceOut')
            })
        } */
        if (response.index === 4) {
            /* document.querySelector("canvas.particles-js-canvas-el").style.zIndex = 2; */
            /* animateCSS('canvas.particles-js-canvas-el', 'bounceOutDown'); */
            document.querySelector(".d3-tip").style.zIndex = -1;
            animateCSS('#masInfo', 'bounceOut', function() {
                document.querySelector('#masInfo').style.display = "none";
                document.querySelector('#masInfo').classList.remove('animated', 'bounceOut')
            })
            animateCSS('#descargas', 'bounceOut', function() {
                document.querySelector('#descargas').style.display = "none";
                document.querySelector('#descargas').classList.remove('animated', 'bounceOut')
            })
            document.querySelector("canvas.particles-js-canvas-el").style.zIndex = 2;
            animateCSS('canvas.particles-js-canvas-el', 'bounceInDown')

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


/* ---- particles.js config ---- */

particlesJS("sticky", {
    "particles": {
        "number": {
            "value": 40,
        },
        "color": {
            "value": ["#34b3eb", "#ffe01b"]
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0.5,
                "color": "#666666"
            },
            "polygon": {
                "nb_sides": 5
            }
            
        },
        "opacity": {
            "value": 0.3551164387345227,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 10,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 30,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#666666",
            "opacity": 0.3,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 4,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "bubble"
            },
            "onclick": {
                "enable": true,
                "mode": "repulse"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 10,
                "duration": 1,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
});
