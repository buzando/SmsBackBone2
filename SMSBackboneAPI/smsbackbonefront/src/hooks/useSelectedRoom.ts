import { useEffect, useState } from "react";
import { getSelectedRoom, SelectedRoom } from "../utils/roomHelper";

export const useSelectedRoom = () => {
  const [room, setRoom] = useState<SelectedRoom | null>(() => getSelectedRoom());

  useEffect(() => {
    const onRoomChanged = () => {
      setRoom(getSelectedRoom());
    };

    window.addEventListener("storageUpdate", onRoomChanged);
    return () => window.removeEventListener("storageUpdate", onRoomChanged);
  }, []);

  return room;
};
