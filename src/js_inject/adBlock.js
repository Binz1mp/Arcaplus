const $ = require( "jquery" );
$(document).ready(function() {
  let interval = setInterval(() => {
    if ($("#svQazR5NHC3xCQr3 > ins")?.hasClass('adsbygoogle') === true) {
      $("#svQazR5NHC3xCQr3 > ins").parent().css('display', 'none');
      clearInterval(interval);
    } else if ($("#svQazR5NHC3xCQr3 > a.a-badge.sponsored").text() === "SPONSOR") {
      $("#svQazR5NHC3xCQr3 > ins").parent().css('display', 'none');
      clearInterval(interval);
    }
  }, 500);

  setTimeout(() => {
    if ($("#svQazR5NHC3xCQr3 > ins")?.hasClass('adsbygoogle') !== true) {
      clearInterval(interval);
    }
  }, 5000);
})
