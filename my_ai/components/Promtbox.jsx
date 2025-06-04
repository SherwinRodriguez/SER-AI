import React, { useState } from 'react'
import { assets } from '../assets/assets'
import Image from 'next/image'


const Promtbox = ({setIsLoading,isLoading}) => {
const[promt,setPromt]=useState('')

  return (
    <form className={`w-full ${false ? "max-w-3xl":"max-w-2xl"} bg-[#003366] p-4 rounded-4xl mt-4 transition-all`}>
      <textarea className='outline-none w-full resize-none overflow-hidden break-words bg-transparent'
      rows={2}
      placeholder='Message Ser-ai' required
      onChange={(e)=> setPromt(e.target.value)} value={promt}
      />
      <div className='flex
       items-center justify-between text-sm'>
        <div className='flex items-center gap-2'>
          <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transiton' >
            <Image className='h-5' src={assets.deepthink_icon} alt=''/>
            DeepThink
          </p>
          <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transiton' >
            <Image className='h-5' src={assets.search_icon} alt=''/>Search
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Image className='w-4 cursor-pointer' src={assets.pin_icon} alt=''/>
          <button className={`${promt? "bg-primary":"bg-[#e8e8f4]"} rounded-full p-2 cursor-pointer`}>
            <Image className='w-3.5 aspect-square' src={promt? assets.arrow_icon:assets.arrow_icon_dull} alt=''/>
          </button>
        </div>
      </div>
    </form>
  )
}

export default Promtbox
