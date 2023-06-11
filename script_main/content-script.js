$(document).ready(function() { // 베라, 핫딜 제외
  if (window.location.href.indexOf("arca.live/b/") > -1 &&
  window.location.href.indexOf("arca.live/b/live") === -1 &&
  window.location.href.indexOf("arca.live/b/hotdeal") === -1
  ) {
    const listRateCheck = () => { // 추천 체크
      const postList = document.querySelectorAll('a.vrow.column'); // 게시글 리스트
      for (let i = 0; i< postList.length; i++) {
        if (postList[i].querySelector('.vcol.col-rate') && postList[i].className == 'vrow column') {
          let postList_rate = postList[i].querySelector('.vcol.col-rate').innerText; // 추천
          if (postList_rate < 0) {
            postList[i].style.opacity = '0.1';
          // } else if (postList_rate > 3) {
          //   postList[i].style.fontWeight = 'bold';
          // }
        }
      }
    }

    const createReloader = $(`<li><span id="Arcaplus_reloader" class=""></span></li>`);
    createReloader.prependTo($('.nav-control'));
    const reloaderElem = document.querySelector("#Arcaplus_reloader");
    if (localStorage.getItem("isReload") == "true") {
      reloaderElem.setAttribute("class", "reloadOn");
    } else if (localStorage.getItem("isReload") == "false") {
      reloaderElem.setAttribute("class", "");
    }
    reloaderElem.addEventListener("click", function() {
      if (localStorage.getItem("isReload") == "true") {
        localStorage.setItem("isReload", "false");
        reloaderElem.setAttribute("class", "");
        clearInterval(reloadTimer);
      } else if (localStorage.getItem("isReload") == "false") {
        localStorage.setItem("isReload", "true");
        reloaderElem.setAttribute("class", "reloadOn");
        reloadTimer = setInterval(reloadFunc, 5000);
      }
    })
    const reloadFunc = async () => {
      if (localStorage.getItem("isReload") == "true") {
        $.get(window.location.href, function(data) {
          $('.list-table.table')
            .replaceWith(new DOMParser()
              .parseFromString(data, "text/html")
              .querySelector(".list-table.table")
            );
          listRateCheck();
        })
        console.log('리로드')
      }
    };
    reloadTimer = setInterval(reloadFunc, 5000);
    listRateCheck();
  }
})