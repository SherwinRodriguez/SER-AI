"use client";

import React, { useState } from "react";
import { assets } from "../assets/assets";
import Image from "next/image";
import { userAppContext } from "@/contents/AppContext";
import toast from "react-hot-toast";

const Promtbox = ({ setIsLoading, isLoading }) => {
  const [promt, setPromt] = useState("");
  const { user, chats, setChats, selectedChat, setSelectedChat } = userAppContext();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPromt(e);
    }
  };

  const sendPromt = async (e) => {
    e.preventDefault();

    if (!promt.trim()) return;

    const currentPrompt = promt;
    setIsLoading(true);

    const userMessage = {
      role: "user",
      content: currentPrompt,
      timestampss: Date.now(),
    };

    setSelectedChat((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat._id === selectedChat._id
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );

    setPromt("");

    try {
      const res = await fetch("/api/chat/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promt: currentPrompt,
          chatId: selectedChat._id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const aiMessage = {
          role: "assistant",
          content: data.data.content,
          timestampss: Date.now(),
        };

        setSelectedChat((prev) => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
        }));

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id
              ? { ...chat, messages: [...chat.messages, aiMessage] }
              : chat
          )
        );
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    toast.loading("📄 Processing file...");

    try {
      const res = await fetch("/api/chat/upload", {
        method: "POST",
        body: formData,
      });

      toast.dismiss();

      const contentDisposition = res.headers.get("Content-Disposition");
      const contentType = res.headers.get("Content-Type");

      if (res.ok && contentType?.includes("application/zip") && contentDisposition) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");

        const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        const filename = fileNameMatch ? fileNameMatch[1] : `debugged_${file.name}`;

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        toast.success("✅ Debugged ZIP downloaded");
        return;
      }

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Summary ready!");

        const summaryMessage = {
          role: "assistant",
          content: data.summary,
          timestampss: Date.now(),
        };

        setSelectedChat((prev) => ({
          ...prev,
          messages: [...prev.messages, summaryMessage],
        }));

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id
              ? { ...chat, messages: [...chat.messages, summaryMessage] }
              : chat
          )
        );
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Upload failed");
    }
  };

  return (
    <form
      onSubmit={sendPromt}
      className={`w-full ${
        selectedChat?.messages.length > 0 ? "max-w-3xl" : "max-w-2xl"
      } bg-[#003366] p-4 rounded-4xl mt-4 transition-all`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
        rows={2}
        placeholder="Message SER-AI"
        required
        onChange={(e) => setPromt(e.target.value)}
        value={promt}
      />
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5" src={assets.deepthink_icon} alt="" />
            DeepThink
          </p>
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5" src={assets.search_icon} alt="" />
            Search
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.txt,.zip"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Image
            className="w-4 cursor-pointer"
            src={assets.pin_icon}
            alt=""
            onClick={() => document.getElementById("fileInput").click()}
          />
          <button
            type="submit"
            disabled={!promt || isLoading}
            className={`rounded-full p-2 cursor-pointer ${
              promt ? "bg-primary" : "bg-[#e8e8f4]"
            }`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={promt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt=""
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default Promtbox;
