import MapPage from 'pages/OpenLayersMapPage.vue'
import Vue from 'vue'
import VueResource from 'vue-resource'
import '../css/style.css'
import 'jquery/dist/jquery.slim.min'
import 'bootstrap/dist/js/bootstrap.min'

Vue.use(VueResource);

new Vue({
    el: '#map-page',
    render: mp => mp(MapPage)
})