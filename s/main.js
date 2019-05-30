// see Observable US Map https://observablehq.com/@d3/u-s-map

let projection = d3.geoMercator()
    .scale(1400)
    .center([-102.34034978813841, 24.012062015793]);
let path = d3.geoPath(projection);
//var projection = d3.geoAlbersUsa().scale(1280).translate([480, 300]); // use this if you have lon,lat
let map = d3.select('#mexico');
let color = d3.scaleOrdinal(d3.schemeSet3);
let color2 = d3.scaleOrdinal(d3.schemePastel2);
let mexico;
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
            map.append('path').attr('id', 'step-all')
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('d', path(topojson.feature(mexico, mexico.objects.collection)));
            /* var states_filter = function(a, b){return (a !== b);} */
            /* map.append('path').attr('id', 'step-0').attr('opacity', 0)
                .attr('stroke-width', 0.5).attr('vector-effect','non-scaling-stroke')
                .attr('d', path(topojson.mesh(mexico, mexico.objects.collection))); */
                // for `topojson.mesh` see also https://github.com/topojson/topojson-client/blob/master/README.md#mesh
            /* var counties_filter = function(a, b) { return (a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0)); }; */
            map.append('path').attr('id', 'step-1')
                .attr('stroke', '#aaa').attr('opacity', 0)
                .attr('stroke-width', 0.5).attr('vector-effect','non-scaling-stroke')
                .attr('d', path(topojson.mesh(mexico, mexico.objects.collection )));
            map.append("g").attr('id', 'step-2').attr('opacity', 0)
            .selectAll("path")
            .data(topojson.feature(mexico, mexico.objects.collection).features)
            .join("path")
                .attr("fill", function(d,i){return color2(i);})
                .attr("d", path);
            map.append("g").attr('id', 'step-3').attr('opacity', 0)
            .selectAll("path")
            .data(topojson.feature(mexico, mexico.objects.collection).features)
            .join("path")
                .attr("fill", function(d,i){return color(i);})
                .attr("d", path);
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
    if (response.direction == 'down') map.select('#step-'+response.index).attr('opacity', 1);
}

function handleStepExit(response) {
    // response = { element, direction, index }
    console.log(response.index, '-------- exit');
    // remove color from current step
    response.element.classList.remove('is-active');
    // hide corresponding map step if scrolling up
    if (response.direction == 'up') map.select('#step-'+response.index).attr('opacity', 0);
}

function handleStepProgress(response) {
    // response = { element, progress, index }
    console.log(response.index, '-------- progress -', response.progress);
}

function init() {
    // set random padding for different step heights (not required)
    steps.forEach(function (step) {
        let v = 100 + Math.floor(Math.random() * window.innerHeight / 4);
        // step.style.padding = v + 'px 0px';
        step.style.height = '300px';
    });

    // 1. setup the scroller with the bare-bones options
    // this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller.setup({
        step: '.scroll__text .step',
        debug: true,
        offset: 0.2,
        // progress: true,
    })
        .onStepEnter(handleStepEnter)
        .onStepExit(handleStepExit)
        // .onStepProgress(handleStepProgress)

    // setup resize event
    window.addEventListener('resize', scroller.resize);
}

// kick things off
init();

