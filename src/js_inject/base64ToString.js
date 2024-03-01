var $ = require( "jquery" );

// base64 to string
$(document).ready(function() {
  if (
    window.location.href.indexOf("arca.live/b/piracy/") > -1 ||
    window.location.href.indexOf("arca.live/b/simya/") > -1
  ) {
    let decodedText = ""; // 지역 함수에서 선언한 텍스트를 끌어오기 위한 전역 변수
    let tooltipState = 0; // 툴팁의 현재 상태.
    /*
      0 = 툴팁이 없음.
      1 = 툴팁이 있음.
    */
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
              decodedText = atob(targetText.trim());
              $('html').append(`
                <div id="Arcaplus_tooltip">
                  <div id="Arcaplus_tooltipContainer">          
                    <div id="Arcaplus_tooltipText">변환하기</div>
                    <div id="Arcaplus_tooltipTextHover">
                      <div id="Arcaplus_tooltipTextHoverCopy">복사하기</div>
                    </div>
                    <input type="text" id="Arcaplus_tooltipTextTemp"></input>
                  </div>
                </div>
              `);
              $('#Arcaplus_tooltip').draggable();
              tooltipState = 1;
              try {
                url = new URL(decodedText);
                $('#Arcaplus_tooltipTextHover').append('<div id="Arcaplus_tooltipTextHoverGoto">이동하기</div>')
              } catch (_) {}
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
      isTooltipHovering = true;
      tooltipState = 1;
      console.log('decodedText ===', decodedText);
      // if (isDecoded !== true) {
        $('#Arcaplus_tooltipText').text(decodedText);
        // isDecoded = true;
      // } else {
        // $('#Arcaplus_tooltipText').text(btoa(decodedText));
        // isDecoded = false;
      // }
      // copyText(decodedText);
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
