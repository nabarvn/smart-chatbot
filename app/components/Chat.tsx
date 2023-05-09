import Header from "./Header";
import Input from "./Input";
import Messages from "./Messages";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const Chat = () => {
  return (
    <Accordion
      type='single'
      collapsible
      className='relative bg-white z-40 shadow'
    >
      <AccordionItem value='item-1'>
        <div className='fixed right-8 w-80 bottom-8 bg-white border border-gray-200 rounded-md overflow-hidden'>
          <div className='flex flex-col h-full w-full'>
            <AccordionTrigger className='border-b border-zinc-300 px-6'>
              <Header />
            </AccordionTrigger>
            <AccordionContent>
              <div className='flex flex-col h-80'>
                <Messages className='flex-1 px-2 py-3' />
                <Input className='px-4' />
              </div>
            </AccordionContent>
          </div>
        </div>
      </AccordionItem>
    </Accordion>
  );
};

export default Chat;
