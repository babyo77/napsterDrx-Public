import { savedPlaylist, savedProfile, suggestedArtists } from "@/Interface";
import { RootState } from "@/Store/Store";
import {
  ALBUM_COLLECTION_ID,
  DATABASE_ID,
  FAV_ARTIST,
  FAV_PROFILES,
  PLAYLIST_COLLECTION_ID,
  db,
} from "@/appwrite/appwriteConfig";
import { Query } from "appwrite";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";

function useSaved() {
  const uid = useSelector((state: RootState) => state.musicReducer.uid);

  const loadSavedPlaylist = async () => {
    const r = await db.listDocuments(DATABASE_ID, PLAYLIST_COLLECTION_ID, [
      Query.orderDesc("$createdAt"),
      Query.equal("for", [uid || ""]),
      Query.limit(70),
    ]);
    const p = r.documents as unknown as savedPlaylist[];
    return p;
  };
  const { data: savedPlaylist, isLoading } = useQuery(
    "savedPlaylist",
    loadSavedPlaylist,
    {
      keepPreviousData: true,
      refetchOnMount: false,
      staleTime: Infinity,
    }
  );

  const loadSavedAlbums = async () => {
    const r = await db.listDocuments(DATABASE_ID, ALBUM_COLLECTION_ID, [
      Query.orderDesc("$createdAt"),
      Query.equal("for", [uid || ""]),
      Query.limit(70),
    ]);
    const p = r.documents as unknown as savedPlaylist[];
    return p;
  };
  const { data: SavedAlbums } = useQuery("savedAlbums", loadSavedAlbums, {
    keepPreviousData: true,
    refetchOnMount: false,
    staleTime: Infinity,
  });
  const loadSavedArtists = async () => {
    const r = await db.listDocuments(DATABASE_ID, FAV_ARTIST, [
      Query.orderDesc("$createdAt"),
      Query.equal("for", [uid || ""]),
      Query.limit(70),
    ]);
    const p = r.documents as unknown as suggestedArtists[];
    return p;
  };
  const { data: SavedArtists } = useQuery("savedArtists", loadSavedArtists, {
    keepPreviousData: true,
    refetchOnMount: false,
    staleTime: Infinity,
  });
  const loadSavedProfiles = async () => {
    const r = await db.listDocuments(DATABASE_ID, FAV_PROFILES, [
      Query.orderDesc("$createdAt"),
      Query.equal("for", [uid || ""]),
      Query.limit(70),
    ]);
    const p = r.documents as unknown as savedProfile[];
    return p;
  };
  const { data: SavedProfiles } = useQuery("savedProfiles", loadSavedProfiles, {
    keepPreviousData: true,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  return { isLoading, savedPlaylist, SavedArtists, SavedProfiles, SavedAlbums };
}

export default useSaved;
