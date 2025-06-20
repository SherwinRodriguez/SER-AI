import Image from 'next/image'
import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { useClerk, UserButton } from '@clerk/nextjs'
import { userAppContext } from '../contents/AppContext'
import ChatLabel from './ChatLabel'

const Sidebar = ({ expand, setExpand }) => {
  const { openSignIn } = useClerk()
  const { user, chats, createNewChat } = userAppContext()

  const [openMenuId, setOpenMenuId] = useState(null)

  return (
    <div className={`flex flex-col justify-between bg-[#19194d] pt-7 transition-all z-50 max-md:absolute max-md:h-screen ${expand ? 'p-4 w-64' : 'md:w-20 w-10 max-md:overflow-hidden'}`}>
      <div>
        <div className={`flex ${expand ? "flex-row gap-25" : "flex-col items-center gap-8"}`}>
        <h1 className="text-white text-2xl">SER-
          <span className="text-pink-500">AI</span>
        </h1>

          <div onClick={() => setExpand(!expand)}
            className='group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 aspect-square rounded-lg cursor-pointer'>
            <Image src={assets.menu_icon} alt='' className='md:hidden' />
            <Image className='hidden md:block w-7'
              src={expand ? assets.sidebar_close_icon : assets.sidebar_icon} alt='' />
            <div className={`absolute w-max ${expand ? "left-1/2 -translate-x-1/2 top-12" : "left-0 -top-12"} opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none`}>
              {expand ? 'Close Sidebar' : 'Open Sidebar'}
              <div className={`w-3 h-3 absolute bg-black rotate-45 ${expand ? "left-1/2 -top-1.5 -translate-x-1/2" : "left-4 -bottom-1.5"}`}>
              </div>
            </div>
          </div>
        </div>
        <button onClick={createNewChat} className={`mt-8 flex items-center justify-center cursor-pointer ${expand ? "bg-primary hover:opacity-90 rounded-2xl gap-2 p-2.5 w-max" : "group relative h-9 w-9 mx-auto hover:bg-gray-500/30 rounded-lg"}`}>
          <Image className={expand ? "w-6" : "w-7"} src={expand ? assets.chat_icon : assets.chat_icon_dull} alt='' />
          <div className='absolute w-max -top-12 -right-12 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none'>
            New Chat
            <div className='w-3 h-3 absolute bg-black rotate-45 left-4 -bottom-1.5'></div>
          </div>
          {expand && <p className='text-white text font-medium'>New Chat</p>}
        </button>
        <div className={`mt-8 text-white/25 text-sm ${expand ? "block" : "hidden"}`}>
          <p className='my-1'>Recents</p>
          {chats.map(chat => (
            <ChatLabel
              key={chat._id} 
              id={chat._id}
              name={chat.name}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
            />
          ))}
        </div>
      </div>
      <div>
        <div onClick={user ? null : openSignIn} className={`flex items-center ${expand ? 'hover:bg-white/10 rounded-lg' : 'justify-center w-full'} gap-3 text-white/60 text-sm p-2 mt-2 cursor-pointer`}>
          {
            user ? <UserButton /> :
              <Image src={assets.profile_icon} alt='' className='w-7' />
          }
          {expand && <span >My Profile</span>}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
