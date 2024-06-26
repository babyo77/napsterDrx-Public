import { RootState } from "@/Store/Store";
import { useCallback } from "react";
import { GoShare } from "react-icons/go";
import { useSelector } from "react-redux";
function Share({ className }: { className?: string }) {
  const uid = useSelector((state: RootState) => state.musicReducer.uid);

  const handleShare = useCallback(() => {
    if (className) {
      return;
    }
    if (uid) {
      navigator.share({
        url: window.location.href
          .replace("profile", "user")
          .replace(uid.substring(uid.length - 4), ""),
      });
    }
  }, [uid, className]);
  return (
    <div className="">
      <GoShare
        onClick={handleShare}
        className={`h-8 w-8 animate-fade-left backdrop-blur-md text-white bg-black/30 rounded-full p-1.5 ${className}`}
      />
    </div>
  );
}

export default Share;
