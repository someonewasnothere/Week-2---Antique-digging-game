const plots = document.querySelectorAll('.plot');
const selectedAction=null;
let gold = 0;
const prices ={
    small:{sell: 10},
    medium:{sell: 20},
    large:{sell: 50},
}

let inventory ={
    smallFossils:0,
    mediumFossils:0,
    largeFossils:0,
}

/*DIGGING PLOTS TECH + LEVELS*/
plots.forEach(plot =>{
    plot.addEventListener('click', () =>{
        if (plot.classList.contains('fully-dug')){
             return;
        }
           
        let layers_left= parseInt(plot.getAttribute('data-layer'));
        layers_left-= 1
        plot.classList.add('dug');
        plot.setAttribute('data-layer',layers_left);

        plot.classList.remove('layer-2', 'layer-1', 'fully-dug');

        if (layers_left===2){
            plot.classList.add('layer-2');
        } else if (layers_left=== 1){
            plot.classList.add('layer-1');
        } else if (layers_left === 0){
            plot.classList.add('fully-dug')
        }   


    });
});

