import { assets } from '@/assets/assets'
import Image from 'next/image'
import React, { useEffect } from 'react'
import Markdown from 'react-markdown'
import Prism from 'prismjs'
import toast from 'react-hot-toast'

const Message = ({ role, content }) => {
  useEffect(() => {
    Prism.highlightAll()
  }, [content])

  const copyMessage = () => {
    navigator.clipboard.writeText(content)
    toast.success('message copied')
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl text-sm">
      <div className={`flex flex-col w-full mb-8 ${role === 'user' && 'items-end'}`}>
        <div
          className={`group relative flex max-w-2xl py-3 rounded-xl ${
            role === 'user' ? 'bg-[#414158] px-5 ' : 'gap-3'
          }`}
        >
          <div
            className={`opacity-0 group-hover:opacity-100 absolute ${
              role === 'user' ? '-left-15 top-3.5' : 'left-9 -bottom-6'
            } transition-all`}
          >
            <div className="flex items-center gap-2 opacity-70">
              {role === 'user' ? (
                <>
                  <Image
                    onClick={copyMessage}
                    src={assets.copy_icon}
                    alt="Copy message"
                    className="w-4 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && copyMessage()}
                  />
                  <Image src={assets.pencil_icon} alt="Edit message" className="w-4.5 cursor-pointer" />
                </>
              ) : (
                <>
                  <Image
                    onClick={copyMessage}
                    src={assets.copy_icon}
                    alt="Copy message"
                    className="w-4.5 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && copyMessage()}
                  />
                  <Image src={assets.regenerate_icon} alt="Regenerate" className="w-4 cursor-pointer" />
                  <Image src={assets.like_icon} alt="Like" className="w-4 cursor-pointer" />
                  <Image src={assets.dislike_icon} alt="Dislike" className="w-4.5 cursor-pointer" />
                </>
              )}
            </div>
          </div>
          {role === 'user' ? (
            <span className="text-white/90 whitespace-pre-wrap">{content}</span>
          ) : (
            <>
              <Image
                src={assets.logo_icon}
                alt="Assistant logo"
                className="w-9 h-9 p-1 border border-white/15 rounded-full"
              />
              <div className="space-y-4 w-full overflow-auto">
                <Markdown>{content}</Markdown>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Message
