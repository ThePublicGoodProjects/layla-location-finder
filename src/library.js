import Vue from 'vue'
import GoogleMap from "./components/GoogleMap";
import * as VueGoogleMaps from "vue2-google-maps";

Vue.use(VueGoogleMaps, {
    load: {
        key      : process.env.VUE_APP_MAP_KEY,
        libraries: "places" // necessary for places input
    }
});
Vue.config.productionTip = false;

const Components = {
    GoogleMap
};

Object.keys(Components).forEach(name => {
    Vue.component(name, Components[name]);
});

export default Components;