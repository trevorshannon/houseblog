/**
 * The AngularJS controller for the blog
 *
 * SETUP ON THE PI:
 * sips -Z 1000 img/*.jpg -s formatOptions 100
 * scp * pi@10.1.10.12:/var/www/house
 */

var blogApp = angular.module('blogApp', ['ngSanitize']);

blogApp.controller('BlogController', function($scope) {
  $scope.posts = posts;
  
  
  /**
   * Gets the Mon, Day string from a timestamp
   * @param {Integer} Timestamp representing a date
   * @return {String} String representing the date
   */
  $scope.getDateString = function(date) {
    var options = {year: "numeric", month: "long", day: "numeric"};
    var d = new Date(date);
    return d.toLocaleDateString("en-US", options);
  };
    
  $scope.overlay = function(image) {
  	$scope.showOverlay = true;
  	$scope.overlayImage = image.url;
  	$scope.overlayCaption = image.caption;
  	$scope.overlayIndex = image.index;
  };
  
  $scope.scrollOverlay = function(event) {
    if ($scope.showOverlay) {
      var key = event.which;
  	  if (event.which == 37) {
        // Backwards key
        // TODO: some method of indexing!
        if ($scope.overlayIndex[1] > 0) {
          var image = $scope.posts[$scope.overlayIndex[0]].images[$scope.overlayIndex[1]-1]
          $scope.overlayImage = image.url;
          $scope.overlayCaption = image.caption;
          $scope.overlayIndex = image.index;
        }
      } else if (event.which == 39) {
        // Forwards key
        var images = $scope.posts[$scope.overlayIndex[0]].images;
   	    if ($scope.overlayIndex[1] < images.length - 1) {
          var image = images[$scope.overlayIndex[1]+1]
          $scope.overlayImage = image.url;
          $scope.overlayCaption = image.caption;
          $scope.overlayIndex = image.index;
        }
      } else if (event.which == 27) {
        // Escape key pressed
        $scope.showOverlay = false;
  	  }
  	}
  }
});