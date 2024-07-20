<template>
  <div>
    <div :id="id" style="height: 400px"></div>
  </div>
</template>

<script>


export default {
  props: {
    block: {
      type: Object,
    },
    json: {},
    columns: {
      default: [],
    },
  },
  data() {
    return {
      latlng: { lat: 0, lng: 0 },
      mapbox: null,
      id: Date.now().toString(),
      data: [],
    };
  },

  async mounted() {
    const CHARTMAT_MAPBOX_AUTH_TOKEN = await this.$axios.$get('/api/getENV/CHARTMAT_MAPBOX_AUTH_TOKEN');

    const vm = this;
    const geoRegex = /-?\d\.?\d*,\s*-?\d+\.?\d*/;
    vm.mapbox = new vm.$mapbox.Map({
      accessToken: CHARTMAT_MAPBOX_AUTH_TOKEN,
      container: vm.id,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [0,0],
      zoom: 13,
    });


    vm.mapbox.on("load", async () => {
    let markerCords = [];
    await Promise.all(
      vm.json
        // Process only records having address
        .filter((marker) => marker[vm.block.axis[0]?.address])
        .map(async (marker) => {
          const address = marker[vm.block.axis[0]?.address];
          let cords;
          let localaddress;
          try {
            if (geoRegex.test(address)) {
              cords = address
                .trim()
                .split(",")
                .map((e) => parseFloat(e));
              cords = cords.reverse();
              const r = await vm.$geocode
                .reverseGeocode({
                  query: cords,
                })
                .send();
              localaddress = r.body?.features[0]?.place_name;
            } else {
              // forward geocord coversion
              const r = await vm.$geocode
                .forwardGeocode({
                  query: address,
                  autocomplete: false,
                  limit: 1,
                })
                .send();
              console.log(r);
              cords = r.body?.features[0]?.geometry?.coordinates;
            }
            // const center = r.body?.features[0]?.center;
            // If cords found, render it to map

            if (cords) {
              markerCords.push(cords);

              // Prepare popup for marker
              const popup = new vm.$mapbox.Popup({
                anchor: "bottom",
                closeButton: false,
                maxWidth: "150px",
              }).setHTML(
                `
             <div>
              <img src='${
                marker[vm.block.axis[0]?.image]
              }' width="100%" height="auto"  style='${
                  !marker[vm.block.axis[0]?.image] ? "display:none" : ""
                }' />
            <p>${marker[vm.block.axis[0]?.title] || ""}</p>
            <p>${marker[vm.block.axis[0]?.description] || ""}</p>
            <p>${localaddress || marker[vm.block.axis[0]?.address] || ""}</p>
            </div>
            `
              );

              // Inject marker with popup to map
              new vm.$mapbox.Marker()
                .setLngLat(cords)
                .setPopup(popup)
                .addTo(vm.mapbox);
            }
          } catch (e) {
            console.error(e);
            // Do nothing at the moment.
          }
        })
    );
    // Setting bounrdy cords
    let { upperRight, bottomLeft } = calculateBounndryCordinates(markerCords);
    // Create a default Marker and add it to the map.

    // reset center
    vm.mapbox.setCenter([
      (bottomLeft[0] + upperRight[0]) / 2, // center of lat
      (bottomLeft[1] + upperRight[1]) / 2, // center of lng
    ]);

    // pan and zoom map
    vm.mapbox.fitBounds([bottomLeft, upperRight], {
      // linear: true,
      maxZoom: 17,
      padding: { top: 40, bottom: 40, left: 40, right: 40 },
    });
    });
  },
};

function calculateBounndryCordinates(markerCords) {
  let ulat = -Infinity;
  let ulng = -Infinity;
  let blat = Infinity;
  let blng = Infinity;
  markerCords.forEach((m) => {
    if (m[0] > ulat) {
      ulat = m[0];
    }
    if (m[0] < blat) {
      blat = m[0];
    }
    if (m[1] > ulng) {
      ulng = m[1];
    }
    if (m[1] < blng) {
      blng = m[1];
    }
  });
  return { upperRight: [ulat, ulng], bottomLeft: [blat, blng] };
}
</script>