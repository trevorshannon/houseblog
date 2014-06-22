/**
 * The AngularJS controller for the blog
 *
 * Image resizing
 * sips -Z 1000 img/*.jpg -s formatOptions 100
 */


//TODO(katie): This $sceDelegateProvider doesn't seem to work...
var blogApp = angular.module('blogApp', ['ngSanitize', 'ngTouch']).config(function($sceDelegateProvider) {
     $sceDelegateProvider.resourceUrlWhitelist([
       // Allow same origin resource loads.
       'self',
       // Allow loading from our assets domain.  Notice the difference between * and **.
       'http://www.youtube.com/**']);
     });

/**
 * Gets the Mon, Day string from a timestamp
 * @param {Integer} Timestamp representing a date
 * @return {String} String representing the date
 */
function getDateString(date) {
  var options = {year: "numeric", month: "long", day: "numeric"};
  var d = new Date(date);
  return d.toLocaleDateString("en-US", options);
};

blogApp.controller('BlogController', function($scope, $sce) {
  $scope.posts = formatPosts(posts);  
  $scope.showingMenu = false;
  

  $scope.getDateString = function(date) {
    return getDateString(date);
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
      //TODO(katie): Figure out whitelisting then remove this line.
      posts[i].contents = $sce.trustAsHtml(posts[i].contents)
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
    $scope.authorValue = "Katie";

    var UPLOAD_LIMIT = 20;

    function blankImage() {
	this.filename = "";
        this.caption = "";
    }

    $scope.addFile = function() {
        if ($scope.selectors.length >= UPLOAD_LIMIT) {
            return;
        }
        $scope.selectors.push(new blankImage());
        if ($scope.selectors.length >= UPLOAD_LIMIT) {
            $scope.addText = "Upload limit reached";
        } else{
            $scope.addText = "Add another image";
        }
        $scope.savePost();
    }

    $scope.removeFile = function() {
        if ($scope.selectors.length == UPLOAD_LIMIT) {
            $scope.addText = "Add another image";
        }
        $scope.selectors.pop();
        if ($scope.selectors.length == 0) {
            $scope.addText = "Add image";
	}
        $scope.savePost();
    }

    $scope.getCurrentDateString = function() {
	return getDateString(Date.now());
    };

    $scope.previewContent = function(content) {
        return content.replace(/\n/g, "<br>")
    }

    $scope.savePost = function() {
        localStorage.title = $scope.titleValue;
        localStorage.content = $scope.contentValue;
        localStorage.author = $scope.authorValue;
        localStorage.selectors = JSON.stringify($scope.selectors);
    }

    $scope.loadLastPost = function() {
        $scope.titleValue = localStorage.title;
        $scope.contentValue = localStorage.content;
        $scope.authorValue = localStorage.author;
        $scope.selectors = JSON.parse(localStorage.selectors);
    }
});