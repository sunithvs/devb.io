"use client"
import { useRouter } from 'next/navigation';
 import meme from '@/public/assets/smile.png';

const CompareButton = () => {
     const router = useRouter()

  return (
    <div onClick={()=>router.push('/meme')} className='cursor-pointer hover:scale-105 transition-all duration-500 flex items-center gap-2 p-1 px-5 bg-gradient-to-r from-violet-700  to-fuchsia-500 rounded-full'>
      <img src={meme.src} alt="asda" className=' w-12' />
      <span className='font-bold text-yellow-200 '>Compare Github</span>
    
    </div>
  )
}

export default CompareButton;