import { Input } from "@/components/ui/input";

import { useQuery } from "react-query";
import axios from "axios";
import {
  SearchAlbum,
  SearchApi,
  SearchArtist,
  SearchPlaylistApi,
  streamApi,
} from "@/API/api";
import {
  SearchPlaylist,
  likedSongs,
  playlistSongs,
  profiles,
  searchAlbumsInterface,
  suggestedArtists,
} from "@/Interface";
import Loader from "../Loaders/Loader";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/Store/Store";
import { setSearch, setSearchToggle } from "@/Store/Player";
import { DATABASE_ID, INSIGHTS, NEW_USER, db } from "@/appwrite/appwriteConfig";
import SearchSong from "./SearchSong";
import { Query } from "appwrite";
import { ArtistSearch } from "./artistSearch";
import { MdCancel } from "react-icons/md";
import { PlaylistSearchComp } from "./playlistSearch";
import { AlbumSearchComp } from "./albumSearch";
import SkeletonP from "../Library/SkeletonP";
import RecentSearchesComp from "./RecentSearches";
import { SearchToggle } from "./searchToggle";
import { IoSearchOutline } from "react-icons/io5";
import { ProfileSearch } from "./Profile";
import {} from "react-router-dom";
import { Button } from "../ui/button";
import BrowseAllCard from "../../BrowseAll/BrowseAllCard";

