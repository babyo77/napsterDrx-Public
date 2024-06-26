import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SharePlay from "./components/SharePlay/SharePlay.tsx";
import Search from "./components/Search/Search.tsx";
import Library from "./components/Library/Library.tsx";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { store } from "./Store/Store.ts";
import { RememberLib } from "./components/Library/RememberLib.tsx";
import NotFound from "./components/404.tsx";
import AlbumPage from "./Artists/AlbumPage.tsx";
import ArtistPage from "./Artists/ArtistPage.tsx";
import ListenNow from "./components/ListenNow/ListenNow.tsx";
import LikedSong from "./LikedSongs/likedSongs.tsx";
import Suggested from "./Suggested/Suggested.tsx";
import Docs from "./Landing Page/Docs.tsx";
import Box from "./components/Tune Box/box.tsx";
import TuneBox from "./components/Tune Box/tunebox.tsx";
import Offline from "./Offline/offline.tsx";
import SavedEdits from "./Saved Edits/SavedEdits.tsx";
import ErrorElement from "./error.tsx";
import User from "./user/User.tsx";
import Track from "./Track/Track.tsx";
import Playlists from "./user/Playlists.tsx";
import Mode from "./Mode.tsx";
import Social from "./Social/Social.tsx";
import { Loader } from "./API/loader.ts";
import BrowseAll from "./BrowseAll/BrowseAll.tsx";
import EmbedUser from "./Embed/embedUser.tsx";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://ef15c84b7fde37656c126b7334cb8872@o4507323218526208.ingest.us.sentry.io/4507323219443712",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
const router = createBrowserRouter([
  {
    path: "/",
    element: <Mode />,
    errorElement: <ErrorElement />,
    loader: Loader,
    children: [
      {
        path: "",

        element: <ListenNow />,
      },
      {
        path: "/share-play",
        element: <SharePlay />,
      },
      {
        path: "/library",
        element: <RememberLib />,
      },
      {
        path: "/social",
        element: <Social />,
      },
      {
        path: "/library/:id",
        element: <Library />,
      },
      {
        path: "/artist/:id",
        element: <ArtistPage />,
      },
      {
        path: "/album/:id",
        element: <AlbumPage />,
      },
      {
        path: "/search",
        element: <Search />,
      },
      {
        path: "/liked/:id",
        element: <LikedSong />,
      },
      {
        path: "/edits/:id",
        element: <SavedEdits />,
      },
      {
        path: "/suggested",
        element: <Suggested />,
      },
      {
        path: "/tunebox/:id",
        element: <TuneBox />,
      },
      {
        path: "/suggested/:id",
        element: <Suggested />,
      },
      {
        path: "/offline/",
        element: <Offline />,
      },

      {
        path: "/track/:id",
        element: <Track />,
      },
      {
        path: "/playlist/:id",
        element: <Playlists />,
      },
      {
        path: "/profile/:id",
        element: <User app />,
      },
      {
        path: "/browse_all",
        element: <BrowseAll />,
      },
      {
        path: "*",
        element: <NotFound />,
        errorElement: <ErrorElement />,
      },
    ],
  },
  {
    path: "/docs/",
    element: <Docs />,
    errorElement: <ErrorElement />,
  },
  {
    path: "/user/:id",
    element: <User />,
    errorElement: <ErrorElement />,
  },
  {
    path: "/embed/user/:id",
    element: <EmbedUser />,
    errorElement: <ErrorElement />,
  },
  {
    path: "/playlists/:id",
    element: <Playlists />,
    errorElement: <ErrorElement />,
  },
  {
    path: "/box/:id",
    element: <Box />,
    errorElement: <ErrorElement />,
  },
]);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
