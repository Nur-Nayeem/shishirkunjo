export const metadata = { title: "ডেলিভারি নীতি" };

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 prose-sm">
      <h1 className="font-display text-3xl font-semibold text-foreground">
        ডেলিভারি নীতি
      </h1>
      <div className="mt-6 space-y-4 text-muted leading-relaxed">
        <p>
          আমরা সারা বাংলাদেশে ডেলিভারি দিয়ে থাকি। ঢাকার ভিতরে ও বাইরের চার্জ
          আলাদা — চেকআউটে স্বয়ংক্রিয়ভাবে হিসাব হয়।
        </p>
        <p>
          অর্ডার কনফার্ম হওয়ার পর সাধারণত ১–৭ কার্যদিবসের মধ্যে পণ্য পৌঁছে
          যায়। বিশেষ ছুটির দিনে সময় বাড়তে পারে।
        </p>
        <p>পেমেন্ট: ক্যাশ অন ডেলিভারি (COD)।</p>
      </div>
    </div>
  );
}
