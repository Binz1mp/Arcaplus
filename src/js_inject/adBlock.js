const $ = require( "jquery" );
$(document).ready(function() {
  let interval = setInterval(() => {
    if ($("#svQazR5NHC3xCQr3 > ins")?.hasClass('adsbygoogle') === true) {
      $("#svQazR5NHC3xCQr3").attr('style', 'display: none;');
      clearInterval(interval);
    } else if ($("#svQazR5NHC3xCQr3 > a.a-badge.sponsored").text() === "SPONSOR") {
      $("#svQazR5NHC3xCQr3").attr('style', 'display: none;');
      clearInterval(interval);
    } else if ($("#svQazR5NHC3xCQr3 > div.vm-placement").length > 0) {
      console.log('$("#svQazR5NHC3xCQr3 > div.vm-placement") ===', $("#svQazR5NHC3xCQr3 > div.vm-placement"))
      $("#svQazR5NHC3xCQr3").attr('style', 'display: none;');
    }
    $(".sticky-container > .ad").attr('style', 'display: none;');
  }, 2500);

  setTimeout(() => {
    if ($("#svQazR5NHC3xCQr3 > ins")?.hasClass('adsbygoogle') !== true) {
      clearInterval(interval);
    }
  }, 5000);
})
