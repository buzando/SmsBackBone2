export interface SelectedRoom {
  id: number;
  name?: string;
}

export const getSelectedRoom = (): SelectedRoom | null => {
  try {
    const raw = localStorage.getItem("selectedRoom");
    if (!raw) return null;

    const room = JSON.parse(raw);
    if (!room?.id) return null;

    return {
      id: Number(room.id),
      name: room.name,
    };
  } catch {
    return null;
  }
};

export const getSelectedRoomId = (): number | null => {
  const room = getSelectedRoom();
  return room ? room.id : null;
};
