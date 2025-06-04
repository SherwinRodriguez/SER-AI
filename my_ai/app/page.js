'use client'
import Image from "next/image";
import { assets } from "../assets/assets";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Promtbox from "../components/Promtbox";
import Message from "@/components/Message";

export default function Home() {
  const [expand,setExpand]= useState(false)
  const [messages,setMessages]=useState([])
  const [isloading,setIsLoading]=useState(false)
  return (
    <div>
      <div className="flex h-screen">
        {/* sidebar */}
        <Sidebar expand={expand} setExpand={setExpand} />
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 bg-[#030238] text-white relative">
          <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
            <Image onClick={()=> (expand ? setExpand(false):setExpand(true))} className="rotate-180" src={assets.menu_icon} alt=""/>
            <Image className="opacity-70" src={assets.chat_icon} alt=""/>
          </div>
          {messages.length === 0 ? (
            <>
            <div className="flex items-center gap-3">
              <Image src={assets.logo_icon} alt="" className="h-16"/>
              <p className="text-2xl font-medium">Hi, Im SER-AI.</p>
            </div>
            <p>How can I help you?</p>
            </>
            ):
            (
            <div>
                <Message role='user' content='What is next js'/>
            </div>
            )
            }
            {/* promt box */}
            <Promtbox isloading={isloading} setIsLoading={setIsLoading} messages={messages} setMessages={setMessages} />
            <p className="text-xs absolute bottom-1 text-gray-500">AI-generated, for reference only</p>
        </div>
      </div>
    </div>
  );
}
