import { GetArtistDetails, GetPlaylistHundredSongsApi } from "@/API/api";
import { ArtistDetails, favArtist, playlistSongs } from "@/Interface";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import SuggestedArtist from "./SuggestedArtist";
import ArtistAlbums from "./ArtistAlbums";
import Loader from "@/components/Loaders/Loader";
import GoBack from "@/components/Goback";
import React, { useCallback, useEffect, useState } from "react";
import { DATABASE_ID, FAV_ARTIST, db } from "@/appwrite/appwriteConfig";
import { ID, Permission, Query, Role } from "appwrite";
import { FaRegStar } from "react-icons/fa";
import {
  SetPlaylistOrAlbum,
  isLoop,
  play,
  setCurrentIndex,
  setPlayingPlaylistUrl,
  setPlaylist,
  shuffle,
} from "@/Store/Player";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/Store/Store";
import { FaStar } from "react-icons/fa6";
import Share from "@/HandleShare/Share";
import { IoPlay } from "react-icons/io5";

import { LuDot } from "react-icons/lu";
import useImage from "@/hooks/useImage";

function ArtistPageComp() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [isFavArtist, setIsFavArtist] = useState<boolean>();
  const getArtistDetails = async () => {
    const list = await axios.get(`${GetArtistDetails}${id}`);
    return list.data as ArtistDetails;
  };
  const uid = useSelector((state: RootState) => state.musicReducer.uid);

  const loadIsFav = async () => {
    const r = await db.listDocuments(DATABASE_ID, FAV_ARTIST, [
      Query.equal("for", [uid || ""]),
      Query.equal("artistId", [id || ""]),
    ]);
    const p = r.documents as unknown as favArtist[];
    if (p.length == 0) {
      setIsFavArtist(false);
    } else {
      setIsFavArtist(true);
    }
    return p;
  };

  const { data: isFav, refetch: refetchFav } = useQuery<favArtist[]>(
    ["checkFavArtist", id],
    loadIsFav,
    {
      keepPreviousData: true,
    }
  );

  const { data, isLoading, isError, refetch, isRefetching } =
    useQuery<ArtistDetails>(["artist", id], getArtistDetails, {
      retry: 5,

      staleTime: 60 * 60000,
      onSuccess(d) {
        d == null && refetch();
      },
    });
  const q = useQueryClient();
  const addToFav = useCallback(async () => {
    setIsFavArtist(true);

    if (uid) {
      await db
        .createDocument(
          DATABASE_ID,
          FAV_ARTIST,
          ID.unique(),
          {
            artistId: id,
            name: data?.name,
            thumbnailUrl: data?.thumbnails[0].url.replace(
              "w540-h225",
              "w1080-h1080"
            ),
            for: uid,
          },
          [Permission.update(Role.user(uid)), Permission.delete(Role.user(uid))]
        )
        .catch(() => setIsFavArtist(false));
      refetchFav();
      await q.fetchQuery("savedArtists");
    }
  }, [data, id, refetchFav, uid, q]);

  const removeFromFav = useCallback(async () => {
    if (isFav) {
      setIsFavArtist(false);

      await db
        .deleteDocument(DATABASE_ID, FAV_ARTIST, isFav[0].$id)
        .catch(() => setIsFavArtist(true));
      refetchFav();
      await q.fetchQuery("savedArtists");
    }
  }, [refetchFav, isFav, q]);

  const getPlaylist = async () => {
    const list = await axios.get(
      `${GetPlaylistHundredSongsApi}${
        data?.songsPlaylistId.replace("VL", "") || ""
      }`
    );

    return list.data as playlistSongs[];
  };

  const { data: song, refetch: songRefetch } = useQuery<playlistSongs[]>(
    ["playlist", id],
    getPlaylist,
    {
      enabled: false,
      retry: 5,

      staleTime: 60 * 60000,
      onSuccess(data) {
        data.length == 0 && songRefetch();
      },
    }
  );
  const isPlaying = useSelector(
    (state: RootState) => state.musicReducer.isPlaying
  );
  useEffect(() => {
    if (data) {
      songRefetch();
    }
  }, [data, songRefetch]);

  const handleShufflePlay = useCallback(async () => {
    if (song) {
      dispatch(setPlaylist(song));
      dispatch(shuffle(song));
      dispatch(SetPlaylistOrAlbum("library"));
      dispatch(setCurrentIndex(0));
      dispatch(
        setPlayingPlaylistUrl(data?.songsPlaylistId.replace("VL", "") || "")
      );

      if (song.length == 1) {
        dispatch(isLoop(true));
      } else {
        dispatch(isLoop(false));
      }
      if (!isPlaying) {
        dispatch(play(true));
      }
    }
  }, [dispatch, song, isPlaying, data?.songsPlaylistId]);
  const c1 = useImage(
    (data && data.thumbnails[0]?.url.replace("w540-h225", "w1080-h1080")) ||
      "/cache.jpg"
  );
  return (
    <>
      {isError && (
        <div className=" relative  w-full">
          <div className="fixed  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            No artist found
          </div>
          <GoBack />
        </div>
      )}
      {isRefetching && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      )}
      {isLoading && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      )}
      {data && (
        <div className="flex w-full h-[23rem] justify-center pt-[19vw] relative ">
          <GoBack />
          <div className="absolute animate-fade-left top-4 z-10 right-3">
            {isFavArtist ? (
              <FaStar
                onClick={removeFromFav}
                className="h-8 w-8  backdrop-blur-md mb-2   bg-black/30 rounded-full p-1.5"
              />
            ) : (
              <FaRegStar
                onClick={addToFav}
                className="h-8 w-8 mb-2 backdrop-blur-md   bg-black/30 rounded-full p-1.5"
              />
            )}
            <Share />
          </div>
          <div className="h-[50vw] w-[50vw]">
            <img
              width="100%"
              height="100%"
              src={c1 || "/favicon.jpeg"}
              alt="Image"
              loading="lazy"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) =>
                (e.currentTarget.src = "/cache.jpg")
              }
              className="object-cover animate-fade-down rounded-full h-[100%] w-[100%]"
            />
          </div>

          <div className=" absolute flex bottom-2 px-4 left-0 items-center justify-between right-0">
            <div className=" flex items-center max-w-[80dvw] truncate  font-medium">
              <h1 className="text-center tracking-tighter leading-tight text-zinc-100 truncate font-semibold  py-2 text-xl ">
                {data?.name}
              </h1>
              {data.subscribers && (
                <>
                  <LuDot className="h-10 truncate w-10 mt-2 -mx-2" />
                  <p className="text-xl font-semibold tracking-tighter leading-tight text-zinc-100 mt-1">
                    {data?.subscribers}
                  </p>
                </>
              )}
            </div>
            {data.songsPlaylistId && data.songsPlaylistId.length > 0 && (
              <div className="flex space-x-4 py-1">
                <Button
                  type="button"
                  onClick={handleShufflePlay}
                  variant={"secondary"}
                  className="px-2.5 flex justify-center items-centertext-white shadow-none bg-red-600 backdrop-blur-lg
                rounded-full "
                >
                  <IoPlay className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {data && data.albums.length > 0 && (
        <div className="flex flex-col">
          <div className="flex  px-3 py-2 pt-3 ">
            <h1 className="text-start text-zinc-200  leading-tight font-semibold animate-fade-right    text-xl">
              Albums
            </h1>
          </div>
          <div className="flex overflow-x-scroll -space-x-3  items-center">
            {data &&
              data.albums.map((s) => (
                <ArtistAlbums
                  artistId={id}
                  key={s.albumId}
                  title={s.title}
                  thumbnailUrl={s.thumbnailUrl}
                  type={s.type}
                  year={s.year}
                  albumId={s.albumId}
                />
              ))}
          </div>
        </div>
      )}

      {data && data.singles.length > 0 && (
        <div className="flex flex-col">
          <div className="flex  px-3 py-2 pt-3 ">
            <h1 className="text-start text-zinc-200  leading-tight animate-fade-right font-semibold text-xl">
              Singles
            </h1>
          </div>
          <div className="flex overflow-x-scroll -space-x-3  items-center">
            {data &&
              data.singles.map((s) => (
                <ArtistAlbums
                  artistId={id}
                  key={s.albumId}
                  title={s.title}
                  thumbnailUrl={s.thumbnailUrl}
                  type={s.type}
                  year={s.year}
                  albumId={s.albumId}
                />
              ))}
          </div>
        </div>
      )}
      {data && data.suggestedArtists.length == 0 && (
        <div className="pb-40"></div>
      )}
      {data && data.suggestedArtists.length > 0 && (
        <div className="flex flex-col">
          <div className="flex  px-3 py-2 pt-3 ">
            <h1 className="text-start text-zinc-200  leading-tight font-semibold animate-fade-right text-xl">
              Fans also like
            </h1>
          </div>
          <div className="flex overflow-x-scroll -space-x-3 items-center">
            {data &&
              data.suggestedArtists.map((s) => (
                <SuggestedArtist
                  key={s.artistId}
                  artistId={s.artistId}
                  name={s.name}
                  thumbnailUrl={s.thumbnailUrl}
                />
              ))}
          </div>
        </div>
      )}
    </>
  );
}
const ArtistPage = React.memo(ArtistPageComp);
export default ArtistPage;
