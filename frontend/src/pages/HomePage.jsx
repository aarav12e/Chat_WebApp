import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import GroupChatContainer from "../components/GroupChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { selectedGroup } = useGroupStore();

  const hasSelection = selectedUser || selectedGroup;

  return (
    <div className="h-screen bg-base-200 pb-16 sm:pb-0">
      <div className="flex items-center justify-center pt-16 px-0 sm:px-4 h-full sm:h-auto">
        <div className="bg-base-100 shadow-cl w-full max-w-6xl h-full sm:h-[calc(100vh-5rem)] sm:rounded-lg">
          <div className="flex h-full sm:rounded-lg overflow-hidden">

            {/* Sidebar: always visible on desktop, only visible on mobile when no chat is selected */}
            <div className={`
              ${hasSelection ? "hidden" : "flex"} sm:flex
              w-full sm:w-20 lg:w-72
              flex-col
            `}>
              <Sidebar />
            </div>

            {/* Chat panel */}
            <div className={`
              ${hasSelection ? "flex" : "hidden"} sm:flex
              flex-1 flex-col
            `}>
              {selectedGroup ? (
                <GroupChatContainer />
              ) : selectedUser ? (
                <ChatContainer />
              ) : (
                <NoChatSelected />
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;