import { useEffect, useRef, useState, useCallback } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import GroupHeader from "./GroupHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageContextMenu from "./MessageContextMenu";
import { Trash2 } from "lucide-react";
import useLongPress from "../hooks/useLongPress";

const TWO_HOURS = 2 * 60 * 60 * 1000;

// Per-message bubble with long-press support
const GroupMessageBubble = ({ message, authUser, onDelete, onContextMenu }) => {
  const isMine = message.senderId?._id === authUser._id || message.senderId === authUser._id;
  const sender = message.senderId;
  const senderName = typeof sender === "object" ? sender?.fullName : "Unknown";
  const senderPic = typeof sender === "object" ? sender?.profilePic : null;

  const isWithin2Hours = Date.now() - new Date(message.createdAt).getTime() < TWO_HOURS;
  const canDelete = isMine && isWithin2Hours;

  const [hovered, setHovered] = useState(false);

  const handleLongPress = useCallback(
    (e) => {
      if (!canDelete) return;
      const touch = e.touches?.[0] || e;
      onContextMenu({ msgId: message._id, x: touch.clientX, y: touch.clientY, canDelete });
    },
    [canDelete, message._id, onContextMenu]
  );

  const longPressHandlers = useLongPress(handleLongPress, 500);

  return (
    <div
      className={`chat ${isMine ? "chat-end" : "chat-start"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...longPressHandlers}
      style={{ userSelect: "none" }}
    >
      <div className="chat-image avatar">
        <div className="size-10 rounded-full border">
          <img
            src={isMine ? authUser.profilePic || "/avatar.png" : senderPic || "/avatar.png"}
            alt="profile"
          />
        </div>
      </div>

      <div className="chat-header mb-1 flex items-center gap-2">
        {!isMine && (
          <span className="text-xs font-semibold text-base-content/70">{senderName}</span>
        )}
        <time className="text-xs opacity-50">
          {formatMessageTime(message.createdAt)}
        </time>
      </div>

      <div className="chat-bubble flex flex-col relative group">
        {message.image && (
          <img
            src={message.image}
            alt="Attachment"
            className="sm:max-w-[200px] rounded-md mb-2"
          />
        )}
        {message.text && <p>{message.text}</p>}

        {/* Desktop hover delete */}
        {canDelete && hovered && (
          <button
            onClick={() => onDelete(message._id)}
            className="absolute -top-7 right-0 btn btn-xs btn-error btn-ghost gap-1 opacity-90 hover:opacity-100 shadow-sm hidden sm:flex"
            title="Delete message"
          >
            <Trash2 className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
};

const GroupChatContainer = () => {
  const {
    groupMessages,
    getGroupMessages,
    sendGroupMessage,
    deleteGroupMessage,
    selectedGroup,
    isGroupMessagesLoading,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  } = useGroupStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    if (!selectedGroup?._id) return;
    getGroupMessages(selectedGroup._id);
    subscribeToGroupMessages();
    return () => unsubscribeFromGroupMessages();
  }, [selectedGroup?._id, getGroupMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  useEffect(() => {
    if (messageEndRef.current && groupMessages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  const handleSendMessage = async (messageData) => {
    await sendGroupMessage(messageData);
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Delete this message?")) {
      await deleteGroupMessage(messageId);
    }
  };

  const handleContextMenuDelete = async () => {
    if (contextMenu?.msgId) {
      await deleteGroupMessage(contextMenu.msgId);
    }
  };

  if (isGroupMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <GroupHeader />
        <MessageSkeleton />
        <MessageInput onSend={handleSendMessage} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <GroupHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-base-content/40">
            <p className="text-sm">No messages yet. Say hello! 👋</p>
          </div>
        )}

        {groupMessages.map((message, idx) => (
          <div key={message._id} ref={idx === groupMessages.length - 1 ? messageEndRef : null}>
            <GroupMessageBubble
              message={message}
              authUser={authUser}
              onDelete={handleDeleteMessage}
              onContextMenu={setContextMenu}
            />
          </div>
        ))}
      </div>

      <MessageInput onSend={handleSendMessage} />

      {/* Long-press context menu */}
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          canDelete={contextMenu.canDelete}
          onDelete={handleContextMenuDelete}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default GroupChatContainer;

