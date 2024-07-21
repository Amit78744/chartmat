import mapbox from 'mapbox-gl/dist/mapbox-gl';
import axios from 'axios';
// import mapbox from '!mapbox-gl';

const mbxClient = require('@mapbox/mapbox-sdk')
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding')

export default async function ({ $axios,$config }, inject) {
    const CHARTMAT_MAPBOX_AUTH_TOKEN = await axios.get('/api/getENV/CHARTMAT_MAPBOX_AUTH_TOKEN');
    const baseClient = new mbxClient({ accessToken: CHARTMAT_MAPBOX_AUTH_TOKEN.data })
    const geocodeClient = mbxGeoCoding(baseClient)
    inject('geocode', geocodeClient)
    inject('mapbox', mapbox)
}