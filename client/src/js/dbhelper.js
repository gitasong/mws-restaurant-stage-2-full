'use strict';
import idb from 'idb';

/**
 * Common database helper functions.
 */
export default class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Opens and creates database
  */
  static openDatabase() {
    return idb.open('restaurants', 1, function(upgradeDB) {
      switch(upgradeDB.oldVersion) {
        case 0:
          // placeholder
        case 1:
          console.log('Creating restaurants store');
          upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
      }
    });
  }

  /**
   * Fetch all restaurants.
   */
  // static serveRestaurants(callback) {
  //   let xhr = new XMLHttpRequest();
  //   xhr.open('GET', DBHelper.DATABASE_URL);
  //   xhr.onload = () => {
  //     if (xhr.status === 200) { // Got a success response from server!
  //       const json = JSON.parse(xhr.responseText);
  //       const restaurants = json.restaurants;
  //       callback(null, restaurants);
  //     } else { // Oops!. Got an error from server.
  //       const error = (`Request failed. Returned status of ${xhr.status}`);
  //       callback(error, null);
  //     }
  //   };
  //   xhr.send();
  // }

  /**
   * Fetch restaurants from database if present; from server otherwise
   */
  static routeRestaurants() {
    DBHelper.populateDatabase();  // FIXME: doesn't resturn anything (including a database), so getRestaruants() is going to be undefined?
    DBHelper.getRestaurants()
    .then((restaurants) => {
      if (restaurants) {
        console.log('Displaying restaurants from database');
        return restaurants;  // in array format
      } else {
        console.log('Displaying restaurants from server');
        DBHelper.serveRestaurants();  // in JSON format
      }
    });
  }

  static serveRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL)
    .then(response => {
      if (response.ok) return response.json();
      throw new Error(`Request failed. Returned status of ${error}.`);
    }).then((data) => {
      const restaurants = data;  // in JSON format?
      console.log('Restaurants from server: ', restaurants);
      callback(null, restaurants);
    })
    .catch((error) => {
      callback(error, null);  // FIXME: getting "Uncaught (in promise) TypeError: callback is not a function"
    });
  }

  static populateDatabase() {
    // fetch all restaurants with proper error handling.
    const dbPromise = DBHelper.openDatabase();
    // const restaurants = DBHelper.serveRestaurants();
    dbPromise.then(function(db) {
      const tx = db.transaction('restaurants', 'readwrite');
      const restaurantStore = tx.objectStore('restaurants');

      return Promise.all(
        restaurants.map(function(restaurant) {
          console.log('Adding restaurant: ', restaurant);
          return restaurantStore.put(restaurant);
        })
      ).then(function(result) {
        console.log('Result from populateDatabase: ', result);
      }).catch(function(error) {
        tx.abort();
        console.log(error);
      }).then(function() {
        console.log('All items added successfully!');  // TODO:  Fix location of success message, because it will fire even on transaction abort
      });
    });
  }

  static getRestaurants() {
    // get all restaurants from database
    const dbPromise = DBHelper.openDatabase();

    return dbPromise.then(function(db) {
      var tx = db.transaction('restaurants', 'readonly');
      var restaurantStore = tx.objectStore('restaurants');
      return restaurantStore.getAll();  // returns an array
    }).then((restaurants) => console.log('Fetching restaurants from database', restaurants)
    ).catch((error) => console.error('Error fetching restaurants from database', error));
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.routeRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.routeRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.routeRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.routeRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.routeRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.routeRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (!restaurant.photograph) return (`/img/${restaurant.id}.jpg`);
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}
