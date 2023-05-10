const Header = () => {
  return (
    <div className='flex w-full gap-3 justify-start items-center text-zinc-800'>
      <div className='flex flex-col items-start text-sm'>
        <p className='text-xs'>Chat with</p>
        <div className='flex gap-1.5 items-center'>
          <p className='h-2 w-2 rounded-full bg-green-500' />
          <p className='font-medium'>Smart Chatbot</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
