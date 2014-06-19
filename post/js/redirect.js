var redirect = true;

function goToPost() {
    console.log("redirecting (maybe)");
    if (redirect) {
      window.location = '../index.html';
    }
}

function cancelRedirect() {
    redirect = false;
    console.log("redirect cancelled");
}

function loadHandler() {
    console.log("page loaded");
    window.setTimeout(goToPost, 4000);
}
