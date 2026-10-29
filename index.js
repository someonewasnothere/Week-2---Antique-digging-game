const plots = document.querySelectorAll('.plot');

/*DIGGING PLOTS TECH*/
plots.forEach(plot =>{
    plot.addEventListener('click', () =>{
        if (plot.classList.contains('dug')){
             return;
        }
           
        let layers_left= parseInt(plot.getAttribute('data-layer'));
        layers_left--
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