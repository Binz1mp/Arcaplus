const dayjs = require('dayjs');
const $ = require( "jquery" );
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone'); // dependent on utc plugin
const isToday = require('dayjs/plugin/isToday')
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isToday);

$(document).ready(function() {
  if (window.location.href.indexOf("arca.live/b/") > -1 && // 베라, 핫딜 제외
  window.location.href.indexOf("arca.live/b/live") === -1 &&
  window.location.href.indexOf("arca.live/b/hotdeal") === -1
  ) {
    const listRateCheck = () => { // 추천 체크
      const postList = document.querySelectorAll('a.vrow.column'); // 게시글 리스트
      for (let i = 0; i< postList.length; i++) {
        if (postList[i].querySelector('time') !== null) {
          let postList_rate = postList[i].querySelector('.vcol.col-rate').innerText; // 추천
          let postList_time = postList[i].querySelector('time').getAttribute('datetime'); // 작성 시간
          let tzKr = "Asia/Seoul"; // 시간대
          let postTime = dayjs(postList_time).tz(tzKr);
          // 추천 비율이 0 미만이면 게시글 투명도 0.1로
          if (postList_rate < 0) {
            postList[i].style.opacity = '0.1';
          }
          // 새로고침시 게시글 작성 시간도 다시 나오게
          if (dayjs(postList_time).tz(tzKr).isToday()) {
            postList[i].querySelector('time').innerText = postTime.format('HH:mm'); // 오늘
          } else {
            postList[i].querySelector('time').innerText = postTime.format('YYYY.MM.DD'); // 과거
          }
          // 새로고침시 썸네일도 다시 나오게
          if (postList[i].querySelector('img')) {
            $(postList[i].querySelector('noscript')).replaceWith(postList[i].querySelector('img'));
          }
        }
      }
    }



    const createReloader = $(`<li><span id="Arcaplus_reloader" class=""><div id="Arcaplus_spin"></div></span></li>`);
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
      } else {
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
        console.log('리로드');
      }
    };
    reloadTimer = setInterval(reloadFunc, 5000);
    listRateCheck();
  };
});