const $ = require( "jquery" );
require("jquery-ui/ui/widgets/draggable");

function b64DecodeUnicode(str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  const binString = atob(str);
  const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
  return new TextDecoder().decode(bytes);
}
// base64 to string
$(document).ready(function() {
  if (
    window.location.href.indexOf("arca.live/b/") > -1
  ) {
    let isDecoded = false;
    let decodedCount = 0;
    let decodedText = ""; // 지역 함수에서 선언한 텍스트를 끌어오기 위한 전역 변수
    let tooltipState = 0; // 툴팁의 현재 상태. 0 없음 1 있음
    let isTooltipHovering = false; // 툴팁 위에 마우스가 올라와있는지에 대한 상태 변수.
    let base64Format = /^[a-zA-Z0-9+/\r\n]+={0,2}$/;
    /*
      base64 정규식. 근데 다른문자도 포함함...
      base64 문자열을 더블클릭해서 선택했을 때, '=' pad 값이 없어도 일단 인식하게 만들어놓았기 때문.
    */

    
    $(document).mouseup((e) => { 
      setTimeout(() => {
        let targetText = window.getSelection().toString();
        // let targetText = e.target.innerText;
        if (targetText.trim() !== "" && !targetText.includes(' ')) {
          if (base64Format.test(targetText)) {
            if (window.getSelection && $('#Arcaplus_tooltip').length === 0) {
              decodedText = b64DecodeUnicode(targetText.trim());
              $('html').append(`
                <div id="Arcaplus_tooltip">
                  <div id="Arcaplus_tooltipContainer">          
                    <div id="Arcaplus_tooltipText">변환하기</div>
                  </div>
                </div>
              `);
              $('#Arcaplus_tooltip').draggable();
              tooltipState = 1;
              $('#Arcaplus_tooltip').css("top", e.pageY + -50 + "px");
              $('#Arcaplus_tooltip').css("left", e.pageX + "px");
            }
          }
        }
      }, 250);
    });
    $(document).mousedown(() => {
      if (isTooltipHovering === false) {
        if ($('#Arcaplus_tooltip').length) {
          cleanTooltip('Arcaplus_tooltip');
        }
        decodedText = "";
        tooltipState = 0;
      }
    });
    
    // 동적 생성 객체 클릭 이벤트
    // let isDecoded = false;
    $(document).on("click", '#Arcaplus_tooltipText', () => {
      decodedCount++;
      isTooltipHovering = true;
      tooltipState = 1;
      let isURL = false;
      while (base64Format.test(decodedText)) { // 다중 base64 decode
        if (decodedText !== b64DecodeUnicode(decodedText)) {
          decodedCount++;
          decodedText = b64DecodeUnicode(decodedText);
          $('#Arcaplus_tooltipText').empty();
          for (let i = 0; i < decodedText.split('\n').filter(line => line.trim() !== '').length; i++) {
            try {
              url = new URL(decodedText);
              $('#Arcaplus_tooltipText').append(`
              <a
                href="${decodedText.split('\n').filter(line => line.trim() !== '')[i]}"
                target="_blank"
              >
                ${decodedText.split('\n').filter(line => line.trim() !== '')[i]}
              </a>
            `);
            } catch {
              $('#Arcaplus_tooltipText').append(`
                <div>${decodedText.split('\n').filter(line => line.trim() !== '')[i]}</div>
              `);
            }
          }
          try {
            url = new URL(decodedText);
            isURL = true;
            $('#Arcaplus_tooltipTextHover').append('<div id="Arcaplus_tooltipTextHoverGoto">이동하기</div>');
          } catch (_) {}
          isDecoded = true;
          console.log('while');
        }
      }
      if (base64Format.test(decodedText) === false && isDecoded === false) {
        $('#Arcaplus_tooltipText').empty();
        for (let i = 0; i < decodedText.split('\n').filter(line => line.trim() !== '').length; i++) {
          try {
            url = new URL(decodedText);
            $('#Arcaplus_tooltipText').append(`
            <a
              href="${decodedText.split('\n').filter(line => line.trim() !== '')[i]}"
              target="_blank"
            >
              ${decodedText.split('\n').filter(line => line.trim() !== '')[i]}
            </a>
          `);
          } catch {
            $('#Arcaplus_tooltipText').append(`
              <div>${decodedText.split('\n').filter(line => line.trim() !== '')[i]}</div>
            `);
          }
        }
        try {
          url = new URL(decodedText);
          isURL = true;
          $('#Arcaplus_tooltipTextHover').append('<div id="Arcaplus_tooltipTextHoverGoto">이동하기</div>');
        } catch (_) {}
        isDecoded = true;
      }
      if (isDecoded === false) {
        console.log('isDecoded');
        $('#Arcaplus_tooltipText').text(decodedText);
        isDecoded = true;
      }
      console.log(`${decodedCount}번 decode한 결과 =`, decodedText.split('\n').filter(line => line.trim() !== ''));
      $('#Arcaplus_tooltipContainer').append(`
        <div id="Arcaplus_tooltipTextHover">
          <div id="Arcaplus_tooltipTextHoverCopy">복사하기</div>
        </div>
        <input type="text" id="Arcaplus_tooltipTextTemp"></input>
      `);
    });
    
    
    $(document).on("click", '#Arcaplus_tooltipTextHoverCopy', () => {
      copyText(decodedText);
    });
    $(document).on("click", '#Arcaplus_tooltipTextHoverGoto', () => {
      gotoURL(decodedText);
    });
    
    $(document).on("mouseover", '#Arcaplus_tooltip', () => {
      isTooltipHovering = true;
    });
    $(document).on("mouseleave", '#Arcaplus_tooltip', () => {
      isTooltipHovering = false;
    });
    
    // 툴팁을 삭제한다.
    function cleanTooltip (id) {
      $(`#${id}`).remove();
      window.getSelection().removeAllRanges();
      isTooltipHovering = false;
      tooltipState = 0;
      parsedText = "";
      decodedCount = 0;
      isURL = false;
      isDecoded = false;
      // isDecoded = false;
    }
    // 디코드한 텍스트를 복사한다.
    // url 링크면 그냥 이동시키려고 했는데, 그냥 선택권을 주기로 했음.
    function copyText (text) {
      isTooltipHovering = true;
      if (tooltipState === 1) {
        $('#Arcaplus_tooltipTextTemp').css("visibility", "visible");
        $('#Arcaplus_tooltipTextTemp').val(text);
        $('#Arcaplus_tooltipTextTemp').select();
        document.execCommand('copy');
        $('#Arcaplus_tooltipTextTemp').css("visibility", "hidden");
      }
      cleanTooltip('Arcaplus_tooltip');
    }
    function gotoURL (url) {
      isTooltipHovering = true;
      if (tooltipState === 1) {
        window.open(url, "_blank");
      }
      cleanTooltip('Arcaplus_tooltip');
    }
  }
});
