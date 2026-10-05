export const metadata = { title: "সাধারণ প্রশ্ন" };

const faqs = [
  {
    q: "ডেলিভারি কতদিনে হয়?",
    a: "ঢাকার ভিতরে সাধারণত ১–৩ কার্যদিবস, ঢাকার বাইরে ৩–৭ কার্যদিবস।",
  },
  {
    q: "কীভাবে পেমেন্ট করব?",
    a: "বর্তমানে শুধু Cash on Delivery (COD) — পণ্য হাতে পেয়ে টাকা দিবেন।",
  },
  {
    q: "রিটার্ন করা যায়?",
    a: "পণ্যে ত্রুটি থাকলে ডেলিভারির ৩ দিনের মধ্যে যোগাযোগ করুন। বিস্তারিত রিটার্ন নীতিতে আছে।",
  },
  {
    q: "স্টক আপডেট কীভাবে জানব?",
    a: "ওয়েবসাইটে স্টক স্ট্যাটাস দেখা যায়। প্রয়োজনে আমাদের মেসেজ করুন।",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display mb-8 text-3xl font-semibold">
        সাধারণ প্রশ্ন
      </h1>
      <div className="space-y-4">
        {faqs.map((f) => (
          <div
            key={f.q}
            className="rounded-craft-md border border-border bg-card p-5 shadow-organic"
          >
            <h2 className="font-semibold text-foreground">{f.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
