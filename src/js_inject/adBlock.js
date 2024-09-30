const $ = require('jquery');
function blockLog(text) { console.log(`%c:: ARCAPLUS :: ${text}`, 'background: #690000; color: white; display: block;'); };
function allowLog(text) { console.log(`%c:: ARCAPLUS :: ${text}`, 'background: #bada55; color: black; display: block;'); };

// 백그라운드 스크립트에서 가져온 메세지를 사용한다.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'logBlock') { // 차단된 네트워크 캐치
    blockLog(`Blocked: ${message.ruleId} ${message.url}`);
    if ( // 사이드바 광고
      $('.sticky-container .ad').length > 0
      // || $('.sticky-container > .ad > img').attr('src').includes('empty')
    ) {
      $('.sticky-container .ad.fold').remove();
      blockLog('기본적으로 사이드바 광고를 제거합니다.');
      $('.sticky-container .ad').remove();
    }
    if ( // 배너 광고 - 메인 페이지
      $('.board-summary .ad iframe').length > 0
      // || $('.board-summary > .ad > img')?.attr('src').includes('empty')
    ) {
      blockLog('기본적으로 메인 페이지 배너 광고를 제거합니다.');
      $('.board-summary .ad').remove();
    }
    if ( // 배너 광고 - 채널 페이지
      $('.board-article-list .ad iframe').length > 0
      // || $('.board-article-list > .ad > img')?.attr('src').includes('empty')
    ) {
      blockLog('챈붕이가 만들지 않은 배너 광고를 제거합니다.');
      $('.board-article-list .ad').remove();
    }
  } else if (message.type === 'logAllow') { // 허용된 네트워크 캐치
    if (message.ruleId === 1) { // 아카라이브 웹소켓
      allowLog('최근 게시글 기록을 삭제했습니다. (개발자 도구 - Application - Local storage - recent_articles)');
      localStorage.removeItem('recent_articles');
    }
  }
});