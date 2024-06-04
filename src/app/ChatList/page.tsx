import styles from "./page.module.scss";

export default function ChatList() {
  return (
    <main className={styles.chatlist_container}>
      <div className="header">
        <h1>
          <div className="logo"></div>
        </h1>
        <div className="right">
          {/* <a-button
          @click="handleCreateChat"
          :icon="h(PlusOutlined)"
          :disabled="state.processingFlag"
          type="primary"
        >
          新的对话
        </a-button> */}
        </div>
      </div>
    </main>
  );
}
