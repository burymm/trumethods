var appVersion = '1.2';
var app = angular.module('app', ['ionic','app.controllers', 'ngCordova'])

.run(function($ionicPlatform) {

	if( localStorage.getItem('version') !== appVersion ) {
		localStorage.removeItem('pods');
		localStorage.setItem( 'version', appVersion );
	}

	$ionicPlatform.ready(function() {
        // hide status bar
        if (window.StatusBar) {
            StatusBar.overlaysWebView(true);
            StatusBar.styleHex('#ff370f');
        }
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }

	});

})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state('app.podcasts', {
      url: "/podcasts",
      views: {
        'menuContent' :{
          templateUrl: "templates/podcasts.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })

    .state('app.single', {
      url: "/detail",
      views: {
        'menuContent' :{
          templateUrl: "templates/detail.html",
          controller: 'PlaylistCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/podcasts');

});