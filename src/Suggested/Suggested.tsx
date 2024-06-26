import { RootState } from "@/Store/Store";
import GoBack from "@/components/Goback";
import UpNextSongs from "./upNextSongs";
import { useDispatch, useSelector } from "react-redux";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useCallback, useEffect, useState } from "react";
import { setPlaylist } from "@/Store/Player";

function SuggestedComp() {
  const dispatch = useDispatch();
  const [online, setOnline] = useState<boolean>();
  useEffect(() => {
    setOnline(navigator.onLine);
  }, []);
  const PlaylistOrAlbum = useSelector(
    (state: RootState) => state.musicReducer.PlaylistOrAlbum
  );

  const data = useSelector((state: RootState) => state.musicReducer.playlist);

  const handleDRagEND = useCallback(
    (event: DragEndEvent) => {
      const b = data.map((item, i) => ({
        ...item,
        id: i,
      }));

      if (b) {
        const getId = (id: UniqueIdentifier) => b.findIndex((d) => d.id === id);
        const { active, over } = event;
        if (over && active) {
          if (active.id === over.id) return;

          const or = getId(active.id);

          const newPos = getId(over.id);

          const np = arrayMove(b, or, newPos);

          dispatch(setPlaylist(np));
        }
      }
    },
    [dispatch, data]
  );

  const [editQue, setEditQue] = useState<boolean>(false);
  const handleEdit = useCallback(() => {
    setEditQue((prev) => !prev);
  }, []);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const [Add, setAdd] = useState<boolean>(false);
  const handleAdd = useCallback(() => {
    setAdd((prev) => !prev);
    setEditQue(true);
  }, []);

  return (
    <DndContext
      collisionDetection={closestCorners}
      sensors={sensors}
      onDragEnd={handleDRagEND}
    >
      <div className="flex  flex-col items-center">
        <>
          <div className="flex w-full z-10 fixed h-[3rem]  ">
            <GoBack />

            {!editQue && online && online && (
              <div
                onClick={handleEdit}
                className="absolute top-3 z-10 right-16 flex-col space-y-0.5"
              >
                <div onClick={handleAdd} className="w-fit -mr-2">
                  <p className=" mb-2 text-zinc-100 animate-fade-left  backdrop-blur-md bg-black/0 rounded-lg p-1.5 px-2 w-fit">
                    {Add ? "Cancel" : "Option"}
                  </p>
                </div>
              </div>
            )}
            {!Add && (
              <div
                onClick={handleEdit}
                className="absolute top-3 z-10 right-4 flex-col space-y-0.5"
              >
                <div className="w-fit -mr-2">
                  <p className=" mb-2 text-zinc-100 animate-fade-left  backdrop-blur-md bg-black/0 rounded-lg p-1.5 px-2 w-fit">
                    {editQue ? "Cancel" : "Edit"}
                  </p>
                </div>
              </div>
            )}
          </div>
          {data && data.length > 0 && (
            <div className="py-3 pt-14 pb-[9.4rem]">
              <SortableContext
                items={data.map((it, i) => ({
                  ...it,
                  id: i,
                }))}
                strategy={verticalListSortingStrategy}
              >
                {data.map((d, i) => (
                  <UpNextSongs
                    playlist={data.map((it, i) => ({
                      ...it,
                      id: i,
                    }))}
                    editQue={editQue}
                    p={"suggested"}
                    handleAdd={Add}
                    music={d}
                    where="suggested"
                    artistId={d.artists[0]?.id}
                    audio={d.youtubeId}
                    key={d.youtubeId + i}
                    id={i}
                    album={PlaylistOrAlbum == "album" && true}
                    title={d.title}
                    artist={d.artists[0]?.name}
                    cover={d.thumbnailUrl}
                  />
                ))}
              </SortableContext>
            </div>
          )}
        </>
      </div>
    </DndContext>
  );
}

const Suggested = React.memo(SuggestedComp);
export default Suggested;
