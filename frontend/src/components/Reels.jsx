import React, { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Dialog, DialogContent } from './ui/dialog'
import { Bookmark, Heart, Loader2, MessageCircle, MoreHorizontal, Play, Send, Volume2, VolumeX } from 'lucide-react'
import { apiUrl, getUserId } from '@/lib/api'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'

const getInitial = (username = '') => username.trim().charAt(0).toUpperCase() || 'U';

const ReelCard = ({ reel, active, muted, onToggleMute, onForceMute, onLike, onOpenComments }) => {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const { user } = useSelector(store => store.auth);
  const userId = getUserId(user);
  const likes = Array.isArray(reel?.likes) ? reel.likes : [];
  const comments = Array.isArray(reel?.comments) ? reel.comments : [];
  const liked = likes.some((id) => String(id) === String(userId));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    if (active && !paused) {
      video.play().catch(() => {
        video.muted = true;
        onForceMute();
        video.play().catch(() => {});
      });
    } else {
      video.pause();
    }
  }, [active, muted, onForceMute, paused]);

  useEffect(() => {
    if (!active) setPaused(false);
  }, [active]);

  useEffect(() => {
    if (!active || !reel?._id) return;
    axios.post(apiUrl(`/api/v1/reel/${reel._id}/view`), {}, { withCredentials: true }).catch(() => {});
  }, [active, reel?._id]);

  const stopTouchAction = (event, action) => {
    event.preventDefault();
    event.stopPropagation();
    action();
  }

  const togglePause = () => {
    const video = videoRef.current;
    if (!video || !active) return;
    if (video.paused) {
      setPaused(false);
      video.play().catch(() => {});
    } else {
      setPaused(true);
      video.pause();
    }
  }

  return (
    <section className='relative flex h-[calc(100dvh-8.5rem)] min-h-[560px] snap-start items-center justify-center overflow-hidden bg-black md:h-[calc(100dvh-2rem)] md:min-h-[640px] lg:h-dvh'>
      <video
        ref={videoRef}
        src={reel?.video}
        loop
        playsInline
        preload='metadata'
        className='h-full w-full object-cover md:aspect-[9/16] md:h-[min(92dvh,760px)] md:w-auto md:rounded-[6px]'
      />

      <button
        type='button'
        onClick={togglePause}
        className='absolute inset-0 z-0 cursor-default bg-transparent'
        aria-label={paused ? 'Play reel' : 'Pause reel'}
      />

      <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10 md:mx-auto md:aspect-[9/16] md:h-[min(92dvh,760px)] md:rounded-[6px]' />

      {paused && (
        <div className='pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur'>
          <Play className='ml-1 h-8 w-8 fill-white' />
        </div>
      )}

      <button
        type='button'
        onClick={(event) => stopTouchAction(event, onToggleMute)}
        onTouchStart={(event) => event.stopPropagation()}
        className='absolute right-4 top-4 z-20 flex h-9 w-9 touch-manipulation items-center justify-center rounded-full bg-black/35 text-white backdrop-blur'
        aria-label={muted ? 'Unmute reel' : 'Mute reel'}
      >
        {muted ? <VolumeX className='h-5 w-5' /> : <Volume2 className='h-5 w-5' />}
      </button>

      <div className='pointer-events-none absolute bottom-5 left-4 right-20 z-10 text-white md:left-1/2 md:ml-[-165px] md:w-[260px]'>
        <div className='mb-3 flex min-w-0 items-center gap-3'>
          <Avatar className='h-9 w-9 border border-white/70'>
            <AvatarImage src={reel?.author?.profilePicture} />
            <AvatarFallback className='bg-gray-200 text-xs font-semibold text-gray-700'>{getInitial(reel?.author?.username)}</AvatarFallback>
          </Avatar>
          <span className='min-w-0 truncate text-sm font-bold'>{reel?.author?.username || 'instagram_user'}</span>
          <button type='button' className='pointer-events-auto h-7 touch-manipulation rounded-lg border border-white/70 px-3 text-xs font-bold'>Follow</button>
        </div>
        {reel?.caption && (
          <p className='line-clamp-2 break-words text-sm leading-5'>{reel.caption}</p>
        )}
      </div>

      <div className='absolute bottom-5 right-3 z-20 flex flex-col items-center gap-5 text-white md:left-1/2 md:right-auto md:ml-[178px]'>
        <button type='button' onClick={(event) => stopTouchAction(event, () => onLike(reel))} onTouchStart={(event) => event.stopPropagation()} className='flex touch-manipulation flex-col items-center gap-1'>
          <Heart className={`h-7 w-7 ${liked ? 'fill-red-500 text-red-500' : 'fill-transparent'}`} />
          <span className='text-xs font-bold'>{likes.length}</span>
        </button>
        <button type='button' onClick={(event) => stopTouchAction(event, () => onOpenComments(reel))} onTouchStart={(event) => event.stopPropagation()} className='flex touch-manipulation flex-col items-center gap-1'>
          <MessageCircle className='h-7 w-7' />
          <span className='text-xs font-bold'>{comments.length}</span>
        </button>
        <button type='button' onClick={(event) => stopTouchAction(event, () => toast.info("Share coming soon"))} onTouchStart={(event) => event.stopPropagation()} className='flex touch-manipulation flex-col items-center gap-1'>
          <Send className='h-7 w-7' />
        </button>
        <button type='button' onClick={(event) => stopTouchAction(event, () => toast.success("Saved"))} onTouchStart={(event) => event.stopPropagation()} className='flex touch-manipulation flex-col items-center gap-1'>
          <Bookmark className='h-7 w-7' />
        </button>
        <button type='button' onClick={(event) => stopTouchAction(event, () => {})} onTouchStart={(event) => event.stopPropagation()} className='flex h-9 w-9 touch-manipulation items-center justify-center rounded-full bg-black/35'>
          <MoreHorizontal className='h-6 w-6' />
        </button>
      </div>
    </section>
  )
}

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [activeReelId, setActiveReelId] = useState("");
  const [muted, setMuted] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);
  const [commentText, setCommentText] = useState("");
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const { user } = useSelector(store => store.auth);
  const userId = getUserId(user);

  const fetchReels = useCallback(async (nextPage = 1) => {
    try {
      if (nextPage === 1) setLoading(true);
      else setFetchingMore(true);
      const res = await axios.get(apiUrl(`/api/v1/reel/feed?page=${nextPage}&limit=6`), { withCredentials: true });
      if (res.data.success) {
        setReels((prev) => nextPage === 1 ? res.data.reels || [] : [...prev, ...(res.data.reels || [])]);
        setHasMore(Boolean(res.data.hasMore));
        setPage(nextPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load reels");
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchReels(1);
  }, [fetchReels]);

  useEffect(() => {
    if (reels.length && !activeReelId) setActiveReelId(reels[0]._id);
  }, [reels, activeReelId]);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveReelId(entry.target.dataset.reelId);
      });
    }, { threshold: 0.72 });

    document.querySelectorAll("[data-reel-id]").forEach((node) => observerRef.current.observe(node));
    return () => observerRef.current?.disconnect();
  }, [reels]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading || fetchingMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchReels(page + 1);
    }, { rootMargin: "500px" });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchReels, fetchingMore, hasMore, loading, page]);

  const likeReelHandler = async (reel) => {
    if (!reel?._id || !userId) return;
    const likes = Array.isArray(reel.likes) ? reel.likes.map(String) : [];
    const liked = likes.includes(String(userId));
    const action = liked ? "dislike" : "like";
    try {
      const res = await axios.get(apiUrl(`/api/v1/reel/${reel._id}/${action}`), { withCredentials: true });
      if (res.data.success) {
        setReels((items) => items.map((item) => {
          if (item._id !== reel._id) return item;
          return {
            ...item,
            likes: liked ? likes.filter((id) => id !== String(userId)) : [...likes, String(userId)],
          };
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  }

  const openComments = (reel) => {
    setSelectedReel(reel);
    setCommentOpen(true);
  }

  const addCommentHandler = async () => {
    if (!commentText.trim() || !selectedReel?._id) return;
    try {
      const res = await axios.post(apiUrl(`/api/v1/reel/${selectedReel._id}/comment`), { text: commentText }, { withCredentials: true });
      if (res.data.success) {
        const nextComments = [...(Array.isArray(selectedReel.comments) ? selectedReel.comments : []), res.data.comment];
        const nextReel = { ...selectedReel, comments: nextComments };
        setSelectedReel(nextReel);
        setReels((items) => items.map((item) => item._id === nextReel._id ? nextReel : item));
        setCommentText("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Comment failed");
    }
  }

  if (loading) {
    return (
      <div className='flex min-h-[calc(100dvh-8rem)] items-center justify-center bg-black text-white lg:min-h-dvh'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <main className='h-[calc(100dvh-8rem)] overflow-y-auto snap-y snap-mandatory bg-black md:h-[calc(100dvh-3.5rem)] lg:h-dvh'>
      {reels.length === 0 ? (
        <div className='flex h-full flex-col items-center justify-center px-6 text-center text-white'>
          <h1 className='text-xl font-bold'>No reels yet</h1>
          <p className='mt-2 max-w-sm text-sm text-white/70'>Create a reel from the Create button. Uploaded videos will appear here.</p>
        </div>
      ) : (
        reels.map((reel) => (
          <div key={reel._id} data-reel-id={reel._id}>
            <ReelCard
              reel={reel}
              active={activeReelId === reel._id}
              muted={muted}
              onToggleMute={() => setMuted((value) => !value)}
              onForceMute={() => setMuted(true)}
              onLike={likeReelHandler}
              onOpenComments={openComments}
            />
          </div>
        ))
      )}
      <div ref={sentinelRef} className='flex h-10 items-center justify-center bg-black text-white'>
        {fetchingMore && <Loader2 className='h-5 w-5 animate-spin' />}
      </div>

      <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
        <DialogContent className='!bottom-0 !left-0 !top-auto !w-full !max-w-none !translate-x-0 !translate-y-0 gap-0 overflow-hidden rounded-t-2xl border-0 p-0 shadow-2xl md:!left-1/2 md:!top-1/2 md:!max-w-md md:!-translate-x-1/2 md:!-translate-y-1/2 md:rounded-2xl'>
          <div className='flex max-h-[78dvh] min-h-[420px] flex-col bg-white'>
            <div className='border-b border-gray-200 px-4 py-3 text-center text-base font-bold'>Comments</div>
            <div className='min-h-0 flex-1 overflow-y-auto px-4 py-3'>
              {(selectedReel?.comments || []).length > 0 ? (
                selectedReel.comments.map((comment) => (
                  <div key={comment._id} className='flex gap-3 py-3'>
                    <Avatar className='h-8 w-8 shrink-0'>
                      <AvatarImage src={comment?.author?.profilePicture} />
                      <AvatarFallback>{getInitial(comment?.author?.username)}</AvatarFallback>
                    </Avatar>
                    <p className='min-w-0 break-words text-sm'>
                      <span className='font-semibold'>{comment?.author?.username}</span>
                      <span className='pl-1'>{comment?.text}</span>
                    </p>
                  </div>
                ))
              ) : (
                <div className='flex h-40 items-center justify-center text-sm text-gray-500'>No comments yet.</div>
              )}
            </div>
            <div className='flex items-center gap-3 border-t border-gray-200 px-4 py-3'>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCommentHandler()}
                className='min-w-0 flex-1 bg-transparent text-sm outline-none'
                placeholder='Add a comment...'
              />
              <Button disabled={!commentText.trim()} onClick={addCommentHandler} variant='ghost' className='h-8 px-0 font-semibold text-[#0095F6] hover:bg-transparent'>
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default Reels
