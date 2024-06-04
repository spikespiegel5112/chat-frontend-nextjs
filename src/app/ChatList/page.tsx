'use client'
import React, { useState, useEffect } from "react";
import styles from "./page.module.scss";
import { Button } from "antd";
import utils from "@/utils/utils";
import { getChatListRequest } from "@/requests/chat";

export default function ChatList() {
  useEffect(() => {
    //  模拟componentDidMount  首次渲染
    console.log("use effect");
  }, []); // 空数组必须写s
  return (
    <main className={styles.chatlist_container}>
      <div className={styles.header}>
        <h1>
          <div className="logo"></div>
        </h1>
        <div className="right">
          <Button type="primary">新的对话</Button>
        </div>
      </div>
      <div className="scroller">
        <ul className="chatlist">
          <li
            className="{ active: item.active }"
            v-for="(item, index) in currentChatList"
          >
            <div className="top">
              <label></label>
              <Button
                className={styles.delete}
                size="small"
                type="link"
              ></Button>
            </div>

            <div className="desc">
              <span className="right"></span>
            </div>
          </li>
        </ul>
      </div>
    </main>
  );

  const getChatList = () => {
    getChatListRequest(params)
      .then((response: any) => {
        console.log("getChatListPromise+++++", response);
        const chatList = response.data.map((item: any, index: number) => {
          return Object.assign(item, {
            updatedAt: utils
              .moment(item.updatedAt)
              .format("yyyy/MM/DD HH:mm:ss"),
          });
        });

        global.$store.commit("app/updateCurrentChatList", chatList);

        state.chatList = chatList;
        state.loadingChatListFlag = false;

        resolve(response.data);
      })
      .catch((error: any) => {
        state.loadingChatListFlag = false;
        reject(error);
      });
  };
}
