import { useState } from "react";
import { Info, Users } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import GroupInfoPanel from "./GroupInfoPanel";

const GroupHeader = () => {
  const { selectedGroup } = useGroupStore();
  const [showInfo, setShowInfo] = useState(false);

  if (!selectedGroup) return null;

  return (
    <>
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Group Avatar */}
            <div className="relative">
              <img
                src={selectedGroup.groupPic || "/avatar.png"}
                alt={selectedGroup.name}
                className="size-10 rounded-full object-cover"
                onError={(e) => (e.target.src = "/avatar.png")}
              />
              <span className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-0.5">
                <Users className="size-2.5 text-primary-content" />
              </span>
            </div>

            {/* Group Info */}
            <div>
              <h3 className="font-medium">{selectedGroup.name}</h3>
              <p className="text-sm text-base-content/60 flex items-center gap-1">
                <Users className="size-3" />
                {selectedGroup.members?.length || 0} members
              </p>
            </div>
          </div>

          {/* Info button */}
          <button
            onClick={() => setShowInfo(true)}
            className="btn btn-ghost btn-sm btn-circle"
            title="Group Info"
          >
            <Info className="size-5" />
          </button>
        </div>
      </div>

      {showInfo && <GroupInfoPanel onClose={() => setShowInfo(false)} />}
    </>
  );
};

export default GroupHeader;
