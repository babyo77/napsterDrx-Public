import { Button } from "../ui/button";
import { useCallback, useRef } from "react";

import {
  DATABASE_ID,
  PLAYLIST_COLLECTION_ID,
  db,
} from "@/appwrite/appwriteConfig";
import { useQueryClient } from "react-query";
import { savedPlaylist } from "@/Interface";
import { RxCross2 } from "react-icons/rx";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { AlertTitle } from "../ui/alert";
import { setCurrentToggle } from "@/Store/Player";
import { useDispatch } from "react-redux";

const EditInfo: React.FC<{ id: string; f: string; collection?: string }> = ({
  id,
  f,
  collection,
}) => {
  const dispatch = useDispatch();

  const q = useQueryClient();
  const closeRef = useRef<HTMLButtonElement>(null);
  const handleDelete = useCallback(async () => {
    const savedPlaylist = await q.setQueryData("savedPlaylist", (data) =>
      (data as savedPlaylist[]).filter((item) => item.$id !== id)
    );
    const savedAlbums = await q.setQueryData("savedAlbums", (data) =>
      (data as savedPlaylist[]).filter((item) => item.$id !== id)
    );
    if ((savedAlbums as [])?.length == 0) {
      dispatch(setCurrentToggle("Playlists"));
    } else if ((savedPlaylist as [])?.length == 0) {
      dispatch(setCurrentToggle("Albums"));
    }
    db.deleteDocument(
      DATABASE_ID,
      collection || PLAYLIST_COLLECTION_ID,
      id
    ).then(async () => {
      await q.fetchQuery("savedPlaylist");
      closeRef.current?.click();
      await q.fetchQuery("savedAlbums");
    });
  }, [id, collection, q, dispatch]);

  return (
    <AlertDialog>
      <AlertDialogTrigger className="flex w-full items-center justify-end space-x-2">
        <RxCross2 className="h-6 w-6 text-zinc-500" />
      </AlertDialogTrigger>
      <AlertDialogContent className="items-center m-0 p-0 pt-3 pb-1 border-none rounded-2xl flex flex-col w-[60vw] bg-neutral-950/95">
        <AlertDialogHeader>
          <AlertTitle className="text-zinc-300  font-semibold pt-1">
            Are you sure?
          </AlertTitle>
        </AlertDialogHeader>

        <div className="flex items-center flex-col w-full justify-center ">
          <div className=" h-[0.11rem] bg-zinc-800/30 w-full"></div>
          <AlertDialogCancel className="w-full bg-transparent  border-none p-0 m-0">
            <Button
              asChild
              disabled={f === "default" ? true : false}
              variant={"secondary"}
              onClick={handleDelete}
              className="px-7 py-5 bg-transparent text-lg font-normal rounded-lg  text-red-500 "
            >
              <p className=" w-full">Yes</p>
            </Button>
          </AlertDialogCancel>
          <div className=" h-[0.11rem] bg-zinc-800/30 w-full"></div>
          <AlertDialogCancel className="w-full bg-transparent  border-none p-0 m-0">
            <Button
              asChild
              ref={closeRef}
              variant={"secondary"}
              className="px-7 bg-transparent text-zinc-400 font-normal text-base rounded-lg "
            >
              <p className="font-normal w-full">No</p>
            </Button>
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditInfo;
