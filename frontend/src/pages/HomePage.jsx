import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-16 px-0 sm:px-4 h-full sm:h-auto">
        <div className="bg-base-100 shadow-cl w-full max-w-6xl h-full sm:h-[calc(100vh-5rem)] sm:rounded-lg">
          <div className="flex h-full sm:rounded-lg overflow-hidden">

            {/* Sidebar: always visible on desktop, only visible on mobile when no chat is selected */}
            <div className={`
              ${selectedUser ? "hidden" : "flex"} sm:flex
              w-full sm:w-20 lg:w-72
              flex-col
            `}>
              <Sidebar />
            </div>

            {/* Chat panel: always visible on desktop, only visible on mobile when a user is selected */}
            <div className={`
              ${selectedUser ? "flex" : "hidden"} sm:flex
              flex-1 flex-col
            `}>
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;