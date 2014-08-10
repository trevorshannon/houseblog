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

blogApp.controller('BlogController', function($scope, $sce, $location) {
  $scope.posts = formatPosts(posts);  
  $scope.showingMenu = false;
  
  // number of posts per page
  $scope.numPosts = 3;
  loadPostIndices();
  
  /**
   * Loads the indices of the current post from the URL.
   */
  function loadPostIndices() {
  	var params = $location.search();
  	if (params.start && params.end) {
  	  $scope.startPost = params.start;
  	  $scope.endPost = params.end;
  	} else {
      $scope.endPost = posts.length;
      $scope.startPost = $scope.endPost - $scope.numPosts;
    }
  }
  
  /**
   * Navigates to earlier posts.
   */
  $scope.showEarlierPosts = function() {
    $scope.endPost = Math.max($scope.numPosts, $scope.startPost);
    $scope.startPost = Math.max(0, $scope.startPost - $scope.numPosts);
    $scope.loadPosts($scope.startPost, $scope.endPost);
  };
  
  /**
   * Navigates to more recent posts.
   */
  $scope.showLaterPosts = function() {
    $scope.startPost = Math.min(posts.length - $scope.numPosts, $scope.startPost + $scope.numPosts);
    $scope.endPost = Math.min(posts.length, $scope.startPost + $scope.numPosts);
    $scope.loadPosts($scope.startPost, $scope.endPost);
  };
  
  /**
   * Updates the URL to load a set of posts
   * @param {int} start The start index
   * @param {int} end The end index
   */
  $scope.loadPosts = function(start, end, fromIndex) {
  	var url = $location.absUrl();
  	var urlParts = url.split('#')[0].split('/')
  	var base = urlParts.slice(0, urlParts.length - 1).join('/');
	$location.search() == {};
    $location.search({'start': start, 'end': end});
  	window.location.href = base + '/index.html#' + $location.url();
  	if (fromIndex) {
  	  window.location.reload(true);
  	}
  }
  
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
      //TODO(katie): Figure out whitelisting for videos then remove this line.
      posts[i].contents = $sce.trustAsHtml(posts[i].contents)
      for (var j = 0; j < posts[i].images.length; j++) {
      	posts[i].images[j].index = [i,j];
      }
    }
    return posts;
  };
  
});


/**
 * Angular JS controller for online posting tool
 * 
 */
blogApp.controller('PostController', function($scope) {
    $scope.selectors = [];
    $scope.addText = "Add image";
    // TODO(trevor): put array of authors in js
    $scope.authorValue = "Katie";
    $scope.showLoadingOverlay = false;
    
    // maximum possible images to upload.  matches setting in php.ini
    var UPLOAD_LIMIT = 20;

    /**
     * Generates a new image object
     */
    function blankImage() {
	this.filename = "";
        this.caption = "";
    }

    /**
     * Returns an empty string for undefined inputs
     *
     * @param {String} s The string to clean up
     * TODO (trevor): make it work
     */
    function clean(s) {
        if (s === undefined){
            return '';
	}
        return s;
    }

    /**
     * Adds a blank file to the internal
     * array of files.  The actual file data gets populated when the user
     * selcts a file (usually a post image) with the HTML form input. 
     */
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

    /**
     * Removes the last file from the internal array of files.
     * 
     */
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

    /**
     * Moves the given file up (to a lower index) in the internal 
     * array of files.
     *
     * @param {int} i The file to move up
     */
    $scope.moveFileUp = function(i) {
        if (i > 0) {
	    var thisItem = $scope.selectors.splice(i, 1)[0];
            $scope.selectors.splice(i-1, 0, thisItem);
	}
    }

    /**
     * Moves the given file down (to a higher index) in the internal 
     * array of files.
     *
     * @param {int} i The file to move down
     */
    $scope.moveFileDown = function(i) {
        if (i < $scope.selectors.length - 1) {
	    var thisItem = $scope.selectors.splice(i, 1)[0];
            $scope.selectors.splice(i+1, 0, thisItem);
        }
    }

    /**
     * Returns the current date as a human-readable string
     */
    $scope.getCurrentDateString = function() {
	return getDateString(Date.now());
    };

    /**
     * Returns an string with formatted for HTML display
     *
     * @param {String} content The string to format
     */
    $scope.previewContent = function(content) {
        return content.replace(/\n/g, "<br>")
    }

    /**
     * Saves current post being written to HTML5 local storage
     */
    $scope.savePost = function() {
        localStorage.title = $scope.titleValue;
        localStorage.content = $scope.contentValue;
        localStorage.author = $scope.authorValue;
        localStorage.selectors = JSON.stringify($scope.selectors);
    }

    /**
     * Loads post data from HTML5 local storage
     */
    $scope.loadLastPost = function() {
        $scope.titleValue = clean(localStorage.title);
	$scope.contentValue = clean(localStorage.content);
	$scope.authorValue = clean(localStorage.author);
        $scope.selectors = JSON.parse(localStorage.selectors);
    }

});