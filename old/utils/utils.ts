import { store } from "@/store";

interface DAMNU_ENABLE {
  [key: string]: any; // 字段扩展声明
}
const _utils = {
  //千帆流式接口js调用demo
  $parseSteamData: (
    url: string,
    access_token: string,
    body: any,
    onMessage: any
  ) => {
    body.stream = true;
    const decoder = new TextDecoder("utf-8");
    let buffer: any = "";
    let dataMsgBuffer = "";
    const processMessage = (reader: any) => {
      reader
        .read()
        .then((content: any) => {
          buffer += decoder.decode(content.value, { stream: !content.done });
          const lines = buffer.split("\n");
          buffer = lines.pop();
          lines.forEach((line: any) => {
            if (line == "") {
              //读取到空行，一个数据块发送完成
              onMessage({
                type: "DATA",
                content: JSON.parse(dataMsgBuffer),
              });
              dataMsgBuffer = "";
              return;
            }
            let [type] = line.split(":", 1);
            let content = line.substring(type.length + 1);
            if (type == "data") {
              //数据块没有收到空行之前放入buffer中
              dataMsgBuffer += content.trim();
            } else if (type == "" && content != "") {
              //服务端发送的注释，用于保证链接不断开
              onMessage({
                type: "COMMENT",
                content: content.trim(),
              });
            } else {
              onMessage({
                type: type,
                content: content.trim(),
              });
            }
          });
          if (!content.done) {
            processMessage(reader);
          } else {
            onMessage({
              type: "END",
            });
          }
        })
        .catch((error: any) => {});
    };
    fetch(`${url}?access_token=${access_token}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(body),
    })
      .then((response: any) => response.body.getReader())
      .then(async (reader) => await processMessage(reader))
      .catch((error) => {
        onMessage({
          type: "ERROR",
          content: "aaaa",
        });
      });
  },
  $objectToUrlString: (query: DAMNU_ENABLE) => {
    let result = "";
    Object.keys(query).forEach((item: string, index: number) => {
      result += (index === 0 ? "?" : "&") + item + "=" + query[item];
    });

    return result;
  },
  $isEmpty: (value: any): boolean =>
    value === "" || (!value && value !== 0) || value === null,
  $isNotEmpty: (value: any): boolean => !_utils.$isEmpty(value),
  $remResizing: (params: any) => {
    let options = Object.assign(
      {
        fontSize: 16,
        baseline: 320,
        threshold: 0,
        basedonnarrow: false,
        basedonwide: false,
        dropoff: false,
        alignCenter: true,
        inward: false,
      },
      params
    );
    const htmlEl = document.getElementsByTagName("html")[0];
    const bodyEl = document.getElementsByTagName("body")[0];

    const windowHeight = window.screen.availHeight;
    const windowWidth = window.screen.availWidth;
    let frontLine = windowWidth;

    const sizeConstraint = function () {
      if (options.basedonnarrow) {
        _utils.$orientationSensor({
          portrait: function () {
            frontLine = window.screen.availWidth;
          },
          landscape: function () {
            frontLine = window.screen.availHeight;
          },
        });
      } else {
        frontLine = window.screen.availWidth;
      }
      var factor = 0;
      if (options.baseline === 0) {
        factor = 1;
      } else if (frontLine <= options.baseline) {
        if (options.inward) {
          factor = frontLine / options.threshold;
        } else {
          factor = frontLine / options.baseline;
        }
      } else if (
        (frontLine > options.baseline && frontLine <= options.threshold) ||
        options.threshold === 0
      ) {
        if (options.threshold >= 0) {
          if (options.inward) {
            factor = frontLine / options.threshold;
          } else {
            factor = frontLine / options.baseline;
          }
        }
        if (options.alignCenter) {
          bodyEl.style.margin = "0";
          bodyEl.style.width = "auto";
        }
      } else if (frontLine > options.threshold) {
        if (options.alignCenter) {
          factor = options.threshold / options.baseline;
          bodyEl.style.margin = "0 auto";
          bodyEl.style.width = options.threshold;
        } else {
          factor = frontLine / options.baseline;
          bodyEl.style.margin = "0";
          bodyEl.style.width = options.threshold;
        }

        if (options.dropoff) {
          htmlEl.style.fontSize = "none";
          return;
        }
      }
      htmlEl.style.fontSize = options.fontSize * factor + "px";

      if (options.dropoff && frontLine > options.threshold) {
        htmlEl.style.fontSize = "";
      }
    };

    if (options.baseline <= 0) {
      options.baseline = 1;
    }
    sizeConstraint();
    window.onresize = () => {
      console.log("==========window.onresize==========");
      sizeConstraint();
    };
  },
  $orientationSensor: (params: any) => {
    let options = Object.assign(
      {
        fontSize: 16,
        baseline: 320,
        threshold: 0,
        basedonnarrow: false,
        basedonwide: false,
        dropoff: false,
        alignCenter: true,
        inward: false,
      },
      params
    );
    const htmlEl = document.getElementsByTagName("html")[0];
    const bodyEl = document.getElementsByTagName("body")[0];

    const windowHeight = window.screen.availHeight;
    const windowWidth = window.screen.availWidth;
    let frontLine = windowWidth;

    const sizeConstraint = function () {
      if (options.basedonnarrow) {
        _utils.$orientationSensor({
          portrait: function () {
            frontLine = window.screen.availWidth;
          },
          landscape: function () {
            frontLine = window.screen.availHeight;
          },
        });
      } else {
        frontLine = window.screen.availWidth;
      }
      var factor = 0;
      if (options.baseline === 0) {
        factor = 1;
      } else if (frontLine <= options.baseline) {
        if (options.inward) {
          factor = frontLine / options.threshold;
        } else {
          factor = frontLine / options.baseline;
        }
      } else if (
        (frontLine > options.baseline && frontLine <= options.threshold) ||
        options.threshold === 0
      ) {
        if (options.threshold >= 0) {
          if (options.inward) {
            factor = frontLine / options.threshold;
          } else {
            factor = frontLine / options.baseline;
          }
        }
        if (options.alignCenter) {
          bodyEl.style.margin = "0";
          bodyEl.style.width = "auto";
        }
      } else if (frontLine > options.threshold) {
        if (options.alignCenter) {
          factor = options.threshold / options.baseline;
          bodyEl.style.margin = "0 auto";
          bodyEl.style.width = options.threshold;
        } else {
          factor = frontLine / options.baseline;
          bodyEl.style.margin = "0";
          bodyEl.style.width = options.threshold;
        }

        if (options.dropoff) {
          htmlEl.style.fontSize = "none";
          return;
        }
      }
      htmlEl.style.fontSize = options.fontSize * factor + "px";

      if (options.dropoff && frontLine > options.threshold) {
        htmlEl.style.fontSize = "";
      }
    };

    if (options.baseline <= 0) {
      options.baseline = 1;
    }
    sizeConstraint();
    // window.onresize = () => {
    //   sizeConstraint();
    // };
  },

  $isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  $isWindows: () => {
    return navigator.platform === "Win32";
  },

  $checkIfWeLink: () => {
    // console.log("navigator++++++", navigator);
    // console.log("navigator.userAgent++++++", navigator.userAgent);
    // console.log("location++++++", location);
    const userAgent = navigator.userAgent;
    const pcWelinkPattern = /cloudlink welink workplace/g;
    const pattern = /HuaWei-AnyOffice/g;
    const weCodeIDEpattern = /WeCodeIDE/g;
    const result =
      pattern.test(userAgent) ||
      pcWelinkPattern.test(userAgent) ||
      weCodeIDEpattern.test(userAgent);

    return result;
  },

  $getUseableUserId: () => {
    const userIdInfo = store.state.user.userIdInfo;
    let result = userIdInfo.welinkUserId;
    if (userIdInfo.guestUserId) {
      result = userIdInfo.guestUserId;
    }
    return result;
  },
} as any;

const result = {
  install(app: any, options: object): any {
    app.config.globalProperties["$isEmpty"] = _utils["$isEmpty"];
    app.config.globalProperties["$isNotEmpty"] = _utils["$isNotEmpty"];
    app.config.globalProperties["$isMobile"] = _utils["$isMobile"];
    app.config.globalProperties["$isWindows"] = _utils["$isWindows"];
    app.config.globalProperties["$remResizing"] = _utils["$remResizing"];
    app.config.globalProperties["$orientationSensor"] =
      _utils["$orientationSensor"];
    app.config.globalProperties["$wenxinworkshopChatCompletionsRequest"] =
      _utils["$wenxinworkshopChatCompletionsRequest"];
    app.config.globalProperties["$checkIfWeLink"] = _utils["$checkIfWeLink"];
    app.config.globalProperties["$getUseableUserId"] =
      _utils["$getUseableUserId"];
  },
} as any;

export default result;
export const utils = _utils;
