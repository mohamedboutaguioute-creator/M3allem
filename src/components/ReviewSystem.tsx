import React, { useState, useEffect } from 'react';
import { Star, Camera, Send, Loader2, User, MessageSquare } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  orderBy,
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface Review {
  id: string;
  artisanId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  timestamp: any;
}

interface ReviewSystemProps {
  artisanId: string;
  artisanName: string;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({ artisanId, artisanName }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!artisanId) return;

    const q = query(
      collection(db, 'reviews'),
      where('artisanId', '==', artisanId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      
      setReviews(fetchedReviews);
      
      if (fetchedReviews.length > 0) {
        const sum = fetchedReviews.reduce((acc, rev) => acc + rev.rating, 0);
        setAverageRating(Number((sum / fetchedReviews.length).toFixed(1)));
      } else {
        setAverageRating(0);
      }

      if (currentUser) {
        setHasReviewed(fetchedReviews.some(r => r.userId === currentUser.uid));
      }
      
      setFetching(false);
    }, (error) => {
      console.error('Error fetching reviews:', error);
      handleFirestoreError(error, OperationType.GET, 'reviews');
      setFetching(false);
    });

    return () => unsubscribe();
  }, [artisanId, currentUser]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('خصك تسجل الدخول باش تخلي تقييم');
      return;
    }

    if (rating === 0) {
      toast.error('عافاك اختار عدد النجوم');
      return;
    }

    if (!comment.trim()) {
      toast.error('عافاك خلي تعليق');
      return;
    }

    setLoading(true);
    try {
      // In a real app, we would upload the image to Firebase Storage here
      // For now, we'll use the preview URL if available, or a placeholder
      let imageUrl = '';
      if (imagePreview) {
        imageUrl = imagePreview; // This is a base64 string, not ideal for production but works for demo
      }

      const reviewData = {
        artisanId,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'مستخدم مجهول',
        userAvatar: currentUser.photoURL || '',
        rating,
        comment,
        imageUrl,
        timestamp: serverTimestamp(),
      };

      // Use a unique ID to prevent duplicate reviews: userId_artisanId
      const reviewId = `${currentUser.uid}_${artisanId}`;
      await setDoc(doc(db, 'reviews', reviewId), reviewData);

      // Update artisan's average rating and count
      const artisanRef = doc(db, 'users', artisanId);
      const artisanDoc = await getDoc(artisanRef);
      
      if (artisanDoc.exists()) {
        const data = artisanDoc.data();
        const currentCount = data.review_count || 0;
        const currentRating = data.rating || 0;
        
        // Simple moving average calculation
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + rating) / newCount;
        
        await updateDoc(artisanRef, {
          rating: Number(newRating.toFixed(1)),
          review_count: newCount
        });
      }

      toast.success('شكرا على التقييم ديالك!');
      setRating(0);
      setComment('');
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      handleFirestoreError(error, OperationType.WRITE, 'reviews');
      toast.error('وقع مشكل فاش بغينا نسجلو التقييم ديالك');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  return (
    <div className="space-y-12 text-right" dir="rtl">
      {/* Summary Section */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-right">
            <h3 className="text-2xl font-black text-slate-900 mb-2">تقييمات الزبناء</h3>
            <p className="text-slate-500">شنو كيقولو الناس على {artisanName}</p>
          </div>
          
          <div className="flex items-center gap-6 bg-slate-50 px-8 py-6 rounded-3xl">
            <div className="text-center">
              <div className="text-4xl font-black text-[#1E3A8A] mb-1">{averageRating}</div>
              <div className="flex gap-1 justify-center mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={cn(
                      "w-4 h-4",
                      star <= Math.round(averageRating) ? "fill-[#F59E0B] text-[#F59E0B]" : "text-slate-300"
                    )} 
                  />
                ))}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {reviews.length} تقييم
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {!hasReviewed && currentUser && currentUser.uid !== artisanId && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-[#F59E0B]" />
            خلي التقييم ديالك
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">شحال كتعطيه من نجمة؟</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star 
                      className={cn(
                        "w-10 h-10 transition-colors",
                        star <= (hover || rating) ? "fill-[#F59E0B] text-[#F59E0B]" : "text-slate-200"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">التعليق ديالك</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="كيفاش كانت التجربة ديالك مع هاد الحريفي؟"
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all min-h-[150px] font-medium"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">صورة للخدمة (اختياري)</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors font-bold text-slate-600">
                  <Camera className="w-5 h-5" />
                  اختار صورة
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreview && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => { setImage(null); setImagePreview(null); }}
                      className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                    >
                      <Star className="w-3 h-3 rotate-45" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E3A8A] hover:bg-[#162a63] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  نشر التقييم
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
          <Star className="w-6 h-6 text-[#F59E0B]" />
          كاع التقييمات ({reviews.length})
        </h4>

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center border border-slate-200">
                      {review.userAvatar ? (
                        <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-black text-slate-900">{review.userName}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {review.timestamp?.toDate ? review.timestamp.toDate().toLocaleDateString('ar-MA') : 'دابا'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={cn(
                          "w-4 h-4",
                          star <= review.rating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-slate-200"
                        )} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed font-medium mb-4">
                  {review.comment}
                </p>

                {review.imageUrl && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 max-w-sm">
                    <img 
                      src={review.imageUrl} 
                      alt="Service proof" 
                      className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {reviews.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">مازال ما كاين حتى تقييم لهاد الحريفي.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
