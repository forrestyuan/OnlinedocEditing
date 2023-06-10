import React, { useRef, useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import "./App.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import quillEmoji from "quill-emoji";
import "quill-emoji/dist/quill-emoji.css";
import { debounce } from "lodash";

const { EmojiBlot, ShortNameEmoji, ToolbarEmoji, TextAreaEmoji } = quillEmoji;
ReactQuill.Quill.register(
  {
    "formats/emoji": EmojiBlot,
    "modules/emoji-shortname": ShortNameEmoji,
    "modules/emoji-toolbar": ToolbarEmoji,
    "modules/emoji-textarea": TextAreaEmoji, //复制粘贴组件
  },
  true
);
// 自定义工具栏
const modules = {
  toolbar: {
    container: [
      [{ size: ["small", false, "large", "huge"] }], //字体设置
      ["bold", "italic", "underline", "strike"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"], // a链接和图片的显示
      [{ align: [] }],
      [
        {
          background: [
            "rgb(  0,   0,   0)",
            "rgb(230,   0,   0)",
            "rgb(255, 153,   0)",
            "rgb(255, 255,   0)",
            "rgb(  0, 138,   0)",
            "rgb(  0, 102, 204)",
            "rgb(153,  51, 255)",
            "rgb(255, 255, 255)",
            "rgb(250, 204, 204)",
            "rgb(255, 235, 204)",
            "rgb(255, 255, 204)",
            "rgb(204, 232, 204)",
            "rgb(204, 224, 245)",
            "rgb(235, 214, 255)",
            "rgb(187, 187, 187)",
            "rgb(240, 102, 102)",
            "rgb(255, 194, 102)",
            "rgb(255, 255, 102)",
            "rgb(102, 185, 102)",
            "rgb(102, 163, 224)",
            "rgb(194, 133, 255)",
            "rgb(136, 136, 136)",
            "rgb(161,   0,   0)",
            "rgb(178, 107,   0)",
            "rgb(178, 178,   0)",
            "rgb(  0,  97,   0)",
            "rgb(  0,  71, 178)",
            "rgb(107,  36, 178)",
            "rgb( 68,  68,  68)",
            "rgb( 92,   0,   0)",
            "rgb(102,  61,   0)",
            "rgb(102, 102,   0)",
            "rgb(  0,  55,   0)",
            "rgb(  0,  41, 102)",
            "rgb( 61,  20,  10)",
          ],
        },
      ],
      [
        {
          color: [
            "rgb(  0,   0,   0)",
            "rgb(230,   0,   0)",
            "rgb(255, 153,   0)",
            "rgb(255, 255,   0)",
            "rgb(  0, 138,   0)",
            "rgb(  0, 102, 204)",
            "rgb(153,  51, 255)",
            "rgb(255, 255, 255)",
            "rgb(250, 204, 204)",
            "rgb(255, 235, 204)",
            "rgb(255, 255, 204)",
            "rgb(204, 232, 204)",
            "rgb(204, 224, 245)",
            "rgb(235, 214, 255)",
            "rgb(187, 187, 187)",
            "rgb(240, 102, 102)",
            "rgb(255, 194, 102)",
            "rgb(255, 255, 102)",
            "rgb(102, 185, 102)",
            "rgb(102, 163, 224)",
            "rgb(194, 133, 255)",
            "rgb(136, 136, 136)",
            "rgb(161,   0,   0)",
            "rgb(178, 107,   0)",
            "rgb(178, 178,   0)",
            "rgb(  0,  97,   0)",
            "rgb(  0,  71, 178)",
            "rgb(107,  36, 178)",
            "rgb( 68,  68,  68)",
            "rgb( 92,   0,   0)",
            "rgb(102,  61,   0)",
            "rgb(102, 102,   0)",
            "rgb(  0,  55,   0)",
            "rgb(  0,  41, 102)",
            "rgb( 61,  20,  10)",
          ],
        },
      ],
      ["clean"],
      ["emoji"],
    ],
  },
  "emoji-toolbar": true,
  "emoji-textarea": true,
  "emoji-shortname": true,
};
function App() {
  const [text, setText] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState("");
  const [curUser, setCurUser] = useState("");

  const socketRef = useRef<Socket>();

  useEffect(() => {
    socketRef.current = io("http://localhost:3333");
    socketRef.current.on("text", (newText: string) => {
      setText(newText);
    });
    socketRef.current.on("users", (newUsers: string[]) => {
      setUsers(newUsers);
    });
    socketRef.current.on("editing", (userId: string) => {
      setEditingUser(userId);
    });
    socketRef.current.on("connectUser", (userId: string) => {
      setCurUser(userId);
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleTextChange = debounce((newText: string) => {
    socketRef.current?.emit("editing", curUser);
    socketRef.current?.emit("text", newText);
  }, 500);
  const handleBlur = () => {
    setEditingUser("");
    socketRef.current?.emit("editing", "");
  };

  return (
    <div className="app">
      <div className="header">
        <h1>在线文档协作编辑</h1>
        <div>
          <span>作者：forrest酱</span>&nbsp;&nbsp;&nbsp;&nbsp;
          <span>
            掘金主页：
            <a href="https://juejin.cn/user/3421335917699335/posts">
              https://juejin.cn/user/3421335917699335/posts
            </a>
          </span>
        </div>
      </div>
      <div className="container">
        <div className="user-list">
          <p>当前在线用户:</p>
          <ul>
            {users.map((user, index) => (
              <li key={index} className={user === editingUser ? "editing" : ""}>
                {user.substring(0, user.length / 2)}
              </li>
            ))}
          </ul>
        </div>
        <div className="editor">
          <ReactQuill
            value={text}
            onChange={handleTextChange}
            onBlur={handleBlur}
            modules={modules}
            placeholder="在这里开始你的远程协作办公吧"
            preserveWhitespace
          />
        </div>
      </div>
    </div>
  );
}
export default App;
