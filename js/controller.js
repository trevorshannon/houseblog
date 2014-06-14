/**
 * The AngularJS controller for the blog
 *
 * SETUP ON THE PI:
 * sips -Z 1000 img/*.jpg -s formatOptions 100
 * scp * pi@10.1.10.12:/var/www/house
 */

var blogApp = angular.module('blogApp', ['ngSanitize']);

blogApp.controller('BlogController', function($scope) {
  $scope.posts = formatPosts(posts);  
  
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

  /**
   * Creates an image overlay with the given image.
   *
   * @param {Object} Image an image object
   */
  $scope.overlay = function(image) {
  	$scope.showOverlay = true;
  	$scope.overlayImage = image.url;
  	$scope.overlayCaption = image.caption;
  	$scope.overlayIndex = image.index;
  };
  
  /**
   * Called whenever the user presses a key during the image overlay.
   * Scrolls to the next or previous image if possible, escape exits overlay.
   * 
   * @param {Object} event The keydown event object.
   */
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
  };
  
  function formatPosts(posts) {
    for (var i = 0; i < posts.length; i++) {
      posts[i].index = i;
      for (var j = 0; j < posts[i].images.length; j++) {
      	posts[i].images[j].index = [i,j];
      }
    }
    return posts;
  };
});