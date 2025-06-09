import React, { useState } from 'react'
import { assets } from '../assets/assets'
import Image from 'next/image'
import { userAppContext } from '@/contents/AppContext'
import toast from 'react-hot-toast'
import axios from 'axios'

const Promtbox = ({ setIsLoading, isLoading }) => {
  const [promt, setPromt] = useState('')
  const { user, chats, setChats, selectedChat, setSelectedChat } = userAppContext()

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendPromt(e)
    }
  }

  const sendPromt = async (e) => {
    e.preventDefault()
    const promtCopy = promt

    try {
      if (!user) return toast.error('Login to send message')
      if (isLoading) return toast.error('Please wait for the previous message')

      setIsLoading(true)
      setPromt('')

      // User message object
      const userPromt = {
        role: 'user',
        content: promtCopy,
        timestampss: Date.now(),
      }

      // Add user prompt message to chats and selectedChat
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, messages: [...chat.messages, userPromt] }
            : chat
        )
      )

      setSelectedChat((prev) => ({
        ...prev,
        messages: [...prev.messages, userPromt],
      }))

      // Call API for AI response
      const { data } = await axios.post('/api/chat/ai', {
        chatId: selectedChat._id,
        promt: promtCopy,
      })

      if (data.success) {
        // Prepare empty assistant message for animation
        const assistantMessage = {
          role: 'assistant',
          content: '',
          timestampss: Date.now(),
        }

        // Add empty assistant message to chats and selectedChat
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id
              ? { ...chat, messages: [...chat.messages, assistantMessage] }
              : chat
          )
        )
        setSelectedChat((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
        }))

        // Animate the assistant message content token-by-token
        const messageTokens = data.data.content.split(' ')

        for (let i = 0; i < messageTokens.length; i++) {
          setTimeout(() => {
            const currentContent = messageTokens.slice(0, i + 1).join(' ')

            setSelectedChat((prev) => {
              const updatedMessages = [
                ...prev.messages.slice(0, -1),
                { ...assistantMessage, content: currentContent },
              ]
              return { ...prev, messages: updatedMessages }
            })

            setChats((prevChats) =>
              prevChats.map((chat) =>
                chat._id === selectedChat._id
                  ? {
                      ...chat,
                      messages: [
                        ...chat.messages.slice(0, -1),
                        { ...assistantMessage, content: currentContent },
                      ],
                    }
                  : chat
              )
            )
          }, i * 100)
        }
      } else {
        toast.error(data.message)
        setPromt(promtCopy)
      }
    } catch (error) {
      toast.error(error.message)
      setPromt(promtCopy)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={sendPromt}
      className={`w-full ${
        selectedChat?.messages.length > 0 ? 'max-w-3xl' : 'max-w-2xl'
      } bg-[#003366] p-4 rounded-4xl mt-4 transition-all`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        className='outline-none w-full resize-none overflow-hidden break-words bg-transparent'
        rows={2}
        placeholder='Message SER-AI'
        required
        onChange={(e) => setPromt(e.target.value)}
        value={promt}
      />
      <div className='flex items-center justify-between text-sm'>
        <div className='flex items-center gap-2'>
          <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'>
            <Image className='h-5' src={assets.deepthink_icon} alt='' />
            DeepThink
          </p>
          <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'>
            <Image className='h-5' src={assets.search_icon} alt='' />
            Search
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Image className='w-4 cursor-pointer' src={assets.pin_icon} alt='' />
          <button
            type='submit'
            disabled={!promt || isLoading}
            className={`rounded-full p-2 cursor-pointer ${
              promt ? 'bg-primary' : 'bg-[#e8e8f4]'
            }`}
          >
            <Image
              className='w-3.5 aspect-square'
              src={promt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt=''
            />
          </button>
        </div>
      </div>
    </form>
  )
}

export default Promtbox
