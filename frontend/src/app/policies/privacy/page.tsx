export const metadata = { title: "গোপনীয়তা নীতি" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-3xl font-semibold">গোপনীয়তা নীতি</h1>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        আপনার নাম, ফোন, ইমেইল ও ঠিকানা শুধুমাত্র অর্ডার প্রক্রিয়া ও যোগাযোগের
        জন্য ব্যবহার করা হয়। তৃতীয় পক্ষের কাছে বিক্রি করা হয় না। নিরাপদ
        সার্ভারে ডেটা সংরক্ষণ করা হয়।
      </p>
    </div>
  );
}
