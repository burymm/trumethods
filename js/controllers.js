angular.module('app.controllers', ['ionic'])

.factory('Podcasts', function() {

})

.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $ionicLoading, $ionicPopup, $ionicActionSheet, $timeout, $cordovaFile) {

	$ionicLoading.show({
	  template: 'Loading...'
	});

	var isOffline = 'onLine' in navigator && !navigator.onLine;

	setTimeout(function() {
		navigator.splashscreen.hide();
		if( isOffline ) {
			$ionicLoading.hide();
			$ionicPopup.alert({
			     title: 'Uh oh!',
			     template: 'You are currently offline.'
			});
		}

	},3000);

	window.addEventListener('message', function(event) {

	    if( event.data.message === 'download' ) {


			$ionicActionSheet.show({
					 buttons: [
					   { text: 'Download' }
					 ],
					 titleText: 'Podcast',
					 cancelText: 'Cancel',
					 buttonClicked: function(index) {

						console.log('file: ' + event.data.url);
						console.log('id: ' + event.data.id);
						console.log('title: ' + event.data.title);
						console.log('excerpt: ' + event.data.excerpt);
						console.log('thumb: ' + event.data.thumb);

						var filename = event.data.url.split("/").pop();

						download_file( event.data.url, filename, event.data.id, event.data.title, event.data.excerpt, event.data.thumb );


						return true;
					 }
			});

			$scope.$apply();

	    }


	    if( event.data.message === 'play' ) {

		 	console.log(event.data.url);
		 	window.open(event.data.url, '_blank', 'location=no,closebuttoncaption=Close,enableViewportScale=yes');

	    }


	   if( event.data.message === 'loaded' ) {
		 	console.log('loaded');
		 	$ionicLoading.hide();
	    }

	   if( event.data.message === 'terms' ) {
	   		$scope.openTermsModal();
	    }


	}, false);


	function download_file(url, filename, id, title, excerpt, thumb) {

		var data = JSON.parse( localStorage.getItem('pods') );

		if(data){
			var arrayLength = data.length;

			for (var i = 0; i < arrayLength; i++) {

				if(data[i]['filename'] === filename) {
					console.log(data[i]['filename']);
					return false;
				}

			}

			targetFrame = window.frames['receiver'];
			targetFrame.postMessage( {message: 'downloadStarted', id: id}, '*');
	    }

		$cordovaFile.downloadFile( encodeURI(url), window.rootFS.nativeURL + filename, true )
			.then(function(result) {

				targetFrame = window.frames['receiver'];
				targetFrame.postMessage( {message: 'downloadComplete', id: id}, '*');

				var r = {
					url: url,
					nativeUrl: result.nativeURL,
					filename: filename,
					id: id,
					title: title,
					excerpt: excerpt,
					thumb: thumb
				}

				if(data){
					data.push(r);
					localStorage.setItem( 'pods', JSON.stringify( data ) );
				} else {
					data = [r];
					localStorage.setItem( 'pods', JSON.stringify( data ) );
				}

				console.log( JSON.parse( localStorage.getItem('pods') ) );


			   var alertPopup = $ionicPopup.alert({
			     title: 'Download',
			     template: title + ' has been downloaded!'
			   });
			   alertPopup.then(function(res) {
			   });


			}, function(err) {
			  //console.log(err);
			}, function (progress) {
			  //console.log(progress);
		});

	}

		// terms pop modal
	$ionicModal.fromTemplateUrl('templates/termsmodal.html', {
	  	scope: $scope,
	  	animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.termsmodal = modal;
		$scope.modalClass = 'terms-modal';
	});

	$scope.openTermsModal = function() {
		$scope.termsmodal.show();
	};
	$scope.closeTermsModal = function() {
		$scope.termsmodal.hide();
	};
	$scope.$on('$destroy', function() {
		$scope.termsmodal.remove();

	});


})

.controller('PlaylistsCtrl', function($scope, $rootScope, $http, $ionicModal, $ionicActionSheet, $ionicPopup, $cordovaFile, Podcasts) {

	// pods modal
	$ionicModal.fromTemplateUrl('templates/modal.html', {
	  	scope: $scope,
	  	animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
		$scope.modalClass = 'pod-modal';

		$scope.playPod = function( url ) {
			console.log(url);
			window.open( url, '_blank', 'location=no,closebuttoncaption=Close,enableViewportScale=yes');
		}

	});

	$scope.openModal = function(id) {
		$scope.modal.show();
		$scope.pods = JSON.parse( localStorage.getItem('pods') );
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};
	$scope.$on('$destroy', function() {
		$scope.modal.remove();

	});


	// user pop modal
	$ionicModal.fromTemplateUrl('templates/usermodal.html', {
	  	scope: $scope,
	  	animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.usermodal = modal;
		$scope.modalClass = 'user-modal';
	});

	$scope.openUserModal = function(id) {
		$scope.usermodal.show();
	};
	$scope.closeUserModal = function() {
		$scope.usermodal.hide();
	};
	$scope.$on('$destroy', function() {
		$scope.usermodal.remove();
		$scope.pods = '';

	});

	$scope.logOut = function() {

		$ionicActionSheet.show({
				 buttons: [
				   { text: 'Log Out' }
				 ],
				 titleText: 'Logout?',
				 cancelText: 'Cancel',
				 buttonClicked: function(index) {

					 logOUT();
					 return true;

				 }
		});

	}

	var logOUT = function() {
		console.log('logout');
		targetFrame = window.frames['receiver'];
		targetFrame.postMessage( {message: 'logout'}, '*');

	}


	$scope.refresh = function() {

		targetFrame = window.frames['receiver'];
		target.reload();

	}

	window.addEventListener('message', function(event) {

	    if( event.data.message === 'loggedin' ) {

			setTimeout( function() {
				console.log('loggedin');
				$scope.loggedin = true;
				$scope.user = 'Logged in as ' + event.data.user;
			 	$scope.$apply();
			}, 500);

	    }

	    if( event.data.message === 'loggedout' ) {

			setTimeout( function() {
				document.getElementById('receiver').src = document.getElementById('receiver').src;
			}, 500);

			setTimeout( function() {
				$scope.loggedin = false;
				$scope.user = '';
				$scope.usermodal.hide();
			}, 2000);

	    }

	}, false);

	$scope.deletePod = function( id, fileUrl ){


		$ionicActionSheet.show({
				 buttons: [
				   { text: 'Delete' }
				 ],
				 titleText: 'Sure you want to delete this?',
				 cancelText: 'Cancel',
				 buttonClicked: function(index) {
					 deleteItem( id, fileUrl );
					 return true;

				 }
		});

	}

	var deleteItem = function( index, fileUrl ) {


		$cordovaFile.removeFile( encodeURI(fileUrl) ).then(function(result) {
		  	console.log('deleted');

			var data = JSON.parse( localStorage.getItem('pods') );

			data.splice(index, 1);

			localStorage.setItem( 'pods', JSON.stringify( data ) );

			$scope.pods.splice(index, 1);


  		}, function(err) {
  			$ionicPopup.alert({
			     title: 'Uh oh!',
			     template: 'Error deleting your file!'
			});
  		});



	}

});