function SearchComp() {
  const searchQuery = useSelector(
    (state: RootState) => state.musicReducer.search
  );
  const dispatch = useDispatch();
  const s = useRef<HTMLInputElement>(null);
  const uid = useSelector((state: RootState) => state.musicReducer.uid);

  const loadRecentSearch = async () => {
    const r = await db.listDocuments(DATABASE_ID, INSIGHTS, [
      Query.orderDesc("$createdAt"),
      Query.equal("for", [uid || ""]),
      Query.limit(11),
    ]);
    const p = r.documents as unknown as likedSongs[];
    return p;
  };
  const { data: RecentSearch, isLoading: RecentLoading } = useQuery<
    likedSongs[]
  >("recentSearch", loadRecentSearch, {
    staleTime: 2000,
    keepPreviousData: true,
  });

  const clearSearchQuery = useCallback(() => {
    dispatch(setSearch(""));
  }, [dispatch]);
  const query = async () => {
    if (searchQuery.length > 0) {
      const q = await axios.get(`${SearchApi}${searchQuery}`);
      new Audio(`${streamApi}${q.data[0].youtubeId}`).load();
      new Audio(`${streamApi}${q.data[1].youtubeId}`).load();

      return q.data as playlistSongs[];
    } else {
      return [];
    }
  };
  const {
    data: music,
    isLoading,
    refetch,
  } = useQuery<playlistSongs[]>(["search", searchQuery], query, {
    staleTime: 5 * 60000,
  });

  const artists = async () => {
    if (searchQuery.length > 0) {
      const q = await axios.get(`${SearchArtist}${searchQuery}`);
      return q.data as suggestedArtists[];
    } else {
      return [];
    }
  };
  const { data: artistsData, refetch: artistsRefetch } = useQuery<
    suggestedArtists[]
  >(["artistsSearch", searchQuery], artists, {
    staleTime: 5 * 60000,
  });
  const profile = async () => {
    if (searchQuery.length > 0) {
      const q = await db.listDocuments(DATABASE_ID, NEW_USER, [
        Query.startsWith("name", searchQuery),
        Query.notEqual("$id", uid || ""),
      ]);
      return q.documents as unknown as profiles[];
    } else {
      return [];
    }
  };
  const { data: profileData, refetch: profileRefetch } = useQuery<profiles[]>(
    ["profileSearch", searchQuery],
    profile,
    {
      staleTime: 5 * 60000,
    }
  );

  const albums = async () => {
    if (searchQuery.length > 0) {
      const q = await axios.get(`${SearchAlbum}${searchQuery}`);
      return q.data as searchAlbumsInterface[];
    } else {
      return [];
    }
  };
  const { data: albumData, refetch: albumRefetch } = useQuery<
    searchAlbumsInterface[]
  >(["albumsSearch", searchQuery], albums, {
    staleTime: 5 * 60000,
  });

  const playlists = async () => {
    if (searchQuery.length > 0) {
      const q = await axios.get(`${SearchPlaylistApi}${searchQuery}`);

      return q.data as SearchPlaylist[];
    } else {
      return [];
    }
  };
  const { data: playlistsData, refetch: playlistsRefetch } = useQuery<
    SearchPlaylist[]
  >(["PlaylistSearch", searchQuery], playlists, {
    staleTime: 5 * 60000,
  });

  useEffect(() => {
    if (s.current) {
      s.current.value = searchQuery;
    }
  }, [searchQuery]);

  const searchToggle = useSelector(
    (state: RootState) => state.musicReducer.searchToggle
  );

  const search = useCallback(
    (time: number) => {
      dispatch(setSearchToggle("Music"));
      s.current?.value.trim() == "" && dispatch(setSearch(""));
      const q = setTimeout(() => {
        if (s.current?.value) {
          s.current.value.length > 1 &&
            (refetch(),
            artistsRefetch(),
            profileRefetch(),
            playlistsRefetch(),
            albumRefetch(),
            dispatch(setSearch(s.current?.value || "")));
        }
      }, time);
      return () => clearTimeout(q);
    },
    [
      refetch,
      dispatch,
      artistsRefetch,
      playlistsRefetch,
      albumRefetch,
      profileRefetch,
    ]
  );

  const [hide, setHide] = useState<boolean>(false);
  return (
    <>
      <div className="flex flex-col  items-center ">
        <div className="flex w-full px-4  -space-x-2">
          <div className="border rounded-sm rounded-r-none border-r-0 px-2 border-zinc-800">
            <IoSearchOutline
              onClick={clearSearchQuery}
              className=" text-white left-6 mt-2 h-5 w-5"
            />
          </div>
          <Input
            onFocus={() => setHide(true)}
            ref={s}
            type="text"
            onChange={() => search(1100)}
            placeholder="Artists, Songs, Playlists and More"
            className="  px-2 relative shadow-none rounded-sm rounded-l-none border-l-0 "
          />
          {hide && (
            <Button
              onClick={() => setHide(false)}
              className="w-fit pl-4 pr-1.5 text-red-500"
              variant={"ghost"}
            >
              {" "}
              Cancel
            </Button>
          )}
        </div>
        {searchQuery.length > 0 && hide && (
          <MdCancel
            onClick={clearSearchQuery}
            className=" absolute  right-[5.5rem] mt-2 h-5 w-5"
          />
        )}

        <div className="flex flex-col  text-start w-full py-2">
          {isLoading && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Loader />
            </div>
          )}

          {RecentSearch &&
            hide &&
            RecentSearch.length > 0 &&
            searchQuery.length <= 0 && (
              <>
                <h3 className="text-xs px-4 text-zinc-400 font-normal leading-tight  pt-2 pb-1 ">
                  Recently Searched
                </h3>
                <div className="h-[63dvh] pb-7 px-4 items-center w-full flex-col flex overflow-scroll">
                  <div className="flex justify-center flex-col -space-y-1  ">
                    {RecentSearch.filter(
                      (r, i, s) =>
                        i === s.findIndex((t) => t.youtubeId == r.youtubeId)
                    ).map((r, i) => (
                      <RecentSearchesComp r={r} key={r.youtubeId + i} />
                    ))}
                  </div>
                </div>
              </>
            )}

          {searchQuery.length == 0 && hide && (
            <>
              {RecentLoading && (
                <div className="flex  mt-1 px-4 flex-col space-y-3 ">
                  <SkeletonP />
                  <SkeletonP />
                  <SkeletonP />
                  <SkeletonP />
                </div>
              )}
            </>
          )}

          {music && !isLoading && searchQuery.length > 0 && hide && (
            <>
              <div className="px-4">
                <SearchToggle
                  Profile={(profileData && profileData.length > 0) || false}
                  Artist={(artistsData && artistsData.length > 0) || false}
                  Music={(music && music.length > 0) || false}
                  Albums={(albumData && albumData.length > 0) || false}
                  Playlists={
                    (playlistsData && playlistsData.length > 0) || false
                  }
                />
              </div>
              <div className="h-[63vh] pb-9 px-4 overflow-y-scroll overflow-hidden flex flex-col items-center w-full">
                {searchToggle === "Music" &&
                  music.map((r) => {
                    if (r.youtubeId && r.artists) {
                      return (
                        <SearchSong
                          artistId={r.artists ? r?.artists[0]?.id : "unknown"}
                          audio={r.youtubeId ? r.youtubeId : ""}
                          artistName={
                            r.artists ? r.artists[0]?.name : "unknown"
                          }
                          id={r.youtubeId}
                          key={r.youtubeId}
                          title={r?.title || "unknown"}
                          artist={
                            r.artists
                              ? r?.artists
                              : [{ id: "", name: "unknown" }]
                          }
                          cover={r?.thumbnailUrl || "/cache.jpg"}
                        />
                      );
                    }
                  })}

                {searchToggle === "Artists" &&
                  artistsData &&
                  artistsData.length > 0 && (
                    <div>
                      {artistsData.map((a, i) => (
                        <ArtistSearch
                          key={i}
                          name={a?.name || "unknown"}
                          artistId={a?.artistId || "unknown"}
                          thumbnailUrl={a.thumbnailUrl}
                        />
                      ))}
                    </div>
                  )}
                {searchToggle === "Profile" &&
                  profileData &&
                  profileData.length > 0 && (
                    <div>
                      {profileData.map((a, i) => (
                        <ProfileSearch
                          key={i}
                          name={a.name || "unknown"}
                          artistId={a.user}
                          thumbnailUrl={a.image || "/cache.jpg"}
                        />
                      ))}
                    </div>
                  )}
                {searchToggle === "Albums" &&
                  albumData &&
                  albumData.length > 0 && (
                    <div>
                      {albumData.map((a, i) => (
                        <AlbumSearchComp
                          key={i}
                          title={a?.title || "unknown"}
                          albumId={a?.albumId || "unknown"}
                          thumbnailUrl={a.thumbnailUrl}
                        />
                      ))}
                    </div>
                  )}

                {searchToggle === "Playlists" &&
                  playlistsData &&
                  playlistsData.length > 0 &&
                  playlistsData.map((p, i) => (
                    <PlaylistSearchComp
                      key={i}
                      playlistId={p?.playlistId || "unknown"}
                      thumbnailUrl={p.thumbnailUrl}
                      title={p?.title || "unknown"}
                    />
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
      {!hide && (
        <div className="px-4 space-y-2 pb-36 leading-tight">
          <p className="text-zinc-200 text-sm hidden ">Browse all</p>
          <div className=" grid grid-cols-2 gap-3  pb-5">
            <BrowseAllCard />
          </div>
        </div>
      )}
    </>
  );
}
const Search = React.memo(SearchComp);
export default Search;
