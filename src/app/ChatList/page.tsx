"use client";
import React, { useState, useEffect } from "react";
import "./page.scss";
import { Button } from "antd";
import utils from "@/utils/utils";
import { getChatListRequest, createChatRequest } from "@/requests/chat";

export default function ChatList() {
  const [loadingChatListFlag, setLoadingChatListFlag] = useState(false);
  const [chatList, setChatList] = useState([] as any);
  const [processingFlag, setProcessingFlag] = useState(false);
  const [chosenChatIndex, setChosenChatIndex] = useState(0);
  const [chosenChatId, setChosenChatid] = useState(null);

  const getChatListPromise = () => {
    setLoadingChatListFlag(true);
    return new Promise((resolve, reject) => {
      // const params = utils.$checkIfWeLink()
      //   ? {
      //       welinkUserId: global.$store.state.user.userIdInfo.welinkUserId,
      //     }
      //   : {
      //       guestUserId: global.$store.state.user.userIdInfo.guestUserId,
      //     };
      getChatListRequest({
        guestUserId: 123,
      })
        .then((response: any) => {
          console.log("getChatListPromise+++++", response);
          const chatList = response.data.map((item: any, index: number) => {
            return Object.assign(item, {
              updatedAt: utils
                .$moment(item.updatedAt)
                .format("yyyy/MM/DD HH:mm:ss"),
            });
          });

          // global.$store.commit("app/updateCurrentChatList", chatList);

          setChatList(chatList);
          setLoadingChatListFlag(false);

          resolve(response.data);
        })
        .catch((error: any) => {
          setLoadingChatListFlag(false);
          reject(error);
        });
    });
  };

  const getChatList = () => {
    getChatListPromise();
  };

  const handleCreateChatPromise = () => {
    return new Promise((resolve, reject) => {
      createChatRequest({
        title: "",
        welinkUserId: "",
        guestUserId: 123,
      })
        .then(async (response: any) => {
          resolve(response);
        })
        .catch((error: any) => {
          console.log(error);
          reject(error);
        });
    });
  };

  const handleCreateChat = async () => {
    setProcessingFlag(true);

    await handleCreateChatPromise();
    await getChatListPromise();

    chooseLastChat();
    setProcessingFlag(false);
  };

  const chooseLastChat = () => {
    highLightLastChat();
    const lastChatDataIndex = chatList.length > 0 ? chatList.length - 1 : 0;
    handleChooseChat(chatList[lastChatDataIndex], lastChatDataIndex);
  };

  const highLightLastChat = () => {
    const lastChatDataIndex = chatList.length > 0 ? chatList.length - 1 : 0;
    highLightChat(lastChatDataIndex);
  };

  const handleChooseChat = (item: any, index: number) => {
    console.log("handleChooseChat++++++", item);
    setChosenChatIndex(index);
    highLightChat(index);
  };

  const highLightChat = (index: number) => {
    setChatList(
      chatList.map((item2: any, index2: number) => {
        const activeFlag = index === index2;
        if (activeFlag) {
          setChosenChatid(item2.chatId);
        }
        return Object.assign(item2, {
          active: activeFlag,
        });
      })
    );
  };

  useEffect(() => {
    //  模拟componentDidMount  首次渲染
    console.log("use effect");
    getChatList();
    let fontSize = 30;
    utils.$remResizing({
      baseline: 320,
      fontSize: fontSize,
      threshold: 640,
    });
  }, []);
  return (
    <main className="chatlist_container">
      <div className="header">
        <h1>
          <div className="logo"></div>
        </h1>
        <div className="right">
          <Button type="primary" onClick={() => handleCreateChat()}>
            新的对话
          </Button>
        </div>
      </div>
      <div className="scroller">
        <ul className="chatlist">
          {chatList.map((item: any, index: number) => {
            return (
              <li className={item.active ? "active" : ""} key={index}>
                <div className="top">
                  <label>
                    {utils.$isEmpty(item.title) ? "新的聊天" : item.title}
                  </label>
                  <Button className="delete" size="small" type="link"></Button>
                </div>

                <div className="desc">
                  <span className="right"></span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
