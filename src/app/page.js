"use client";

import { useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

export default function Home() {
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [stores, setStores] = useState([]);
  const [autocomplete, setAutocomplete] = useState(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"],
    });

    loader.load().then(() => {
      const google = window.google;

      const mapInstance = new google.maps.Map(
        document.getElementById("google-map"),
        {
          zoom: 3,
          center: { lat: 20, lng: 0 },
        }
      );

      setMap(mapInstance);
      setInfoWindow(new google.maps.InfoWindow());

      fetch("/stores.json")
        .then((response) => response.json())
        .then((data) => {
          setStores(data.features);
          data.features.forEach((store) => {
            const { coordinates } = store.geometry;
            const lat = coordinates[1];
            const lng = coordinates[0];
            const storeName = store.properties.name;
            const storeDescription = store.properties.description;
            const storeTiming = store.properties.timing;

            const marker = new google.maps.Marker({
              position: { lat, lng },
              map: mapInstance,
              title: storeName,
            });

            marker.addListener("click", () => {
              handleMarkerClick(
                marker,
                storeName,
                storeTiming,
                storeDescription,
                lat,
                lng
              );
            });

            store.marker = marker;
            store.lat = lat;
            store.lng = lng;
          });
        });

      const autocompleteInstance = new google.maps.places.Autocomplete(
        document.getElementById("search-bar")
      );
      autocompleteInstance.addListener("place_changed", () => {
        const place = autocompleteInstance.getPlace();
        if (place.geometry) {
          mapInstance.panTo(place.geometry.location);
          mapInstance.setZoom(15);
        }
      });
      setAutocomplete(autocompleteInstance);
    });
  }, []);

  const handleMarkerClick = async (
    marker,
    storeName,
    storeDescription,
    storeTiming,
    lat,
    lng
  ) => {
    if (map) {
      const targetLatLng = new google.maps.LatLng(lat, lng);
      map.panTo(targetLatLng);
      const content = `
        <div class="info-window m-2">
          <h3 class="font-bold text-lg">${storeName}</h3>
          <p class="italic mb-2">${storeDescription}</p>
          <p class="font-medium">${storeTiming}</p>
        </div>`;

      infoWindow.setContent(content);
      infoWindow.open(map, marker);
    } else {
      console.log("map instance not initialized", map);
    }
  };

  return (
    <div className="md:h-screen md:overflow-hidden">
      {/* Navbr Starts  */}
      <nav className="flex items-center justify-between flex-wrap bg-white p-6 shadow-md sticky">
        <div className="flex items-center flex-shrink-0  mr-6">
          <span className="font-semibold text-xl tracking-tight">
            📍 Storelocator
          </span>
        </div>
        <div>
          <a
            href="#"
            className="inline-block text-sm px-4 py-2 leading-none border rounded text-orange-500 border-orange-500 hover:border-transparent hover:text-white hover:bg-black mt-4 lg:mt-0"
          >
            Sign In
          </a>
        </div>
      </nav>
      {/* Navbr Ends  */}

      {/* Store Locator Starts  */}
      <div className="bg-gray-100 h-screen">
        <div className=" py-7 text-center">
          <h3 className="text-2xl font-extrabold">
            📌 Store Locator - Find Store near you
          </h3>
        </div>
        <div className=" flex md:flex h-screen">
          <div className="w-full md:w-[30%] bg-gray-100 p-4 h-[73%] overflow-auto">
            <div className="mb-4 ">
              <input
                id="search-bar"
                type="text"
                placeholder="Find a Store"
                className="w-full px-3 py-3 border rounded shadow-md "
              />
            </div>
            <ul className="space-y-4">
              {stores.map((store) => (
                <li
                  key={store.properties.name}
                  onClick={() => {
                    handleMarkerClick(
                      store.marker,
                      store.properties.name,
                      store.properties.description,
                      store.properties.timing,
                      store.lat,
                      store.lng
                    );
                  }}
                  className="cursor-pointer hover:bg-gray-200 p-2 rounded bg-white border-2 hover:border-orange-500 delay-75"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {store.properties.name}
                      </h2>
                      <p className="text-sm font-medium my-2">
                        Timing:{" "}
                        <span className="font-normal">
                          {store.properties.timing}
                        </span>
                      </p>
                    </div>
                    <div className="mr-5 text-xs font-semibold bg-green-300 px-2 py-1 rounded-md">
                      Open Now
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-[70%] order-first md:order-last">
            <div id="google-map" className="w-full h-[73%]"></div>
          </div>
        </div>
      </div>
      {/* Store Locator Ends  */}
    </div>
  );
}
