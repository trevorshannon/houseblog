/**
 * The AngularJS controller for the blog
 *
 * Image resizing
 * sips -Z 1000 img/*.jpg -s formatOptions 100
 */

var blogApp = angular.module('blogApp', ['ngSanitize', 'ngTouch']);

blogApp.controller('BlogController', function($scope) {
  $scope.posts = formatPosts(posts);  
  $scope.showingMenu = false;
  
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
   * Tries to scroll at arrow presses; escape exits overlay.
   * 
   * @param {Object} event The keydown event object.
   */
  $scope.scrollOverlayKey = function(event) {
    if ($scope.showOverlay) {
      var key = event.which;
  	  if (event.which == 37) {
        // Backwards key
        $scope.scrollOverlay('right');
      } else if (event.which == 39) {
        // Forwards key
        $scope.scrollOverlay('left');
      } else if (event.which == 27) {
        // Escape key pressed
        $scope.showOverlay = false;
  	  }
  	}
  };
  
  /**
   * Scrolls to the next or previous image if possible.
   * 
   * @param {String} direction The direction of the swipe
   */
  $scope.scrollOverlay = function(direction) {
  	if (direction == 'right') {
  		if ($scope.overlayIndex[1] > 0) {
          var image = $scope.posts[$scope.overlayIndex[0]].images[$scope.overlayIndex[1]-1]
          $scope.overlayImage = image.url;
          $scope.overlayCaption = image.caption;
          $scope.overlayIndex = image.index;
        }
  	} else {
  		var images = $scope.posts[$scope.overlayIndex[0]].images;
   	    if ($scope.overlayIndex[1] < images.length - 1) {
          var image = images[$scope.overlayIndex[1]+1]
          $scope.overlayImage = image.url;
          $scope.overlayCaption = image.caption;
          $scope.overlayIndex = image.index;
        }
  	}
  };
  
  /**
   * Formats the posts by adding indices & doing work that no human should
   * have to do.
   *
   * @param {Object} posts the Posts to add indices to.
   */
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

blogApp.controller('PostController', function($scope) {
    $scope.selectors = [];
    $scope.addText = "Add image";

    $scope.addFile = function() {
	$scope.selectors.push($scope.selectors.length);
        if ($scope.selectors.length > 0) {
            $scope.addText = "Add another image";
        }
    }

    $scope.removeFile = function() {
        $scope.selectors.pop();
        if ($scope.selectors.length == 0) {
            $scope.addText = "Add image";
	}
    }
});